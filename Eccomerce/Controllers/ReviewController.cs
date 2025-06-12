using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Collections.Generic;

namespace EshopCrud.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase{
        private readonly AppDbContext _context;

        public ReviewController(AppDbContext context){
            _context = context;
        } 

        //Get API/Review
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews(){
            return await _context.Reviews.ToListAsync();
        }

        //Get API/Review/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id){
            var review = await _context.Reviews.FindAsync(id);

            if(review == null){
                return NotFound();
            }
            return review;
        }


        //Post API/Review
        [HttpPost]
        public async Task<ActionResult<Review>> PostReview([FromBody] Review review){
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        //Delete Api/Review/
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRevies(int id){
            var review = await _context.Reviews.FindAsync(id);
            if(review == null)
                return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();    
            
        }
    }


}