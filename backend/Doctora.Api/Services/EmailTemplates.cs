using System.Text.Json;

namespace Doctora.Api.Services;

public static class EmailTemplates
{
    private static string? Str(JsonElement data, string prop) =>
        data.TryGetProperty(prop, out var v) && v.ValueKind != JsonValueKind.Null ? v.GetString() : null;

    private static string Base(string title, string body) => $$"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
                <tr>
                  <td style="background:#1e293b;padding:24px 32px">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#3b82f6;border-radius:8px;padding:8px 10px;margin-right:12px">
                          <span style="color:#fff;font-size:16px">&#x2695;</span>
                        </td>
                        <td style="padding-left:10px">
                          <span style="color:#fff;font-weight:700;font-size:18px">Doctora</span>
                          <br><span style="color:#94a3b8;font-size:12px">Healthcare Portal</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px">
                    <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a">{{title}}</h1>
                    {{body}}
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
                    <p style="margin:0;font-size:12px;color:#94a3b8">This is an automated message from Doctora Healthcare Portal. Please do not reply.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string Pill(string text, string color = "#eff6ff", string textColor = "#1d4ed8") =>
        $"<span style=\"display:inline-block;background:{color};color:{textColor};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600\">{text}</span>";

    private static string InfoRow(string label, string value) => $"""
        <tr>
          <td style="padding:8px 0;color:#64748b;font-size:14px;width:130px">{label}</td>
          <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500">{value}</td>
        </tr>
        """;

