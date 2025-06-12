using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Linq;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace EshopCrud.Controllers
{
    [Route("account")] // Define route for account related actions
    public class AccountController : Controller
    {
        private readonly AppDbContext _context; // Database context

        public AccountController(AppDbContext context)
        {
            _context = context; // Initialize context via constructor injection
        }

        // Method for logging in
        [HttpPost("login")]
        public async Task<IActionResult> Login(string username, string password)
        {
            // Retrieve user from database based on the provided username
            var user = _context.Users.SingleOrDefault(u => u.Username == username);

            // If user exists and password is valid
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                // Create claims for authentication
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                };

                // Create identity from claims and sign in the user
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

                // Redirect based on user role
                if (user.Role == "Admin")
                {
                    return Redirect("/admin.html");
                }
                else
                {
                    return Redirect("/index.html");
                }
            }
            else
            {
                // If login fails, redirect with error
                return Redirect("/login.html?error=1");
            }
        }

        // Method to fetch user orders
        [HttpGet("orders")]
        public async Task<IActionResult> GetUserOrders()
        {
            // Check if the user is authenticated
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                // Get the current authenticated user with their orders
                var user = await _context.Users
                    .Include(u => u.Orders) // Include related orders
                    .SingleOrDefaultAsync(u => u.Username == User.Identity.Name);

                if (user != null)
                {
                    // Return orders of the authenticated user
                    return Ok(user.Orders);
                }
            }

            return Unauthorized(); // Return unauthorized if user is not authenticated
        }

        // Method for user registration
        [HttpPost("register")]
        public IActionResult Register(string username, string password, string email, string role)
        {
            // Check if the username or email already exists
            if (_context.Users.Any(u => u.Username == username || u.Email == email))
            {
                return Redirect("/register.html?error=exists");
            }

            // Ensure the role is either User or Admin
            if (role != "User" && role != "Admin")
            {
                return Redirect("/register.html?error=invalidRole");
            }

            // Validate the email format
            if (!IsValidEmail(email))
            {
                return Redirect("/register.html?error=invalidEmail");
            }

            // Create a new user with hashed password
            var newUser = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Email = email,
                Role = role
            };

            // Save new user to the database
            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Redirect("/index.html"); // Redirect to the homepage after registration
        }

        // Method to fetch the current logged-in user
        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            var userName = User.Identity?.Name; // Get the username of the authenticated user
            if (userName != null)
            {
                // Find the user by username and return details
                var user = _context.Users.SingleOrDefault(u => u.Username == userName);
                if (user != null)
                {
                    return Json(new { username = user.Username, role = user.Role });
                }
            }

            return Json(new { username = (string?)null, role = (string?)null }); // Return null if no user found
        }

        // Method to log out the user
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Sign out the user and redirect to login page
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Redirect("/login.html");
        }

        // Method to fetch the profile of the current user
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userName = User.Identity?.Name; // Get the username of the authenticated user
            if (userName != null)
            {
                // Retrieve the user details from the database
                var user = _context.Users.SingleOrDefault(u => u.Username == userName);
                if (user != null)
                {
                    // Return user profile details
                    return Json(new 
                    { 
                        username = user.Username, 
                        email = user.Email,
                        role = user.Role
                    });
                }
            }

            return NotFound(); // Return 404 if the user profile is not found
        }

        // Helper method to validate email format
        private bool IsValidEmail(string email)
        {
            try
            {
                var mailAddress = new System.Net.Mail.MailAddress(email);
                return mailAddress.Address == email; // Return true if the email is valid
            }
            catch
            {
                return false; // Return false if an error occurs (invalid email format)
            }
        }
    }
}
