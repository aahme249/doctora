using System.Text.Json;
using Doctora.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Services;

/// <summary>
/// Periodically emails a reminder for tomorrow's scheduled appointments.
/// Runs on a timer since there's no external scheduler in front of this API.
/// </summary>
public class AppointmentReminderService(
    IServiceScopeFactory scopeFactory,
    IConfiguration config,
    ILogger<AppointmentReminderService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = config.GetValue<int?>("Reminders:IntervalMinutes") ?? 60;
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(intervalMinutes));

        do
        {
            try
            {
                await SendDueRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Appointment reminder sweep failed.");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task SendDueRemindersAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DoctoraDbContext>();
        var email = scope.ServiceProvider.GetRequiredService<EmailService>();

        if (!email.IsConfigured) return;

        var tomorrow = DateTime.UtcNow.Date.AddDays(1).ToString("yyyy-MM-dd");

        var due = await db.Appointments
            .Where(a => a.Date == tomorrow && a.Status == "scheduled" && !a.ReminderSent)
            .ToListAsync(ct);

        foreach (var appt in due)
        {
            var patient = await db.Patients.FindAsync([appt.PatientId], ct);
            if (patient is null || string.IsNullOrEmpty(patient.Email)) continue;

            try
            {
                var prettyDate = DateTime.TryParse(appt.Date, out var parsedDate)
                    ? parsedDate.ToString("MMMM d, yyyy")
                    : appt.Date;
                var payloadJson = JsonSerializer.Serialize(new
                {
                    name = appt.PatientName,
                    date = prettyDate,
                    time = appt.Time,
                    type = appt.Type,
                    notes = appt.Notes,
                });
                using var doc = JsonDocument.Parse(payloadJson);
                var rendered = EmailTemplates.Render(new EmailPayload("appointment_reminder", doc.RootElement.Clone()));
                if (rendered is not null)
                {
                    await email.SendAsync(patient.Email, rendered.Value.Subject, rendered.Value.Html);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send reminder for appointment {AppointmentId}", appt.Id);
                continue;
            }

            appt.ReminderSent = true;
        }

        if (due.Count > 0) await db.SaveChangesAsync(ct);
    }
}