    public static (string Subject, string Html)? Render(EmailPayload payload)
    {
        var data = payload.Data;
        switch (payload.Type)
        {
            case "welcome":
            {
                var name = Str(data, "name") ?? "";
                return ("Welcome to Doctora – Your account is ready", Base($"Welcome, {name}!", $"""
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                      Your patient account has been created successfully. You can now log in to the Doctora portal to view your appointments and medical records.
                    </p>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:20px">
                      <p style="margin:0;color:#166534;font-size:14px">&#x2713;&nbsp; View upcoming appointments<br>&#x2713;&nbsp; Access your medical records<br>&#x2713;&nbsp; Stay updated on your health</p>
                    </div>
                    <p style="color:#475569;font-size:14px;margin:0">If you have any questions, please contact our clinic directly.</p>
                    """));
            }
            case "patient_invite":
            {
                var name = Str(data, "name") ?? "";
                var inviteUrl = Str(data, "inviteUrl") ?? "";
                return ("You've been invited to Doctora Healthcare Portal", Base("You're invited", $"""
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                      Hi {name}, your doctor has set up a patient portal account for you on Doctora. Click below to set your password and get access to your appointments and medical records.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px">
                      <tr><td style="background:#2563eb;border-radius:8px">
                        <a href="{inviteUrl}" style="display:inline-block;padding:12px 24px;color:#fff;font-size:14px;font-weight:600;text-decoration:none">Set your password</a>
                      </td></tr>
                    </table>
                    <p style="color:#94a3b8;font-size:12px;margin:0">This invite link expires in 7 days. If you didn't expect this email, you can safely ignore it.</p>
                    """));
            }
            case "appointment_confirmed":
            {
                var name = Str(data, "name") ?? "";
                var date = Str(data, "date") ?? "";
                var time = Str(data, "time") ?? "";
                var type = Str(data, "type") ?? "";
                var notes = Str(data, "notes") ?? "";
                return ($"Appointment confirmed – {date} at {time}", Base("Appointment Confirmed", $"""
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, your appointment has been scheduled. Here are your details:
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Date", date)}
                      {InfoRow("Time", time)}
                      {InfoRow("Type", Pill(type))}
                      {(string.IsNullOrEmpty(notes) ? "" : InfoRow("Notes", notes))}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">Please arrive 10 minutes early. If you need to reschedule, contact us as soon as possible.</p>
                    """));
            }
            case "appointment_status":
            {
                var name = Str(data, "name") ?? "";
                var date = Str(data, "date") ?? "";
                var time = Str(data, "time") ?? "";
                var status = Str(data, "status") ?? "";
                var (bg, fg) = status switch
                {
                    "completed" => ("#f0fdf4", "#166534"),
                    "cancelled" => ("#fef2f2", "#991b1b"),
                    "no-show" => ("#f8fafc", "#475569"),
                    _ => ("#eff6ff", "#1d4ed8"),
                };
                return ($"Appointment update – status changed to {status}", Base("Appointment Status Update", $"""
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, the status of your appointment has been updated.
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Date", date)}
                      {InfoRow("Time", time)}
                      {InfoRow("New status", Pill(status, bg, fg))}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">Log in to your patient portal for more details.</p>
                    """));
            }
            case "appointment_reminder":
            {
                var name = Str(data, "name") ?? "";
                var date = Str(data, "date") ?? "";
                var time = Str(data, "time") ?? "";
                var type = Str(data, "type") ?? "";
                var notes = Str(data, "notes") ?? "";
                return ($"Reminder: Your appointment is on {date} at {time}", Base("Appointment Reminder", $"""
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px">
                      <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">&#x23F0;&nbsp; You have an upcoming appointment</p>
                    </div>
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, this is a friendly reminder about your upcoming appointment.
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Date", date)}
                      {InfoRow("Time", time)}
                      {InfoRow("Type", Pill(type))}
                      {(string.IsNullOrEmpty(notes) ? "" : InfoRow("Notes", notes))}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">Please arrive 10 minutes early. To reschedule, contact our clinic as soon as possible.</p>
                    """));
            }
            case "new_record":
            {
                var name = Str(data, "name") ?? "";
                var date = Str(data, "date") ?? "";
                var diagnosis = Str(data, "diagnosis") ?? "";
                var followUp = Str(data, "followUp") ?? "";
                return ("New medical record added to your profile", Base("New Medical Record", $"""
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, Dr. Hassan has added a new medical record to your profile.
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Date", date)}
                      {InfoRow("Diagnosis", diagnosis)}
                      {(string.IsNullOrEmpty(followUp) ? "" : InfoRow("Follow-up", followUp))}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">Log in to your patient portal to view the full record including treatment notes and medications.</p>
                    """));
            }
            case "request_received":
            {
                var name = Str(data, "name") ?? "";
                var type = Str(data, "type") ?? "";
                var preferredDate = Str(data, "preferredDate") ?? "";
                var preferredTime = Str(data, "preferredTime") ?? "";
                return ("Your appointment request has been received", Base("Request Received", $"""
                    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-bottom:24px">
                      <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600">&#x23F3;&nbsp; Your request is being reviewed</p>
                    </div>
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, we have received your appointment request. Our team will review it shortly and confirm your slot.
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Type", Pill(type))}
                      {InfoRow("Preferred date", preferredDate)}
                      {InfoRow("Preferred time", preferredTime)}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">You will receive another email once your request has been reviewed.</p>
                    """));
            }
            case "request_decision":
            {
                var name = Str(data, "name") ?? "";
                var type = Str(data, "type") ?? "";
                var preferredDate = Str(data, "preferredDate") ?? "";
                var decision = Str(data, "decision") ?? "";
                var notes = Str(data, "notes");
                var approved = decision == "approved";
                var (bg, fg) = approved ? ("#f0fdf4", "#166534") : ("#fef2f2", "#991b1b");
                return (approved ? "Your appointment request has been approved" : "Update on your appointment request",
                    Base(approved ? "Request Approved" : "Request Update", $"""
                    <div style="background:{bg};border:1px solid {(approved ? "#bbf7d0" : "#fecaca")};border-radius:8px;padding:14px 18px;margin-bottom:24px">
                      <p style="margin:0;color:{fg};font-size:14px;font-weight:600">{(approved ? "&#x2713;&nbsp; Approved — your appointment is confirmed" : "&#x2715;&nbsp; Request not approved at this time")}</p>
                    </div>
                    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
                      Hi {name}, here is an update on your appointment request.
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                      {InfoRow("Type", Pill(type))}
                      {InfoRow("Requested date", preferredDate)}
                      {InfoRow("Decision", Pill(decision, bg, fg))}
                      {(string.IsNullOrEmpty(notes) ? "" : InfoRow("Notes", notes!))}
                    </table>
                    <p style="color:#475569;font-size:14px;margin:0">{(approved ? "Please check your portal for your confirmed appointment details." : "Please contact the clinic or submit a new request if you need to reschedule.")}</p>
                    """));
            }
            default:
                return null;
        }
    }
}
