using System.Security.Claims;
using Doctora.Api.Data;
using Doctora.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public record SendMessageRequest(string PatientId, string Body);

public static class MessageEndpoints
{
    public static void MapMessageEndpoints(this WebApplication app)
    {
        var messages = app.MapGroup("/api/messages").RequireAuthorization();

        messages.MapGet("/{patientId}", async (string patientId, ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            if (!user.IsInRole("doctor") && user.FindFirstValue("patientId") != patientId)
            {
                return Results.Forbid();
            }

            var thread = await db.Messages
                .Where(m => m.PatientId == patientId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
            return Results.Ok(thread);
        });

        messages.MapPost("/", async (SendMessageRequest req, ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            var isDoctor = user.IsInRole("doctor");
            var patientId = isDoctor ? req.PatientId : user.FindFirstValue("patientId");

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

            return Results.Ok(message);
        });
    }
}
