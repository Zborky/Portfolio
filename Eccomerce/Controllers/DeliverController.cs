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
    public class DeliverController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public DeliverController(AppDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(_uploadPath);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Deliver>>> GetDelivers()
        {
            try
            {
                return Ok(await _context.Delivers
                    .Select(d => new
                    {
                        d.Id,
                        Name = d.Name ?? string.Empty,
                        Price = d.Price,
                        Description = d.Description ?? string.Empty,
                        Quantity = d.Quantity,
                        ImagePath = d.ImagePath ?? string.Empty
                    })
                    .ToListAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Chyba pri načítavaní doručení: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Deliver>> GetDeliver(int id)
        {
            try
            {
                var deliver = await _context.Delivers.FindAsync(id);
                if (deliver == null)
                {
                    return NotFound($"Doručenie s ID {id} nebolo nájdené.");
                }

                return Ok(deliver);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Chyba pri načítavaní doručenia: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Deliver>> PostDeliver([FromForm] Deliver deliver, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (image != null && image.Length > 0)
                {
                    deliver.ImagePath = await SaveFileAsync(image);
                }
                else
                {
                    deliver.ImagePath = "/uploads/default.jpg";
                }

                _context.Delivers.Add(deliver);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDeliver), new { id = deliver.Id }, deliver);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Chyba pri pridávaní doručenia: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDeliver(int id, [FromForm] Deliver deliver, [FromForm] IFormFile? image)
        {
            if (id != deliver.Id)
            {
                return BadRequest("Nesúhlasí ID doručenia.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingDeliver = await _context.Delivers.FindAsync(id);
                if (existingDeliver == null)
                {
                    return NotFound($"Doručenie s ID {id} nebolo nájdené.");
                }

                existingDeliver.Name = deliver.Name;
                existingDeliver.Price = deliver.Price;
                existingDeliver.Description = deliver.Description;
                existingDeliver.Quantity = deliver.Quantity;

                if (image != null && image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingDeliver.ImagePath) && existingDeliver.ImagePath != "/uploads/default.jpg")
                    {
                        DeleteFile(existingDeliver.ImagePath);
                    }

                    existingDeliver.ImagePath = await SaveFileAsync(image);
                }

                _context.Entry(existingDeliver).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DeliverExists(id))
                {
                    return NotFound($"Doručenie s ID {id} nebolo nájdené.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Chyba pri aktualizácii doručenia: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDeliver(int id)
        {
            try
            {
                var deliver = await _context.Delivers.FindAsync(id);
                if (deliver == null)
                {
                    return NotFound($"Doručenie s ID {id} nebolo nájdené.");
                }

                if (!string.IsNullOrEmpty(deliver.ImagePath) && deliver.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(deliver.ImagePath);
                }

                _context.Delivers.Remove(deliver);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Chyba pri vymazávaní doručenia: {ex.Message}");
            }
        }

        private bool DeliverExists(int id)
        {
            return _context.Delivers.Any(e => e.Id == id);
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

                return $"/uploads/{file.FileName}";
            }

            return string.Empty;
        }

        private void DeleteFile(string filePath)
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
    }
}

