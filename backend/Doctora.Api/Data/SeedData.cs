using Doctora.Api.Models;

namespace Doctora.Api.Data;

public static class SeedData
{
    public static readonly Patient[] Patients =
    [
        new() { Id = "p1", Name = "Sarah Johnson", DateOfBirth = "1985-03-15", Gender = "Female", Phone = "+1 (555) 234-5678", Email = "sarah.johnson@email.com", Address = "123 Maple St, Boston, MA 02101", BloodType = "A+", Allergies = ["Penicillin", "Sulfa drugs"], Conditions = ["Hypertension", "Type 2 Diabetes"], CreatedAt = "2024-01-10T08:00:00Z" },
        new() { Id = "p2", Name = "Michael Chen", DateOfBirth = "1972-07-22", Gender = "Male", Phone = "+1 (555) 345-6789", Email = "michael.chen@email.com", Address = "456 Oak Ave, Cambridge, MA 02139", BloodType = "O+", Allergies = [], Conditions = ["Asthma"], CreatedAt = "2024-02-05T09:30:00Z" },
        new() { Id = "p3", Name = "Emily Rodriguez", DateOfBirth = "1998-11-08", Gender = "Female", Phone = "+1 (555) 456-7890", Email = "emily.r@email.com", Address = "789 Pine Rd, Somerville, MA 02143", BloodType = "B+", Allergies = ["Latex"], Conditions = [], CreatedAt = "2024-03-01T10:00:00Z" },
        new() { Id = "p4", Name = "David Kim", DateOfBirth = "1960-05-30", Gender = "Male", Phone = "+1 (555) 567-8901", Email = "david.kim@email.com", Address = "321 Elm St, Brookline, MA 02446", BloodType = "AB-", Allergies = ["Aspirin", "NSAIDs"], Conditions = ["Coronary Artery Disease", "Hyperlipidemia"], CreatedAt = "2024-01-20T11:00:00Z" },
        new() { Id = "p5", Name = "Lisa Thompson", DateOfBirth = "1990-09-14", Gender = "Female", Phone = "+1 (555) 678-9012", Email = "lisa.t@email.com", Address = "654 Birch Ln, Newton, MA 02458", BloodType = "O-", Allergies = [], Conditions = ["Migraine", "Anxiety"], CreatedAt = "2024-04-12T14:00:00Z" },
    ];

    public static readonly Appointment[] Appointments =
    [
        new() { Id = "a1", PatientId = "p1", PatientName = "Sarah Johnson", Date = "2026-05-19", Time = "09:00", Type = "follow-up", Status = "scheduled", Notes = "Blood pressure and diabetes review", CreatedAt = "2026-05-10T08:00:00Z" },
        new() { Id = "a2", PatientId = "p2", PatientName = "Michael Chen", Date = "2026-05-19", Time = "10:30", Type = "check-up", Status = "scheduled", Notes = "Annual physical exam", CreatedAt = "2026-05-08T09:00:00Z" },
        new() { Id = "a3", PatientId = "p3", PatientName = "Emily Rodriguez", Date = "2026-05-19", Time = "14:00", Type = "consultation", Status = "scheduled", Notes = "New patient consultation", CreatedAt = "2026-05-15T10:00:00Z" },
        new() { Id = "a4", PatientId = "p4", PatientName = "David Kim", Date = "2026-05-20", Time = "09:30", Type = "follow-up", Status = "scheduled", Notes = "Cardiac follow-up", CreatedAt = "2026-05-12T11:00:00Z" },
        new() { Id = "a5", PatientId = "p5", PatientName = "Lisa Thompson", Date = "2026-05-18", Time = "11:00", Type = "consultation", Status = "completed", Notes = "Migraine management discussion", CreatedAt = "2026-05-05T14:00:00Z" },
        new() { Id = "a6", PatientId = "p1", PatientName = "Sarah Johnson", Date = "2026-05-15", Time = "15:00", Type = "check-up", Status = "completed", Notes = "Routine check", CreatedAt = "2026-05-01T08:00:00Z" },
    ];

    public static readonly MedicalRecord[] Records =
    [
        new() { Id = "r1", PatientId = "p1", PatientName = "Sarah Johnson", Date = "2026-05-15", Diagnosis = "Hypertension - Stage 1", Symptoms = "Elevated blood pressure (145/90), mild headaches", Treatment = "Medication adjustment, lifestyle modifications", Medications = "Lisinopril 10mg daily, Metformin 500mg twice daily", Notes = "Patient advised to reduce sodium intake and increase physical activity.", FollowUp = "2026-06-15", CreatedAt = "2026-05-15T15:30:00Z" },
        new() { Id = "r2", PatientId = "p4", PatientName = "David Kim", Date = "2026-05-10", Diagnosis = "Stable Angina", Symptoms = "Chest discomfort on exertion, relieved by rest", Treatment = "Continue current cardiac medications, stress test ordered", Medications = "Aspirin 81mg daily, Atorvastatin 40mg, Metoprolol 25mg", Notes = "EKG shows normal sinus rhythm. Stress test scheduled for next month.", FollowUp = "2026-06-10", CreatedAt = "2026-05-10T11:30:00Z" },
        new() { Id = "r3", PatientId = "p5", PatientName = "Lisa Thompson", Date = "2026-05-18", Diagnosis = "Chronic Migraine", Symptoms = "Recurring severe headaches, photophobia, nausea", Treatment = "Preventive medication started, trigger diary recommended", Medications = "Topiramate 25mg nightly, Sumatriptan 50mg PRN", Notes = "Patient to keep headache diary. Avoid known triggers: stress, caffeine.", FollowUp = "2026-06-18", CreatedAt = "2026-05-18T11:30:00Z" },
    ];
}
