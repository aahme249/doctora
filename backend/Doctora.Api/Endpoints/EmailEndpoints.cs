using Doctora.Api.Services;

namespace Doctora.Api.Endpoints;

public static class EmailEndpoints
{
    public static void MapEmailEndpoints(this WebApplication app)
    {
        app.MapPost("/api/email", async (EmailRequest body, EmailService email) =>
        {
            if (!email.IsConfigured)
                return Results.Ok(new { ok = true, skipped = true });

            if (string.IsNullOrEmpty(body.To))
                return Results.BadRequest(new { error = "Missing to or payload" });

            var rendered = EmailTemplates.Render(body.Payload);
            if (rendered is null)
                return Results.BadRequest(new { error = "Unknown email type" });

            try
            {
                await email.SendAsync(body.To, rendered.Value.Subject, rendered.Value.Html);
                return Results.Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: 500);
            }
        }).RequireAuthorization();
    }
}
