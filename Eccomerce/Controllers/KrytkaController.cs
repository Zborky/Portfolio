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
 This is same like productsController 
*/

namespace EshopCrud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KrytkyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public KrytkyController(AppDbContext context)
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
                var Krytky = _context.Krytky.AsQueryable();

                if (order == "asc")
                    Krytky = Krytky.OrderBy(p => p.Price);
                else if (order == "desc")
                    Krytky = Krytky.OrderByDescending(p => p.Price);

                return Ok(Krytky.ToList());
            }

        // GET: api/cases
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Krytka>>> GetKrytky()
        {
            try
            {
                return await _context.Krytky
                    .Select(c => new Krytka
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
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching cases: {ex.Message}");
            }
        }

       
        [HttpGet("{id}")]
        public async Task<ActionResult<Krytka>> GetKrytky(int id)
        {
            try
            {
                var krytka = await _context.Krytky.FindAsync(id);
                if (krytka == null)
                {
                    return NotFound($"Case with ID {id} not found.");
                }
                return Ok(krytka);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching case: {ex.Message}");
            }
        }

        
        [HttpPost]
public async Task<ActionResult<Krytka>> PostKrytky([FromForm] Krytka krytka, [FromForm] IFormFile? image)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    try
    {
        if (image != null && image.Length > 0)
        {
            krytka.ImagePath = await SaveFileAsync(image);
        }
        else
        {
            krytka.ImagePath = "/uploads/default.jpg";
        }

        // Pridanie Krytky do tabuľky Krytky
        _context.Krytky.Add(krytka);
        await _context.SaveChangesAsync();

        // Vytvorenie objektu Product pre pridanie do tabuľky Products
        var product = new Product
        {
            Id = krytka.Id,
            Name = krytka.Name,
            Price = krytka.Price,
            Description = krytka.Description,
            Quantity = krytka.Quantity,
            Category = krytka.Category,
            ImagePath = krytka.ImagePath
        };

        // Pridanie produktu do tabuľky Products
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetKrytky), new { id = krytka.Id }, krytka);
    }
    catch (Exception ex)
    {
        return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding case: {ex.Message}");
    }
}

        // PUT: api/cases/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKrytka(int id, [FromForm] Krytka krytka, [FromForm] IFormFile? image)
        {
            if (id != krytka.Id)
            {
                return BadRequest("Case ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingKrytka = await _context.Krytky.FindAsync(id);
                if (existingKrytka == null)
                {
                    return NotFound($"Case with ID {id} not found.");
                }

                existingKrytka.Name = krytka.Name;
                existingKrytka.Price = krytka.Price;
                existingKrytka.Description = krytka.Description;
                existingKrytka.Quantity = krytka.Quantity;

                if (image != null && image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingKrytka.ImagePath) && existingKrytka.ImagePath != "/uploads/default.jpg")
                    {
                        DeleteFile(existingKrytka.ImagePath);
                    }

                    existingKrytka.ImagePath = await SaveFileAsync(image);
                }

                _context.Entry(existingKrytka).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KrytkaExists(id))
                {
                    return NotFound($"Case with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating case: {ex.Message}");
            }
        }

        // DELETE: api/cases/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKrytka(int id)
        {
            try
            {
                var krytka = await _context.Krytky.FindAsync(id);
                if (krytka == null)
                {
                    return NotFound($"Case with ID {id} not found.");
                }

                if (!string.IsNullOrEmpty(krytka.ImagePath) && krytka.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(krytka.ImagePath);
                }

                _context.Krytky.Remove(krytka);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting case: {ex.Message}");
            }
        }

        private bool KrytkaExists(int id)
        {
            return _context.Krytky.Any(e => e.Id == id);
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

