using System.Text.Json;
using Doctora.Api.Data;
using Doctora.Api.Models;
using Doctora.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public record CreateInviteRequest(string PatientId);
public record InviteInfo(string Name, string Email);

public static class InviteEndpoints
{
    public static void MapInviteEndpoints(this WebApplication app)
    {
        var invites = app.MapGroup("/api/invites");

        invites.MapPost("/", async (CreateInviteRequest req, DoctoraDbContext db, EmailService email, IConfiguration config) =>
        {
            var patient = await db.Patients.FindAsync(req.PatientId);
            if (patient is null) return Results.NotFound(new { error = "Patient not found." });
            if (string.IsNullOrEmpty(patient.Email))
                return Results.Json(new { error = "This patient has no email address on file." }, statusCode: 400);
            if (await db.Accounts.AnyAsync(a => a.Email == patient.Email.ToLower()))
                return Results.Json(new { error = "This patient already has a portal account." }, statusCode: 400);

            var now = DateTime.UtcNow;
            var invite = new Invite
            {
                Token = Guid.NewGuid().ToString("N"),
                PatientId = patient.Id,
                Email = patient.Email.ToLower(),
                ExpiresAt = now.AddDays(7).ToString("o"),
                CreatedAt = now.ToString("o"),
            };
            db.Invites.Add(invite);
            await db.SaveChangesAsync();

            if (email.IsConfigured)
            {
                var frontendOrigin = (config["FRONTEND_ORIGIN"] ?? "http://localhost:3000").Split(',')[0].Trim();
                var inviteUrl = $"{frontendOrigin}/accept-invite?token={invite.Token}";
                var payloadJson = JsonSerializer.Serialize(new { name = patient.Name, inviteUrl });
                using var doc = JsonDocument.Parse(payloadJson);
                var rendered = EmailTemplates.Render(new EmailPayload("patient_invite", doc.RootElement.Clone()));
                if (rendered is not null)
                {
                    await email.SendAsync(patient.Email, rendered.Value.Subject, rendered.Value.Html);
                }
            }

            return Results.Ok(new { ok = true });
        }).RequireAuthorization("DoctorOnly");

        invites.MapGet("/{token}", async (string token, DoctoraDbContext db) =>
        {
            var invite = await db.Invites.FindAsync(token);
            if (invite is null || invite.UsedAt is not null || DateTime.Parse(invite.ExpiresAt) < DateTime.UtcNow)
            {
                return Results.Json(new { error = "This invite link is invalid or has expired." }, statusCode: 410);
            }
            var patient = await db.Patients.FindAsync(invite.PatientId);
            if (patient is null) return Results.Json(new { error = "Invite is no longer valid." }, statusCode: 410);
            return Results.Ok(new InviteInfo(patient.Name, patient.Email));
        }).AllowAnonymous();
    }
}
