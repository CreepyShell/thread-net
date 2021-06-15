using MimeKit;
using MailKit.Net.Smtp;

namespace Thread_.NET.BLL.Services
{
    public class MailService
    {
        public async System.Threading.Tasks.Task SendMailAsync(string clientAdress, string link)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress("ResetPass", "threadnet02@gmail.com"));
            message.To.Add(new MailboxAddress("ResetPass", clientAdress));
            message.Subject = "Reset password in .NetThread application";
            message.Body = new TextPart()
            {
                Text = "To reset the password follow the link: " + link
            };

            using (SmtpClient client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 587, true);
                await client.AuthenticateAsync("threadnet02@gmail.com", "kv@5_t@r@5");
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }


        }
    }
}
