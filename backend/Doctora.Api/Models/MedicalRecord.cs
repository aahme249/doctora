namespace Doctora.Api.Models;

public class MedicalRecord
{
    public string Id { get; set; } = "";
    public string PatientId { get; set; } = "";
    public string PatientName { get; set; } = "";
    public string Date { get; set; } = "";
    public string Diagnosis { get; set; } = "";
    public string Symptoms { get; set; } = "";
    public string Treatment { get; set; } = "";
    public string Medications { get; set; } = "";
    public string Notes { get; set; } = "";
    public string FollowUp { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}
