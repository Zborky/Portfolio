using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EshopCrud.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

       public required Order Order { get; set; }

       public int OrderId { get; set; }

        // Foreign key to the Product
        [Required]
        public int ProductId { get; set; }
        public required Product Product { get; set; }

        // Product name
        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        // Customer details directly in the BackupItem
        [Required]
        [StringLength(255)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;
    }
}
