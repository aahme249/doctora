using System.Security.Claims;
using System.Text.Json;
using Doctora.Api.Data;
using Doctora.Api.Models;
using Doctora.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public record SendMessageRequest(string PatientId, string Body);

public static class MessageEndpoints
{
    private static string? OwnPatientId(ClaimsPrincipal user) => user.FindFirstValue("patientId");

    public static void MapMessageEndpoints(this WebApplication app)
    {
        var messages = app.MapGroup("/api/messages").RequireAuthorization();

        messages.MapGet("/unread-count", async (ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            int count;
            if (user.IsInRole("doctor"))
            {
                count = await db.Messages.CountAsync(m => m.SenderRole == "patient" && !m.IsRead);
            }
            else
            {
                var ownId = OwnPatientId(user);
                count = await db.Messages.CountAsync(m => m.PatientId == ownId && m.SenderRole == "doctor" && !m.IsRead);
            }
            return Results.Ok(new { count });
        });

        messages.MapGet("/unread-by-patient", async (DoctoraDbContext db) =>
        {
            var counts = await db.Messages
                .Where(m => m.SenderRole == "patient" && !m.IsRead)
                .GroupBy(m => m.PatientId)
                .Select(g => new { patientId = g.Key, count = g.Count() })
                .ToListAsync();
            return Results.Ok(counts);
        }).RequireAuthorization("DoctorOnly");

        messages.MapGet("/{patientId}", async (string patientId, ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            var isDoctor = user.IsInRole("doctor");
            if (!isDoctor && OwnPatientId(user) != patientId)
            {
                return Results.Forbid();
            }

            var thread = await db.Messages
                .Where(m => m.PatientId == patientId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var otherPartyRole = isDoctor ? "patient" : "doctor";
            var unread = thread.Where(m => m.SenderRole == otherPartyRole && !m.IsRead).ToList();
            if (unread.Count > 0)
            {
                foreach (var m in unread) m.IsRead = true;
                await db.SaveChangesAsync();
            }

            return Results.Ok(thread);
        });

        messages.MapPost("/", async (SendMessageRequest req, ClaimsPrincipal user, DoctoraDbContext db, EmailService email, IConfiguration config) =>
        {
            var isDoctor = user.IsInRole("doctor");
            var patientId = isDoctor ? req.PatientId : OwnPatientId(user);

            if (string.IsNullOrEmpty(patientId))
            {
                return Results.BadRequest(new { error = "Missing patientId." });
            }
            if (!isDoctor && patientId != req.PatientId)
            {
                return Results.Forbid();
            }
            if (string.IsNullOrWhiteSpace(req.Body))
            {
                return Results.BadRequest(new { error = "Message cannot be empty." });
            }

            var message = new Message
            {
                Id = Guid.NewGuid().ToString("N"),
                PatientId = patientId,
                SenderRole = isDoctor ? "doctor" : "patient",
                Body = req.Body.Trim(),
                CreatedAt = DateTime.UtcNow.ToString("o"),
            };
            db.Messages.Add(message);
            await db.SaveChangesAsync();

            if (email.IsConfigured)
            {
                try
                {
                    var frontendOrigin = (config["FRONTEND_ORIGIN"] ?? "http://localhost:3000").Split(',')[0].Trim();
                    var preview = message.Body.Length > 140 ? message.Body[..140] + "…" : message.Body;

                    string? recipientEmail;
                    string recipientName;
                    string senderLabel;
                    string link;

                    if (isDoctor)
                    {
                        var patient = await db.Patients.FindAsync(patientId);
                        recipientEmail = patient?.Email;
                        recipientName = patient?.Name ?? "";
                        var doctorAccount = await db.Accounts.FirstOrDefaultAsync(a => a.Role == "doctor");
                        senderLabel = doctorAccount?.Name ?? "your doctor";
                        link = $"{frontendOrigin}/portal/messages";
                    }
                    else
                    {
                        var doctorAccount = await db.Accounts.FirstOrDefaultAsync(a => a.Role == "doctor");
                        recipientEmail = doctorAccount?.Email;
                        recipientName = doctorAccount?.Name ?? "";
                        var patient = await db.Patients.FindAsync(patientId);
                        senderLabel = patient?.Name ?? "a patient";
                        link = $"{frontendOrigin}/messages/{patientId}";
                    }

                    if (!string.IsNullOrEmpty(recipientEmail))
                    {
                        var payloadJson = JsonSerializer.Serialize(new { recipientName, senderLabel, preview, link });
                        using var doc = JsonDocument.Parse(payloadJson);
                        var rendered = EmailTemplates.Render(new EmailPayload("new_message", doc.RootElement.Clone()));
                        if (rendered is not null)
                        {
                            await email.SendAsync(recipientEmail, rendered.Value.Subject, rendered.Value.Html);
                        }
                    }
                }
                catch
                {
                    // New-message email is best-effort; the message itself already sent successfully.
                }
            }

            return Results.Ok(message);
        });
    }
}
