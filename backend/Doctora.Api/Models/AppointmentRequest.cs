namespace Doctora.Api.Models;

public class AgentAnalysis
{
    public string IntakeNotes { get; set; } = "";
    public string SchedulingSuggestion { get; set; } = "";
    public string TriagePriority { get; set; } = "";
    public string SupervisorSummary { get; set; } = "";
    public string? AppointmentNotes { get; set; }
}

public class AppointmentRequest
{
    public string Id { get; set; } = "";
    public string PatientId { get; set; } = "";
    public string PatientName { get; set; } = "";
    public string PreferredDate { get; set; } = "";
    public string PreferredTime { get; set; } = "";
    public string Type { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Urgency { get; set; } = "normal";
    public string Status { get; set; } = "pending";
    public AgentAnalysis? AgentAnalysis { get; set; }
    public string AgentStatus { get; set; } = "pending";
    public string? ReviewNotes { get; set; }
    public string CreatedAt { get; set; } = "";
    public string? ReviewedAt { get; set; }
}
