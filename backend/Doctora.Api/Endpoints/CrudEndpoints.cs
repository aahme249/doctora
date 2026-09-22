using System.Security.Claims;
using Doctora.Api.Data;
using Doctora.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public static class CrudEndpoints
{
    private static bool IsDoctor(ClaimsPrincipal user) => user.IsInRole("doctor");
    private static string? OwnPatientId(ClaimsPrincipal user) => user.FindFirstValue("patientId");

    public static void MapCrudEndpoints(this WebApplication app)
    {
        var patients = app.MapGroup("/api/patients").RequireAuthorization();
        patients.MapGet("/", async (ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            var result = IsDoctor(user)
                ? await db.Patients.ToListAsync()
                : await db.Patients.Where(p => p.Id == OwnPatientId(user)).ToListAsync();

            var accountPatientIds = (await db.Accounts
                .Where(a => a.PatientId != null)
                .Select(a => a.PatientId!)
                .ToListAsync()).ToHashSet();
            foreach (var p in result) p.HasAccount = accountPatientIds.Contains(p.Id);

            return result;
        });
        patients.MapPost("/", async (Patient patient, DoctoraDbContext db) =>
        {
            db.Patients.Add(patient);
            await db.SaveChangesAsync();
            return Results.Ok(patient);
        }).RequireAuthorization("DoctorOnly");
        patients.MapPatch("/{id}", async (string id, PatientUpdate updates, DoctoraDbContext db) =>
        {
            var patient = await db.Patients.FindAsync(id);
            if (patient is null) return Results.NotFound();
            updates.ApplyTo(patient);
            await db.SaveChangesAsync();
            return Results.Ok(patient);
        }).RequireAuthorization("DoctorOnly");
        patients.MapDelete("/{id}", async (string id, DoctoraDbContext db) =>
        {
            await db.Patients.Where(p => p.Id == id).ExecuteDeleteAsync();
            return Results.Ok(new { ok = true });
        }).RequireAuthorization("DoctorOnly");

        var appointments = app.MapGroup("/api/appointments").RequireAuthorization();
        appointments.MapGet("/", async (ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            if (IsDoctor(user)) return await db.Appointments.ToListAsync();
            var ownId = OwnPatientId(user);
            return await db.Appointments.Where(a => a.PatientId == ownId).ToListAsync();
        });
        appointments.MapPost("/", async (Appointment appointment, DoctoraDbContext db) =>
        {
            db.Appointments.Add(appointment);
            await db.SaveChangesAsync();
            return Results.Ok(appointment);
        }).RequireAuthorization("DoctorOnly");
        appointments.MapPatch("/{id}", async (string id, AppointmentUpdate updates, DoctoraDbContext db) =>
        {
            var appointment = await db.Appointments.FindAsync(id);
            if (appointment is null) return Results.NotFound();
            updates.ApplyTo(appointment);
            await db.SaveChangesAsync();
            return Results.Ok(appointment);
        }).RequireAuthorization("DoctorOnly");
        appointments.MapDelete("/{id}", async (string id, DoctoraDbContext db) =>
        {
            await db.Appointments.Where(a => a.Id == id).ExecuteDeleteAsync();
            return Results.Ok(new { ok = true });
        }).RequireAuthorization("DoctorOnly");

        var records = app.MapGroup("/api/records").RequireAuthorization();
        records.MapGet("/", async (ClaimsPrincipal user, DoctoraDbContext db) =>
        {
            if (IsDoctor(user)) return await db.Records.ToListAsync();
            var ownId = OwnPatientId(user);
            return await db.Records.Where(r => r.PatientId == ownId).ToListAsync();
        });
        records.MapPost("/", async (MedicalRecord record, DoctoraDbContext db) =>
        {
            db.Records.Add(record);
            await db.SaveChangesAsync();
            return Results.Ok(record);
        }).RequireAuthorization("DoctorOnly");
        records.MapPatch("/{id}", async (string id, RecordUpdate updates, DoctoraDbContext db) =>
        {
            var record = await db.Records.FindAsync(id);
            if (record is null) return Results.NotFound();
            updates.ApplyTo(record);
            await db.SaveChangesAsync();
            return Results.Ok(record);
        }).RequireAuthorization("DoctorOnly");
        records.MapDelete("/{id}", async (string id, DoctoraDbContext db) =>
        {
            await db.Records.Where(r => r.Id == id).ExecuteDeleteAsync();
            return Results.Ok(new { ok = true });
        }).RequireAuthorization("DoctorOnly");

        var requests = app.MapGroup("/api/appointment-requests").RequireAuthorization("DoctorOnly");
        requests.MapGet("/", async (DoctoraDbContext db) => await db.AppointmentRequests.ToListAsync());
        requests.MapPost("/", async (AppointmentRequest request, DoctoraDbContext db) =>
        {
            db.AppointmentRequests.Add(request);
            await db.SaveChangesAsync();
            return Results.Ok(request);
        });
        requests.MapPatch("/{id}", async (string id, AppointmentRequestUpdate updates, DoctoraDbContext db) =>
        {
            var request = await db.AppointmentRequests.FindAsync(id);
            if (request is null) return Results.NotFound();
            updates.ApplyTo(request);
            await db.SaveChangesAsync();
            return Results.Ok(request);
        });
        requests.MapDelete("/{id}", async (string id, DoctoraDbContext db) =>
        {
            await db.AppointmentRequests.Where(r => r.Id == id).ExecuteDeleteAsync();
            return Results.Ok(new { ok = true });
        });
    }
}
