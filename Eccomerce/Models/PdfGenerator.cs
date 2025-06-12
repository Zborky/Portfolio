using iText.IO.Image;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using System.IO;

namespace EshopCrud.Models
{
    public class PdfGenerator
    {
        // Method to generate a PDF document for the order
        public void GeneratePdf(string filePath, Order order)
        {
            // Path to the logo image
            string logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "Logo.png");

            // Check if the logo file exists
            if (!File.Exists(logoPath))
            {
                throw new FileNotFoundException("Logo file not found.", logoPath);
            }

            try
            {
                // Create a PdfWriter to write the PDF to the specified file path
                using (var writer = new PdfWriter(filePath))
                {
                    // Create a PdfDocument from the writer
                    using (var pdf = new PdfDocument(writer))
                    {
                        // Create a Document object to add content to the PDF
                        var document = new Document(pdf);

                        // Add the logo to the PDF, center-align it, and scale its size
                        ImageData logoData = ImageDataFactory.Create(logoPath);
                        Image logo = new Image(logoData);
                        logo.ScaleToFit(150, 150); // Set the size of the image
                        logo.SetHorizontalAlignment(HorizontalAlignment.CENTER); // Center-align the logo
                        document.Add(logo);

                        // Set margins for the document (top, right, bottom, left)
                        document.SetMargins(20, 20, 20, 20);

                        // Add order details to the document with center alignment
                        document.Add(new Paragraph($"Order ID: {order.Id}").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph($"Customer Name: {order.CustomerName}").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph($"Customer Email: {order.CustomerEmail}").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph($"Customer Phone: {order.CustomerPhone}").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph($"Total: {order.Total:C}").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph("Ordered Products:").SetTextAlignment(TextAlignment.CENTER));

                        // Create a table to display the product details (3 columns: Product, Quantity, Price)
                        var table = new Table(3);  // 3 columns
                        table.AddHeaderCell("Product");
                        table.AddHeaderCell("Quantity");
                        table.AddHeaderCell("Price");

                        // Add each ordered item to the table
                        foreach (var item in order.OrderItems)
                        {
                            table.AddCell(item.Product.Name);
                            table.AddCell(item.Quantity.ToString());
                            table.AddCell(item.Price.ToString("C"));
                        }

                        document.Add(table);

                        // Add the shipping address to the document
                        document.Add(new Paragraph("Shipping Address:").SetTextAlignment(TextAlignment.CENTER));
                        document.Add(new Paragraph($"{order.Street}, {order.City}, {order.PostalCode}, {order.Country}")
                            .SetTextAlignment(TextAlignment.CENTER));
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions and throw an error with the exception details
                throw new Exception("Error generating PDF document", ex);
            }
        }
    }
}
