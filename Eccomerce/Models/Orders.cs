using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EshopCrud.Models;

namespace EshopCrud.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }
        public  User? User { get; set; }
        [Required]
        [StringLength(255)]
        public string CustomerName { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;
        [Required]
        public required string CustomerPhone { get; set; }
        [Required]
        public decimal Total { get; set; }
        [Required]
        public required string Name { get; set; } = string.Empty;
        [Required]
        public DateTime OrderDate { get; set; } = DateTime.Now;
         public required string Street { get; set; }
        public required string City { get; set; }
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
        public required string Kurier {get; set;}
       
        // Navigačná vlastnosť pre vzťah s položkami objednávky
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
         
        
    }
}
