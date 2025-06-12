using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.IO;
using System.Threading.Tasks;
using EshopCrud.Models;

namespace EshopCrud.Services
{
    public class EmailService
    {
        private readonly SmtpSettings _smtpSettings;

        // Constructor injects configuration settings for SMTP (SendGrid)
        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;

            // Check if the ApiKey is configured
            if (string.IsNullOrEmpty(_smtpSettings.ApiKey))
            {
                throw new InvalidOperationException("SendGrid API key is not configured.");
            }
        }

        // Method to send an email asynchronously
        public async Task SendEmailAsync(string customerEmail, string? subject, string message, string? attachmentPath = null)
        {
            var client = new SendGridClient(_smtpSettings.ApiKey); // Initialize SendGrid client with API key
            var from = new EmailAddress(_smtpSettings.From, "EqBarbers"); // Sender address with display name
            var to = new EmailAddress(customerEmail); // Recipient email address

            // Create the email message with subject, plain text and HTML content (both same here)
            var emailMessage = MailHelper.CreateSingleEmail(from, to, subject, message, message);

            // Add attachment if a valid file path is provided
            if (!string.IsNullOrEmpty(attachmentPath) && File.Exists(attachmentPath))
            {
                var fileBytes = await File.ReadAllBytesAsync(attachmentPath); // Read file as byte array
                var fileBase64 = Convert.ToBase64String(fileBytes); // Convert file bytes to base64 string
                var fileName = Path.GetFileName(attachmentPath); // Extract filename from path

                emailMessage.AddAttachment(fileName, fileBase64); // Attach the file to the email
            }

            // Send the email asynchronously
            var response = await client.SendEmailAsync(emailMessage);

            // Handle response status
            if (response.StatusCode == System.Net.HttpStatusCode.OK || response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                Console.WriteLine("Email sent successfully."); // Log success
            }
            else
            {
                // Read response body for debugging
                var responseBody = await response.Body.ReadAsStringAsync();
                Console.WriteLine($"Failed to send email. Status code: {response.StatusCode}, Response body: {responseBody}");
            }
        }
    }
}
