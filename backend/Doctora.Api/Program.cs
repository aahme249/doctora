using Doctora.Api.Data;
using Doctora.Api.Endpoints;
using Doctora.Api.Models;
using Doctora.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var rawConnectionString = builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration.GetConnectionString("DoctoraDb")
    ?? throw new InvalidOperationException("DATABASE_URL is not configured.");

builder.Services.AddDbContext<DoctoraDbContext>(options =>
    options.UseNpgsql(ConnectionStringHelper.ToNpgsqlConnectionString(rawConnectionString)));

builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddHostedService<AppointmentReminderService>();

builder.Services.AddOpenApi();

const string FrontendCorsPolicy = "FrontendCorsPolicy";
var frontendOrigins = (builder.Configuration["FRONTEND_ORIGIN"] ?? "http://localhost:3000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(frontendOrigins).AllowAnyHeader().AllowAnyMethod());
});

var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new JwtService(builder.Configuration).ValidationParameters;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("doctor"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapCrudEndpoints();
app.MapEmailEndpoints();
app.MapSeedEndpoints();
app.MapInviteEndpoints();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DoctoraDbContext>();
    await db.Database.ExecuteSqlRawAsync("""
        CREATE TABLE IF NOT EXISTS accounts (
          id text PRIMARY KEY,
          email text NOT NULL UNIQUE,
          password_hash text NOT NULL,
          role text NOT NULL,
          name text NOT NULL,
          patient_id text,
          created_at text NOT NULL
        )
        """);

    await db.Database.ExecuteSqlRawAsync("""
        CREATE TABLE IF NOT EXISTS invites (
          token text PRIMARY KEY,
          patient_id text NOT NULL,
          email text NOT NULL,
          expires_at text NOT NULL,
          used_at text,
          created_at text NOT NULL
        )
        """);

    await db.Database.ExecuteSqlRawAsync(
        "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false");

    if (!await db.Accounts.AnyAsync(a => a.Role == "doctor"))
    {
        db.Accounts.Add(new Account
        {
            Id = Guid.NewGuid().ToString("N"),
            Email = "dr.hassan@doctora.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("doctor123"),
            Role = "doctor",
            Name = "Dr. Hassan",
            CreatedAt = DateTime.UtcNow.ToString("o"),
        });
        await db.SaveChangesAsync();
    }
}

app.Run();
