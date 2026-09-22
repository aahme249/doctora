using System.Security.Claims;
using System.Text.Json;
using Doctora.Api.Data;
using Doctora.Api.Models;
using Doctora.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    string? DateOfBirth,
    string? Gender,
    string? Phone,
    string? BloodType
);

public record UserDto(string Id, string Email, string Role, string Name, string? PatientId);
public record AuthResponse(string Token, UserDto User);
public record AcceptInviteRequest(string Token, string Password);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var auth = app.MapGroup("/api/auth");

        auth.MapPost("/login", async (LoginRequest req, DoctoraDbContext db, JwtService jwt) =>
        {
            var account = await db.Accounts.FirstOrDefaultAsync(a => a.Email == req.Email.ToLower());
            if (account is null || !BCrypt.Net.BCrypt.Verify(req.Password, account.PasswordHash))
            {
                return Results.Json(new { error = "Invalid email or password." }, statusCode: 401);
            }

            var token = jwt.IssueToken(account);
            return Results.Ok(new AuthResponse(token, ToDto(account)));
        }).AllowAnonymous();

        auth.MapPost("/register", async (RegisterRequest req, DoctoraDbContext db, JwtService jwt, EmailService email) =>
        {
            var normalizedEmail = req.Email.ToLower();
            if (await db.Accounts.AnyAsync(a => a.Email == normalizedEmail))
            {
                return Results.Json(new { error = "An account with this email already exists." }, statusCode: 400);
            }
            if (string.IsNullOrEmpty(req.Password) || req.Password.Length < 6)
            {
                return Results.Json(new { error = "Password must be at least 6 characters." }, statusCode: 400);
            }

            var now = DateTime.UtcNow.ToString("o");
            var patient = new Patient
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = req.Name,
                DateOfBirth = string.IsNullOrEmpty(req.DateOfBirth) ? "2000-01-01" : req.DateOfBirth,
                Gender = req.Gender ?? "Other",
                Phone = req.Phone ?? "",
                Email = normalizedEmail,
                Address = "",
                BloodType = req.BloodType ?? "O+",
                Allergies = [],
                Conditions = [],
                CreatedAt = now,
            };

            var account = new Account
            {
                Id = Guid.NewGuid().ToString("N"),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "patient",
                Name = req.Name,
                PatientId = patient.Id,
                CreatedAt = now,
            };

            await using var transaction = await db.Database.BeginTransactionAsync();
            db.Patients.Add(patient);
            db.Accounts.Add(account);
            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            if (email.IsConfigured)
            {
                try
                {
                    var payloadJson = JsonSerializer.Serialize(new { name = account.Name });
                    using var doc = JsonDocument.Parse(payloadJson);
                    var rendered = EmailTemplates.Render(new EmailPayload("welcome", doc.RootElement.Clone()));
                    if (rendered is not null)
                    {
                        await email.SendAsync(account.Email, rendered.Value.Subject, rendered.Value.Html);
                    }
                }
                catch
                {
                    // Welcome email is best-effort; registration already succeeded.
                }
            }

            var token = jwt.IssueToken(account);
            return Results.Ok(new AuthResponse(token, ToDto(account)));
        }).AllowAnonymous();

        auth.MapPost("/accept-invite", async (AcceptInviteRequest req, DoctoraDbContext db, JwtService jwt) =>
        {
            var invite = await db.Invites.FindAsync(req.Token);
            if (invite is null || invite.UsedAt is not null || DateTime.Parse(invite.ExpiresAt) < DateTime.UtcNow)
            {
                return Results.Json(new { error = "This invite link is invalid or has expired." }, statusCode: 410);
            }
            if (string.IsNullOrEmpty(req.Password) || req.Password.Length < 6)
            {
                return Results.Json(new { error = "Password must be at least 6 characters." }, statusCode: 400);
            }
            if (await db.Accounts.AnyAsync(a => a.Email == invite.Email))
            {
                return Results.Json(new { error = "An account with this email already exists." }, statusCode: 400);
            }

            var patient = await db.Patients.FindAsync(invite.PatientId);
            if (patient is null)
            {
                return Results.Json(new { error = "The patient record for this invite no longer exists." }, statusCode: 410);
            }

            var account = new Account
            {
                Id = Guid.NewGuid().ToString("N"),
                Email = invite.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "patient",
                Name = patient.Name,
                PatientId = patient.Id,
                CreatedAt = DateTime.UtcNow.ToString("o"),
            };

            invite.UsedAt = DateTime.UtcNow.ToString("o");
            db.Accounts.Add(account);
            await db.SaveChangesAsync();

            var token = jwt.IssueToken(account);
            return Results.Ok(new AuthResponse(token, ToDto(account)));
        }).AllowAnonymous();

        auth.MapGet("/me", async (ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            var id = user.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            var account = id is null ? null : await db.Accounts.FindAsync(id);
            return account is null ? Results.Unauthorized() : Results.Ok(ToDto(account));
        }).RequireAuthorization();
    }

    private static UserDto ToDto(Account a) => new(a.Id, a.Email, a.Role, a.Name, a.PatientId);
}
