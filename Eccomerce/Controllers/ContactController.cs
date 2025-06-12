using Microsoft.AspNetCore.Mvc;
using EshopCrud.Services;
using System.Threading.Tasks;

public class ContactController : Controller
{
    // Create a service for sending emails through dependency injection
    private readonly EmailService _emailService;

    // Constructor of the controller, which accepts the email service
    public ContactController(EmailService emailService)
    {
        _emailService = emailService; // Initialize the email service through dependency injection
    }

    // Method to send a message, which handles POST requests to "/contact/sendmessage"
    [HttpPost]
    public async Task<IActionResult> SendMessage(string name, string email, string subject, string message)
    {
        // Check if all input fields are valid
        if (ModelState.IsValid)
        {
            // Create the full content of the message
            string fullMessage = $"Name: {name}\nEmail: {email}\nMessage:\n{message}";

            // Use the email service to send the email
            await _emailService.SendEmailAsync("testovaciemailzborky@gmail.com", subject, fullMessage);

            // If the email is sent successfully, return a JSON response with a success status and message
            return Json(new { success = true, message = "The message was successfully sent!" });
        }
        else
        {
            // If the input data is not valid, return a JSON response with an error message
            return Json(new { success = false, message = "Please check the entered data." });
        }
    }
}
