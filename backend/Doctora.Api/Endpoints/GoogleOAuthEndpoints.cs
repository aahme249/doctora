using Doctora.Api.Services;

namespace Doctora.Api.Endpoints;

public static class GoogleOAuthEndpoints
{
    public static void MapGoogleOAuthEndpoints(this WebApplication app)
    {
        var google = app.MapGroup("/api/google");

        google.MapGet("/connect", (GoogleCalendarService calendar) =>
            calendar.IsConfigured
                ? Results.Redirect(calendar.BuildAuthUrl())
                : Results.Json(new { error = "Google Calendar integration is not configured on the server yet." }, statusCode: 503)
        ).RequireAuthorization("DoctorOnly");

        google.MapGet("/callback", async (string? code, GoogleCalendarService calendar, IConfiguration config) =>
        {
            var frontendOrigin = (config["FRONTEND_ORIGIN"] ?? "http://localhost:3000").Split(',')[0].Trim();
            if (string.IsNullOrEmpty(code))
            {
                return Results.Redirect($"{frontendOrigin}/?google=error");
            }

            var ok = await calendar.ExchangeCodeAsync(code);
            return Results.Redirect($"{frontendOrigin}/?google={(ok ? "connected" : "error")}");
        }).AllowAnonymous();

        google.MapGet("/status", async (GoogleCalendarService calendar) =>
            Results.Ok(new { connected = await calendar.IsConnectedAsync() })
        ).RequireAuthorization("DoctorOnly");
    }
}
