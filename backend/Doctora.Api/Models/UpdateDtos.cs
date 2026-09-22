namespace Doctora.Api.Models;

public class PatientUpdate
{
    public string? Name { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? BloodType { get; set; }
    public string[]? Allergies { get; set; }
    public string[]? Conditions { get; set; }

    public void ApplyTo(Patient p)
    {
        if (Name is not null) p.Name = Name;
        if (DateOfBirth is not null) p.DateOfBirth = DateOfBirth;
        if (Gender is not null) p.Gender = Gender;
        if (Phone is not null) p.Phone = Phone;
        if (Email is not null) p.Email = Email;
        if (Address is not null) p.Address = Address;
        if (BloodType is not null) p.BloodType = BloodType;
        if (Allergies is not null) p.Allergies = Allergies;
        if (Conditions is not null) p.Conditions = Conditions;
    }
}

public class AppointmentUpdate
{
    public string? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }

    /// <summary>True if this update touches nothing besides Status — the only field a patient may self-edit.</summary>
    public bool IsStatusOnly =>
        PatientId is null && PatientName is null && Date is null && Time is null && Type is null && Notes is null;

    public void ApplyTo(Appointment a)
    {
        if (PatientId is not null) a.PatientId = PatientId;
        if (PatientName is not null) a.PatientName = PatientName;
        if (Date is not null) a.Date = Date;
        if (Time is not null) a.Time = Time;
        if (Type is not null) a.Type = Type;
        if (Status is not null) a.Status = Status;
        if (Notes is not null) a.Notes = Notes;
    }
}

public class RecordUpdate
{
    public string? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? Date { get; set; }
    public string? Diagnosis { get; set; }
    public string? Symptoms { get; set; }
    public string? Treatment { get; set; }
    public string? Medications { get; set; }
    public string? Notes { get; set; }
    public string? FollowUp { get; set; }

    public void ApplyTo(MedicalRecord r)
    {
        if (PatientId is not null) r.PatientId = PatientId;
        if (PatientName is not null) r.PatientName = PatientName;
        if (Date is not null) r.Date = Date;
        if (Diagnosis is not null) r.Diagnosis = Diagnosis;
        if (Symptoms is not null) r.Symptoms = Symptoms;
        if (Treatment is not null) r.Treatment = Treatment;
        if (Medications is not null) r.Medications = Medications;
        if (Notes is not null) r.Notes = Notes;
        if (FollowUp is not null) r.FollowUp = FollowUp;
    }
}

public class AppointmentRequestUpdate
{
    public string? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string? Type { get; set; }
    public string? Reason { get; set; }
    public string? Urgency { get; set; }
    public string? Status { get; set; }
    public AgentAnalysis? AgentAnalysis { get; set; }
    public string? AgentStatus { get; set; }
    public string? ReviewNotes { get; set; }
    public string? ReviewedAt { get; set; }

    public void ApplyTo(AppointmentRequest r)
    {
        if (PatientId is not null) r.PatientId = PatientId;
        if (PatientName is not null) r.PatientName = PatientName;
        if (PreferredDate is not null) r.PreferredDate = PreferredDate;
        if (PreferredTime is not null) r.PreferredTime = PreferredTime;
        if (Type is not null) r.Type = Type;
        if (Reason is not null) r.Reason = Reason;
        if (Urgency is not null) r.Urgency = Urgency;
        if (Status is not null) r.Status = Status;
        if (AgentAnalysis is not null) r.AgentAnalysis = AgentAnalysis;
        if (AgentStatus is not null) r.AgentStatus = AgentStatus;
        if (ReviewNotes is not null) r.ReviewNotes = ReviewNotes;
        if (ReviewedAt is not null) r.ReviewedAt = ReviewedAt;
    }
}
