using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

/*
 This is same like ProductsController 
*/

namespace EshopCrud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrendyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public TrendyController(AppDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        // GET: api/trendy
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trendy>>> GetTrendy()
        {
            try
            {
                return await _context.Trendy
                    .Select(t => new Trendy
                    {
                        Id = t.Id,
                        Name = t.Name ?? string.Empty,
                        Price = t.Price,
                        Description = t.Description ?? string.Empty,
                        Quantity = t.Quantity,
                        Category = t.Category ?? string.Empty,
                        ImagePath = t.ImagePath ?? string.Empty
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching trendy products: {ex.Message}");
            }
        }

        // GET: api/trendy/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Trendy>> GetTrendy(int id)
        {
            try
            {
                var trendy = await _context.Trendy.FindAsync(id);
                if (trendy == null)
                {
                    return NotFound($"Trendy product with ID {id} not found.");
                }
                return Ok(trendy);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching trendy product: {ex.Message}");
            }
        }

        // POST: api/trendy
        [HttpPost]
        public async Task<ActionResult<Trendy>> PostTrendy([FromForm] Trendy trendy, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (image != null && image.Length > 0)
                {
                    trendy.ImagePath = await SaveFileAsync(image);
                }
                else
                {
                    trendy.ImagePath = "/uploads/default.jpg";
                }

                // Add trendy product to the Trendy table
                _context.Trendy.Add(trendy);
                await _context.SaveChangesAsync();

                // Create a product object to add to the Products table
                var product = new Product
                {
                    Id = trendy.Id,
                    Name = trendy.Name,
                    Price = trendy.Price,
                    Description = trendy.Description,
                    Quantity = trendy.Quantity,
                    Category = trendy.Category,
                    ImagePath = trendy.ImagePath
                };

                // Add product to the Products table
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTrendy), new { id = trendy.Id }, trendy);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding trendy product: {ex.Message}");
            }
        }

        // PUT: api/trendy/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrendy(int id, [FromForm] Trendy trendy, [FromForm] IFormFile? image)
        {
            if (id != trendy.Id)
            {
                return BadRequest("Trendy product ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingTrendy = await _context.Trendy.FindAsync(id);
                if (existingTrendy == null)
                {
                    return NotFound($"Trendy product with ID {id} not found.");
                }

                existingTrendy.Name = trendy.Name;
                existingTrendy.Price = trendy.Price;
                existingTrendy.Description = trendy.Description;
                existingTrendy.Quantity = trendy.Quantity;

                if (image != null && image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingTrendy.ImagePath) && existingTrendy.ImagePath != "/uploads/default.jpg")
                    {
                        DeleteFile(existingTrendy.ImagePath);
                    }

                    existingTrendy.ImagePath = await SaveFileAsync(image);
                }

                _context.Entry(existingTrendy).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrendyExists(id))
                {
                    return NotFound($"Trendy product with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating trendy product: {ex.Message}");
            }
        }

        // DELETE: api/trendy/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrendy(int id)
        {
            try
            {
                var trendy = await _context.Trendy.FindAsync(id);
                if (trendy == null)
                {
                    return NotFound($"Trendy product with ID {id} not found.");
                }

                if (!string.IsNullOrEmpty(trendy.ImagePath) && trendy.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(trendy.ImagePath);
                }

                _context.Trendy.Remove(trendy);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting trendy product: {ex.Message}");
            }
        }

        private bool TrendyExists(int id)
        {
            return _context.Trendy.Any(e => e.Id == id);
        }

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
