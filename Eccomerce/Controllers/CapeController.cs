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
 This is a same like ProductsController 
*/
namespace EshopCrud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CapesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public CapesController(AppDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        
        [HttpGet("sortByPrice")]
        public IActionResult GetProductsSortedByPrice(string order = "asc")
        {
            var capes = _context.Capes.AsQueryable();

            if (order == "asc")
                capes = capes.OrderBy(p => p.Price);
            else if (order == "desc")
                capes = capes.OrderByDescending(p => p.Price);

            return Ok(capes.ToList());
        }

        // GET: api/capes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cape>>> GetCapes()
        {
            try
            {
                return await _context.Capes
                    .Select(c => new Cape
                    {
                        Id = c.Id,
                        Name = c.Name ?? string.Empty,
                        Price = c.Price,
                        Description = c.Description ?? string.Empty,
                        Quantity = c.Quantity,
                        Category = c.Category ?? string.Empty,
                        ImagePath = c.ImagePath ?? string.Empty
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching capes: {ex.Message}");
            }
        }

        // GET: api/capes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Cape>> GetCape(int id)
        {
            try
            {
                var cape = await _context.Capes.FindAsync(id);
                if (cape == null)
                {
                    return NotFound($"Cape with ID {id} not found.");
                }
                return Ok(cape);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching cape: {ex.Message}");
            }
        }

        // POST: api/capes
        [HttpPost]
        public async Task<ActionResult<Cape>> PostCape([FromForm] Cape cape, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (image != null && image.Length > 0)
                {
                    cape.ImagePath = await SaveFileAsync(image);
                }
                else
                {
                    cape.ImagePath = "/uploads/default.jpg";
                }

                if (string.IsNullOrEmpty(cape.Category))
                {
                    cape.Category = "DefaultCategory"; 
                }

                
                _context.Capes.Add(cape);
                await _context.SaveChangesAsync();

                
                var product = new Product
                {
                    Id = cape.Id,
                    Name = cape.Name ?? string.Empty,
                    Price = cape.Price,
                    Description = cape.Description,
                    Quantity = cape.Quantity,
                    Category = cape.Category,
                    ImagePath = cape.ImagePath
                };

                
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCape), new { id = cape.Id }, cape);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding cape: {ex.Message}");
            }
        }

        // PUT: api/capes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCape(int id, [FromForm] Cape cape, [FromForm] IFormFile? image)
        {
            if (id != cape.Id)
            {
                return BadRequest("Cape ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingCape = await _context.Capes.FindAsync(id);
                if (existingCape == null)
                {
                    return NotFound($"Cape with ID {id} not found.");
                }

                existingCape.Name = cape.Name;
                existingCape.Price = cape.Price;
                existingCape.Description = cape.Description;
                existingCape.Quantity = cape.Quantity;

                if (image != null && image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingCape.ImagePath) && existingCape.ImagePath != "/uploads/default.jpg")
                    {
                        DeleteFile(existingCape.ImagePath);
                    }

                    existingCape.ImagePath = await SaveFileAsync(image);
                }

                if (string.IsNullOrEmpty(existingCape.Category))
                {
                    existingCape.Category = "DefaultCategory"; // alebo iná predvolená hodnota
                }

                _context.Entry(existingCape).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CapeExists(id))
                {
                    return NotFound($"Cape with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating cape: {ex.Message}");
            }
        }

        // DELETE: api/capes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCape(int id)
        {
            try
            {
                var cape = await _context.Capes.FindAsync(id);
                if (cape == null)
                {
                    return NotFound($"Cape with ID {id} not found.");
                }

                if (!string.IsNullOrEmpty(cape.ImagePath) && cape.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(cape.ImagePath);
                }

                _context.Capes.Remove(cape);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting cape: {ex.Message}");
            }
        }

        private bool CapeExists(int id)
        {
            return _context.Capes.Any(e => e.Id == id);
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