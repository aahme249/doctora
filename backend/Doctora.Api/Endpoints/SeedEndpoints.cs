using Doctora.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Doctora.Api.Endpoints;

public static class SeedEndpoints
{
    public static void MapSeedEndpoints(this WebApplication app)
    {
        app.MapPost("/api/seed", async (DoctoraDbContext db) =>
        {
            if (await db.Patients.AnyAsync())
                return Results.Ok(new { message = "Database already seeded" });

            db.Patients.AddRange(SeedData.Patients);
            db.Appointments.AddRange(SeedData.Appointments);
            db.Records.AddRange(SeedData.Records);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Database seeded successfully" });
        });
    }
}
