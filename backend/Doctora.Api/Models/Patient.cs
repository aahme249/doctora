using System.ComponentModel.DataAnnotations.Schema;

namespace Doctora.Api.Models;

public class Patient
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string DateOfBirth { get; set; } = "";
    public string Gender { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string Address { get; set; } = "";
    public string BloodType { get; set; } = "";
    public string[] Allergies { get; set; } = [];
    public string[] Conditions { get; set; } = [];
    public string CreatedAt { get; set; } = "";

    /// <summary>Computed at read time from the accounts table; not a real column.</summary>
    [NotMapped]
    public bool HasAccount { get; set; }
}
