namespace Doctora.Api.Models;

public class Account
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "patient";
    public string Name { get; set; } = "";
    public string? PatientId { get; set; }
    public string CreatedAt { get; set; } = "";
    public string? GoogleRefreshToken { get; set; }
}
