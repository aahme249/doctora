namespace Doctora.Api.Models;

public class Appointment
{
    public string Id { get; set; } = "";
    public string PatientId { get; set; } = "";
    public string PatientName { get; set; } = "";
    public string Date { get; set; } = "";
    public string Time { get; set; } = "";
    public string Type { get; set; } = "";
    public string Status { get; set; } = "scheduled";
    public string Notes { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public bool ReminderSent { get; set; }
    public string? MeetingUrl { get; set; }
}
