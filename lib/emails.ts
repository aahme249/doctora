export type EmailType = 'welcome' | 'appointment_confirmed' | 'appointment_status' | 'new_record';

interface WelcomeData { name: string }
interface AppointmentConfirmedData { name: string; date: string; time: string; type: string; notes: string }
interface AppointmentStatusData { name: string; date: string; time: string; status: string }
interface NewRecordData { name: string; date: string; diagnosis: string; followUp: string }

export type EmailData =
  | { type: 'welcome'; data: WelcomeData }
  | { type: 'appointment_confirmed'; data: AppointmentConfirmedData }
  | { type: 'appointment_status'; data: AppointmentStatusData }
  | { type: 'new_record'; data: NewRecordData };

function base(title: string, body: string) {
  return `<!DOCTYPE html>
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
            <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a">${title}</h1>
            ${body}
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
</html>`;
}

function pill(text: string, color = '#eff6ff', textColor = '#1d4ed8') {
  return `<span style="display:inline-block;background:${color};color:${textColor};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600">${text}</span>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;width:130px">${label}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500">${value}</td>
  </tr>`;
}

export function renderEmail(payload: EmailData): { subject: string; html: string } {
  switch (payload.type) {
    case 'welcome': {
      const { name } = payload.data;
      return {
        subject: 'Welcome to Doctora – Your account is ready',
        html: base('Welcome, ' + name + '!', `
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
            Your patient account has been created successfully. You can now log in to the Doctora portal to view your appointments and medical records.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0;color:#166534;font-size:14px">&#x2713;&nbsp; View upcoming appointments<br>&#x2713;&nbsp; Access your medical records<br>&#x2713;&nbsp; Stay updated on your health</p>
          </div>
          <p style="color:#475569;font-size:14px;margin:0">If you have any questions, please contact our clinic directly.</p>
        `),
      };
    }
    case 'appointment_confirmed': {
      const { name, date, time, type, notes } = payload.data;
      return {
        subject: `Appointment confirmed – ${date} at ${time}`,
        html: base('Appointment Confirmed', `
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
            Hi ${name}, your appointment has been scheduled. Here are your details:
          </p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            ${infoRow('Date', date)}
            ${infoRow('Time', time)}
            ${infoRow('Type', pill(type))}
            ${notes ? infoRow('Notes', notes) : ''}
          </table>
          <p style="color:#475569;font-size:14px;margin:0">Please arrive 10 minutes early. If you need to reschedule, contact us as soon as possible.</p>
        `),
      };
    }
    case 'appointment_status': {
      const { name, date, time, status } = payload.data;
      const colorMap: Record<string, [string, string]> = {
        completed: ['#f0fdf4', '#166534'],
        cancelled: ['#fef2f2', '#991b1b'],
        'no-show': ['#f8fafc', '#475569'],
      };
      const [bg, fg] = colorMap[status] ?? ['#eff6ff', '#1d4ed8'];
      return {
        subject: `Appointment update – status changed to ${status}`,
        html: base('Appointment Status Update', `
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
            Hi ${name}, the status of your appointment has been updated.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            ${infoRow('Date', date)}
            ${infoRow('Time', time)}
            ${infoRow('New status', pill(status, bg, fg))}
          </table>
          <p style="color:#475569;font-size:14px;margin:0">Log in to your patient portal for more details.</p>
        `),
      };
    }
    case 'new_record': {
      const { name, date, diagnosis, followUp } = payload.data;
      return {
        subject: 'New medical record added to your profile',
        html: base('New Medical Record', `
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
            Hi ${name}, Dr. Hassan has added a new medical record to your profile.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            ${infoRow('Date', date)}
            ${infoRow('Diagnosis', diagnosis)}
            ${followUp ? infoRow('Follow-up', followUp) : ''}
          </table>
          <p style="color:#475569;font-size:14px;margin:0">Log in to your patient portal to view the full record including treatment notes and medications.</p>
        `),
      };
    }
  }
}
