namespace Doctora.Api.Models;

public class Message
{
    public string Id { get; set; } = "";
    public string PatientId { get; set; } = "";
    public string SenderRole { get; set; } = "";
    public string Body { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public bool IsRead { get; set; }
}
