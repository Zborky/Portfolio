using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EshopCrud.Services;
using System.IO;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims;
using Org.BouncyCastle.Bcpg;

namespace EshopCrud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PdfGenerator _pdfGenerator;
        private readonly EmailService _emailService;
        private readonly SmtpSettings _smtpSettings;
        private readonly string _templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "EmailTemplate.html");

        public OrderController(AppDbContext context, EmailService emailService, PdfGenerator pdfGenerator, IOptions<SmtpSettings> smtpSettings)
        {
            _context = context;
            _emailService = emailService;
            _pdfGenerator = pdfGenerator;
            _smtpSettings = smtpSettings.Value;
        }

        // Method to create a new order
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] OrderRequest orderRequest)
        {
            if (orderRequest == null || orderRequest.Products == null || !orderRequest.Products.Any())
            {
                return BadRequest("Order request or order items cannot be null or empty.");
            }

            // Create a new order object
            var order = new Order
            {
                CustomerName = orderRequest.CustomerName,
                CustomerEmail = orderRequest.CustomerEmail,
                CustomerPhone = orderRequest.CustomerPhone,
                Total = orderRequest.Products.Sum(p => p.Price * p.Quantity),
                Street = orderRequest.Street,
                City = orderRequest.City,
                PostalCode = orderRequest.PostalCode,
                Country = orderRequest.Country,
                OrderDate = DateTime.Now,
                Kurier = orderRequest.Kurier,
                Name = string.Join(", ", orderRequest.Products.Select(p => p.Name)),
                OrderItems = new List<OrderItem>()
            };

            // If the user is authenticated, assign the order to the logged-in user
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == User.Identity.Name);
                if (user != null)
                {
                    order.UserId = user.UserId;
                    order.User = user;
                }
            }

            // Add order items to the order
            foreach (var item in orderRequest.Products)
            {
                if (item == null)
                {
                    return BadRequest($"Invalid product entry in the order. Product ID is missing or invalid.");
                }

                var product = await _context.Products.FindAsync(item.Id);

                if (product == null)
                {
                    return NotFound($"Product or case with ID {item.Id} not found.");
                }

                var orderItem = new OrderItem
                {
                    Order = order,
                    ProductId = item.Id,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    Product = product,
                    Name = item.Name,
                    CustomerName = orderRequest.CustomerName,
                    CustomerEmail = orderRequest.CustomerEmail
                };

                order.OrderItems.Add(orderItem);

                // Check if there's enough stock for the ordered product
                if (product.Quantity < item.Quantity)
                {
                    return BadRequest($"Not enough stock for product ID {item.Id}. Available: {product.Quantity}, requested: {item.Quantity}");
                }

                product.Quantity -= item.Quantity;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Generate PDF for the order
            var pdfPath = Path.Combine("C:/Users/Jakub/Desktop/EshopAndrej/pdf", $"OrderDetails_{order.Id}.pdf");
            try
            {
                _pdfGenerator.GeneratePdf(pdfPath, order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating PDF: {ex.Message}");
            }

            // Prepare and send the email
            var subject = "Order Confirmation";
            var message = await LoadEmailTemplate(order);

            try
            {
                var recipients = new List<string> { order.CustomerEmail };
                await _emailService.SendEmailAsync(order.CustomerEmail, subject, message, pdfPath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex.Message}");
            }

            // Return a response with the order details
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new { orderId = order.Id });
        }

        // Helper method to load the email template
        private async Task<string> LoadEmailTemplate(Order order)
        {
            try
            {
                var template = await System.IO.File.ReadAllTextAsync(_templatePath);

                // Initialize OrderRequest with necessary properties
                var orderRequest = new OrderRequest
                {
                    CustomerName = order.CustomerName,
                    CustomerEmail = order.CustomerEmail,
                    Street = order.Street,
                    City = order.City,
                    PostalCode = order.PostalCode,
                    Country = order.Country,
                    Kurier = order.Kurier,
                    CustomerPhone = order.CustomerPhone,
                    Products = order.OrderItems.Select(item => new OrderItemRequest
                    {
                        Id = item.ProductId,
                        Quantity = item.Quantity,
                        Price = item.Price,
                        Name = item.Name,
                        CustomerEmail = order.CustomerEmail,
                        CustomerName = order.CustomerName
                    }).ToList()
                };

                // Generate the email body by replacing placeholders with actual values
                var orderItemsHtml = string.Join("\n", order.OrderItems.Select(item =>
                    $"<li><strong>{item.Name}</strong> (Quantity: {item.Quantity}) - Price: {item.Price:C}</li>"));

                string emailBody = template
                    .Replace("{CustomerName}", order.CustomerName ?? "Unknown Customer")
                    .Replace("{OrderId}", order.Id.ToString())
                    .Replace("{OrderItems}", orderItemsHtml)
                    .Replace("{TotalPrice}", order.Total.ToString("C"))
                    .Replace("{ShippingMethod}", orderRequest.Kurier ?? "Unknown shipping method")
                    .Replace("{ShippingAddress}", $"{order.Street}, {order.City}, {order.PostalCode}, {order.Country}");

                return emailBody;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading email template: {ex.Message}");
                return "Error loading email template.";
            }
        }

        // Method to get a specific order by its ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        // Method to get all orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();

            return Ok(orders);
        }
    }

    // Class representing an order creation request
    public class OrderRequest
    {
        public required string CustomerName { get; set; }
        public required string CustomerEmail { get; set; }
        public required string Street { get; set; }
        public required string City { get; set; }
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
        public required string Kurier { get; set; }
        public required string CustomerPhone { get; set; }
        public required List<OrderItemRequest> Products { get; set; }
        public string? Message { get; set; }
    }

    // Class representing an order item in the request
    public class OrderItemRequest
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
    }
}
