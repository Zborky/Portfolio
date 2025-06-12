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
 This is like ProductsController 
*/

[ApiController]
[Route("api/[controller]")]
public class CasesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly string _uploadPath;

    public CasesController(AppDbContext context)
    {
        _context = context;
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    // GET: api/cases
   
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Case>>> GetCases()
    {
        try
        {
            var cases = await _context.Cases
                .Select(c => new 
                {
                    c.Id,
                    Name = c.Name ?? string.Empty,
                    Price = c.Price,
                    Description = c.Description ?? string.Empty,
                    Quantity = c.Quantity,
                    Category = c.Category ?? string.Empty,
                    ImagePath = c.ImagePath ?? string.Empty
                })
                .ToListAsync();

            return Ok(cases);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching cases: {ex.Message}");
        }
    }

    // GET: api/cases/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Case>> GetCase(int id)
    {
        try
        {
            var caseItem = await _context.Cases.FindAsync(id);
            if (caseItem == null)
            {
                return NotFound($"Case with ID {id} not found.");
            }
            return Ok(caseItem);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching case: {ex.Message}");
        }
    }

    
         [HttpGet("sortByPrice")]
            public IActionResult GetProductsSortedByPrice(string order = "asc")
                {
                var Cases = _context.Cases.AsQueryable();

                if (order == "asc")
                    Cases = Cases.OrderBy(p => p.Price);
                else if (order == "desc")
                    Cases = Cases.OrderByDescending(p => p.Price);

                return Ok(Cases.ToList());
            }

    // POST: api/cases
    [HttpPost]
    public async Task<ActionResult<Case>> PostCase([FromForm] Case caseItem, [FromForm] IFormFile? image)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            if (image != null && image.Length > 0)
            {
                caseItem.ImagePath = await SaveFileAsync(image);
            }
            else
            {
                caseItem.ImagePath = "/uploads/default.jpg";
            }

            _context.Cases.Add(caseItem);
            await _context.SaveChangesAsync();

           
            var product = new Product
            {
                Id = caseItem.Id,
                Name = caseItem.Name,
                Price = caseItem.Price,
                Description = caseItem.Description,
                Quantity = caseItem.Quantity,
                Category = caseItem.Category,
                ImagePath = caseItem.ImagePath
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCase), new { id = caseItem.Id }, caseItem);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding case: {ex.Message}");
        }
    }

    // PUT: api/cases/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCase(int id, [FromForm] Case caseItem, [FromForm] IFormFile? image)
    {
        if (id != caseItem.Id)
        {
            return BadRequest("Case ID mismatch.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var existingCase = await _context.Cases.FindAsync(id);
            if (existingCase == null)
            {
                return NotFound($"Case with ID {id} not found.");
            }

            existingCase.Name = caseItem.Name;
            existingCase.Price = caseItem.Price;
            existingCase.Description = caseItem.Description;
            existingCase.Quantity = caseItem.Quantity;

            if (image != null && image.Length > 0)
            {
                if (!string.IsNullOrEmpty(existingCase.ImagePath) && existingCase.ImagePath != "/uploads/default.jpg")
                {
                    DeleteFile(existingCase.ImagePath);
                }

                existingCase.ImagePath = await SaveFileAsync(image);
            }

            _context.Entry(existingCase).State = EntityState.Modified;

            
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == existingCase.Name);
            if (product != null)
            {
                product.Name = caseItem.Name;
                product.Price = caseItem.Price;
                product.Description = caseItem.Description;
                product.Quantity = caseItem.Quantity;
                product.ImagePath = existingCase.ImagePath;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CaseExists(id))
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
    public async Task<IActionResult> DeleteCase(int id)
    {
        try
        {
            var caseItem = await _context.Cases.FindAsync(id);
            if (caseItem == null)
            {
                return NotFound($"Case with ID {id} not found.");
            }

            if (!string.IsNullOrEmpty(caseItem.ImagePath) && caseItem.ImagePath != "/uploads/default.jpg")
            {
                DeleteFile(caseItem.ImagePath);
            }

            _context.Cases.Remove(caseItem);

            // Remove corresponding product entry from Products table
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Name == caseItem.Name);
            if (product != null)
            {
                _context.Products.Remove(product);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting case: {ex.Message}");
        }
    }

    private bool CaseExists(int id)
    {
        return _context.Cases.Any(e => e.Id == id);
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
