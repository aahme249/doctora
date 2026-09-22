using System.Net;
using System.Net.Mail;

namespace Doctora.Api.Services;

public class EmailService(IConfiguration config)
{
    public bool IsConfigured =>
        !string.IsNullOrEmpty(config["Gmail:User"]) && !string.IsNullOrEmpty(config["Gmail:AppPassword"]);

    public async Task SendAsync(string to, string subject, string html)
    {
        var user = config["Gmail:User"]!;
        var pass = config["Gmail:AppPassword"]!;

        using var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, pass),
        };

        using var message = new MailMessage
        {
            From = new MailAddress(user, "Doctora Healthcare"),
            Subject = subject,
            Body = html,
            IsBodyHtml = true,
        };
        message.To.Add(to);

        await client.SendMailAsync(message);
    }
}
