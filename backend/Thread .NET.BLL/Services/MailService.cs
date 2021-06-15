using MimeKit;
using MailKit.Net.Smtp;

namespace Thread_.NET.BLL.Services
{
    public class MailService
    {
        public async System.Threading.Tasks.Task SendMailAsync(string clientAdress, string mainMessage, string caption)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress("ResetPass", "threadnet02@gmail.com"));
            message.To.Add(new MailboxAddress("ResetPass", clientAdress));
            message.Subject = caption;
            message.Body = new TextPart(MimeKit.Text.TextFormat.Plain)
            {
                Text = mainMessage
            };

            using (SmtpClient client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 587);
                await client.AuthenticateAsync("threadnet02@gmail.com", "kv@5_t@r@5");
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }


        }
    }
}
