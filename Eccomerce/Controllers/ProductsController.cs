using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace EshopCrud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        // Constructor to initialize the database context and upload path
        public ProductsController(AppDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            // Ensure the upload directory exists
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        // Loads all products for the page
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            try
            {
                // Fetching products from the database and selecting necessary fields
                var products = await _context.Products
                    .Select(p => new 
                    {
                        p.Id,
                        Name = p.Name ?? string.Empty,
                        Category = p.Category ?? string.Empty,
                        Price = p.Price,
                        Description = p.Description ?? string.Empty,
                        Quantity = p.Quantity,
                        ImagePath = p.ImagePath ?? string.Empty
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                // If there's an error, return a 500 internal server error
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching products: {ex.Message}");
            }
        }

        // Loads a single product by ID
        [HttpGet("{id:int}")]
        public IActionResult GetProductById(int id)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }
            return Ok(product);
        }

        // Sorts products by price (ascending or descending)
        [HttpGet("sortByPrice")]
        public IActionResult GetProductsSortedByPrice(string order = "asc")
        {
            var products = _context.Products.AsQueryable();

            if (order == "asc")
                products = products.OrderBy(p => p.Price);
            else if (order == "desc")
                products = products.OrderByDescending(p => p.Price);

            return Ok(products.ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching product: {ex.Message}");
            }
        }

        // Saves a new product to the database
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromForm] Product product, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // If an image is provided, save it
                if (image != null && image.Length > 0)
                {
                    product.ImagePath = await SaveFileAsync(image);
                }
                else
                {
                    // If no image, set a default image
                    product.ImagePath = "/uploads/default.jpg";
                }

                // Add the product to the database and save it
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding product: {ex.Message}");
            }
        }

        // Function to update an existing product in the database
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromForm] Product product, [FromForm] IFormFile? image)
        {
            if (id != product.Id)
            {
                return BadRequest("Product ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                // Update product details
                existingProduct.Name = product.Name;
                existingProduct.Price = product.Price;
                existingProduct.Description = product.Description;
                existingProduct.Quantity = product.Quantity;

                // If a new image is uploaded, save it
                if (image != null && image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingProduct.ImagePath) && existingProduct.ImagePath != "/uploads/default.jpg")
                    {
                        // Delete the old image if it exists
                        DeleteFile(existingProduct.ImagePath);
                    }

                    existingProduct.ImagePath = await SaveFileAsync(image);
                }

                _context.Entry(existingProduct).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound($"Product with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating product: {ex.Message}");
            }
        }

        // Deletes a product from the database
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                // If the product has an image, delete it
                if (!string.IsNullOrEmpty(product.ImagePath) && product.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(product.ImagePath);
                }

                // Remove the product from the database
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting product: {ex.Message}");
            }
        }

        // Checks if the product exists in the database
        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }

        // Saves the uploaded file (image) to the server
        private async Task<string> SaveFileAsync(IFormFile file)
        {
            if (file.Length > 0)
            {
                var filePath = Path.Combine(_uploadPath, file.FileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return "/uploads/" + file.FileName;
            }

            throw new InvalidOperationException("File is empty.");
        }

        // Deletes the product image from the server
        private void DeleteFile(string path)
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/'));

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
    }
}
