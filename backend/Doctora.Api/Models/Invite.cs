namespace Doctora.Api.Models;

public class Invite
{
    public string Token { get; set; } = "";
    public string PatientId { get; set; } = "";
    public string Email { get; set; } = "";
    public string ExpiresAt { get; set; } = "";
    public string? UsedAt { get; set; }
    public string CreatedAt { get; set; } = "";
}
