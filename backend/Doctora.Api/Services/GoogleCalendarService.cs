using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Doctora.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Services;

/// <summary>
/// Creates Google Calendar events with a Google Meet link attached, using a one-time
/// OAuth "connect your calendar" grant from the doctor (stored as a refresh token).
/// </summary>
public class GoogleCalendarService(IConfiguration config, IHttpClientFactory httpClientFactory, DoctoraDbContext db, ILogger<GoogleCalendarService> logger)
{
    public bool IsConfigured =>
        !string.IsNullOrEmpty(config["Google:ClientId"]) &&
        !string.IsNullOrEmpty(config["Google:ClientSecret"]) &&
        !string.IsNullOrEmpty(config["Google:RedirectUri"]);

    public string BuildAuthUrl()
    {
        var clientId = config["Google:ClientId"]!;
        var redirectUri = config["Google:RedirectUri"]!;
        var scope = Uri.EscapeDataString("https://www.googleapis.com/auth/calendar.events");
        return "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(clientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            "&response_type=code" +
            $"&scope={scope}" +
            "&access_type=offline" +
            "&prompt=consent";
    }

    public async Task<bool> ExchangeCodeAsync(string code, CancellationToken ct = default)
    {
        var client = httpClientFactory.CreateClient();
        var form = new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = config["Google:ClientId"]!,
            ["client_secret"] = config["Google:ClientSecret"]!,
            ["redirect_uri"] = config["Google:RedirectUri"]!,
            ["grant_type"] = "authorization_code",
        };

        var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(form), ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Google token exchange failed ({Status}): {Body}", response.StatusCode, body);
            return false;
        }

        var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(body);
        if (tokenResponse?.RefreshToken is null)
        {
            logger.LogError("Google token exchange did not return a refresh token. Body: {Body}", body);
            return false;
        }

        var doctor = await db.Accounts.FirstOrDefaultAsync(a => a.Role == "doctor", ct);
        if (doctor is null) return false;

        doctor.GoogleRefreshToken = tokenResponse.RefreshToken;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> IsConnectedAsync(CancellationToken ct = default)
    {
        var doctor = await db.Accounts.FirstOrDefaultAsync(a => a.Role == "doctor", ct);
        return !string.IsNullOrEmpty(doctor?.GoogleRefreshToken);
    }

    private async Task<string?> GetAccessTokenAsync(CancellationToken ct)
    {
        var doctor = await db.Accounts.FirstOrDefaultAsync(a => a.Role == "doctor", ct);
        if (string.IsNullOrEmpty(doctor?.GoogleRefreshToken)) return null;

        var client = httpClientFactory.CreateClient();
        var form = new Dictionary<string, string>
        {
            ["refresh_token"] = doctor.GoogleRefreshToken,
            ["client_id"] = config["Google:ClientId"]!,
            ["client_secret"] = config["Google:ClientSecret"]!,
            ["grant_type"] = "refresh_token",
        };

        var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(form), ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Google token refresh failed ({Status}): {Body}", response.StatusCode, body);
            return null;
        }

        return JsonSerializer.Deserialize<GoogleTokenResponse>(body)?.AccessToken;
    }

    /// <summary>Creates a calendar event with a Google Meet link and returns the join URL, or null on failure.</summary>
    public async Task<string?> CreateMeetingAsync(string topic, string date, string time, CancellationToken ct = default)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync(ct);
            if (accessToken is null) return null;

            var startLocal = $"{date}T{time}:00";
            var start = DateTime.Parse(startLocal);
            var end = start.AddMinutes(30);

            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var payload = new
            {
                summary = topic,
                start = new { dateTime = start.ToString("yyyy-MM-ddTHH:mm:ss") },
                end = new { dateTime = end.ToString("yyyy-MM-ddTHH:mm:ss") },
                conferenceData = new
                {
                    createRequest = new
                    {
                        requestId = Guid.NewGuid().ToString("N"),
                        conferenceSolutionKey = new { type = "hangoutsMeet" },
                    },
                },
            };

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"),
            };

            var response = await client.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Google Calendar event creation failed ({Status}): {Body}", response.StatusCode, body);
                return null;
            }

            var eventResponse = JsonSerializer.Deserialize<GoogleEventResponse>(body);
            return eventResponse?.HangoutLink;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Google Meet creation threw an exception.");
            return null;
        }
    }

    private record GoogleTokenResponse(
        [property: JsonPropertyName("access_token")] string? AccessToken,
        [property: JsonPropertyName("refresh_token")] string? RefreshToken
    );

    private record GoogleEventResponse(
        [property: JsonPropertyName("hangoutLink")] string? HangoutLink
    );
}
