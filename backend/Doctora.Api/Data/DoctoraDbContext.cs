using Doctora.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Data;

public class DoctoraDbContext(DbContextOptions<DoctoraDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalRecord> Records => Set<MedicalRecord>();
    public DbSet<AppointmentRequest> AppointmentRequests => Set<AppointmentRequest>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Invite> Invites => Set<Invite>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Patient>(e =>
        {
            e.ToTable("patients");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.Name).HasColumnName("name");
            e.Property(p => p.DateOfBirth).HasColumnName("date_of_birth");
            e.Property(p => p.Gender).HasColumnName("gender");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.Email).HasColumnName("email");
            e.Property(p => p.Address).HasColumnName("address");
            e.Property(p => p.BloodType).HasColumnName("blood_type");
            e.Property(p => p.Allergies).HasColumnName("allergies");
            e.Property(p => p.Conditions).HasColumnName("conditions");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.ToTable("appointments");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.PatientId).HasColumnName("patient_id");
            e.Property(a => a.PatientName).HasColumnName("patient_name");
            e.Property(a => a.Date).HasColumnName("date");
            e.Property(a => a.Time).HasColumnName("time");
            e.Property(a => a.Type).HasColumnName("type");
            e.Property(a => a.Status).HasColumnName("status");
            e.Property(a => a.Notes).HasColumnName("notes");
            e.Property(a => a.CreatedAt).HasColumnName("created_at");
            e.Property(a => a.ReminderSent).HasColumnName("reminder_sent").HasDefaultValue(false);
        });

        modelBuilder.Entity<MedicalRecord>(e =>
        {
            e.ToTable("records");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.PatientId).HasColumnName("patient_id");
            e.Property(r => r.PatientName).HasColumnName("patient_name");
            e.Property(r => r.Date).HasColumnName("date");
            e.Property(r => r.Diagnosis).HasColumnName("diagnosis");
            e.Property(r => r.Symptoms).HasColumnName("symptoms");
            e.Property(r => r.Treatment).HasColumnName("treatment");
            e.Property(r => r.Medications).HasColumnName("medications");
            e.Property(r => r.Notes).HasColumnName("notes");
            e.Property(r => r.FollowUp).HasColumnName("follow_up");
            e.Property(r => r.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<AppointmentRequest>(e =>
        {
            e.ToTable("appointment_requests");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.PatientId).HasColumnName("patient_id");
            e.Property(r => r.PatientName).HasColumnName("patient_name");
            e.Property(r => r.PreferredDate).HasColumnName("preferred_date");
            e.Property(r => r.PreferredTime).HasColumnName("preferred_time");
            e.Property(r => r.Type).HasColumnName("type");
            e.Property(r => r.Reason).HasColumnName("reason");
            e.Property(r => r.Urgency).HasColumnName("urgency");
            e.Property(r => r.Status).HasColumnName("status");
            e.Property(r => r.AgentStatus).HasColumnName("agent_status");
            e.Property(r => r.ReviewNotes).HasColumnName("review_notes");
            e.Property(r => r.CreatedAt).HasColumnName("created_at");
            e.Property(r => r.ReviewedAt).HasColumnName("reviewed_at");
            e.OwnsOne(r => r.AgentAnalysis, a => a.ToJson("agent_analysis"));
        });

        modelBuilder.Entity<Account>(e =>
        {
            e.ToTable("accounts");
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.Email).IsUnique();
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.Email).HasColumnName("email");
            e.Property(a => a.PasswordHash).HasColumnName("password_hash");
            e.Property(a => a.Role).HasColumnName("role");
            e.Property(a => a.Name).HasColumnName("name");
            e.Property(a => a.PatientId).HasColumnName("patient_id");
            e.Property(a => a.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Invite>(e =>
        {
            e.ToTable("invites");
            e.HasKey(i => i.Token);
            e.Property(i => i.Token).HasColumnName("token");
            e.Property(i => i.PatientId).HasColumnName("patient_id");
            e.Property(i => i.Email).HasColumnName("email");
            e.Property(i => i.ExpiresAt).HasColumnName("expires_at");
            e.Property(i => i.UsedAt).HasColumnName("used_at");
            e.Property(i => i.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Message>(e =>
        {
            e.ToTable("messages");
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).HasColumnName("id");
            e.Property(m => m.PatientId).HasColumnName("patient_id");
            e.Property(m => m.SenderRole).HasColumnName("sender_role");
            e.Property(m => m.Body).HasColumnName("body");
            e.Property(m => m.CreatedAt).HasColumnName("created_at");
        });
    }
}
