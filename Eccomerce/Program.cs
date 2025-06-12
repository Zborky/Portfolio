using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using System.IO;
using EshopCrud.Services;
using EshopCrud.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Pridanie služieb do kontajnera
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    });

// Konfigurácia DbContext s použitím MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 27)))); // Uprav verziu podľa svojej MySQL verzie

// Konfigurácia nastavení pre e-mail
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));

// Konfigurácia nastavení pre TrustPay
builder.Services.Configure<TrustPaySettings>(builder.Configuration.GetSection("TrustPay"));

// Pridanie HttpClient do kontajnera služieb
builder.Services.AddHttpClient();

// Registrácia EmailService služby
builder.Services.AddTransient<EmailService>();

// Registrácia PdfGenerator služby (dôležité pre injektovanie do OrderController)
builder.Services.AddSingleton<PdfGenerator>(); // Ak je PdfGenerator statický, použite AddSingleton

// Konfigurácia autentifikácie s cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login.html"; // Cesta k prihlasovacej stránke
    });

// Registrácia HttpClient pre TrustPay
builder.Services.AddHttpClient("TrustPayClient", client =>
{
    client.BaseAddress = new Uri("https://api.trustpay.com/");
});

var app = builder.Build();

// Konfigurácia HTTP požiadaviek
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error"); // Pre spracovanie chýb v produkčnom prostredí
    app.UseHsts(); // Ochrana pred útokmi typu man-in-the-middle
}

// Pre redirektovanie na HTTPS
app.UseHttpsRedirection();

// Pre službu statických súborov
app.UseStaticFiles(); // Serves static files from wwwroot

// Pre routovanie
app.UseRouting();

// Pre autentizáciu
app.UseAuthentication();
app.UseAuthorization();

// Mapovanie kontrolérov
app.MapControllers();

// Mapovanie statických HTML súborov na základný URL
app.MapGet("/", async context =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
    if (File.Exists(filePath))
    {
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found.");
    }
});

// Načítanie stránok produktov
app.MapGet("/produkty.html", async context =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "produkty.html");
    if (File.Exists(filePath))
    {
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found.");
    }
});

// Načítanie stránky kontaktov
app.MapGet("/contact.html", async context =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "contact.html");
    if (File.Exists(filePath))
    {
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found.");
    }
});

// Mapovanie formulára na odoslanie správy z kontaktu
app.MapPost("/Contact/SendMessage", async context =>
{
    var form = context.Request.Form;

    var name = form["name"];
    var email = form["email"];
    var subject = form["subject"];
    var message = form["message"];

    var emailService = context.RequestServices.GetRequiredService<EmailService>();

    // Kontrola, či je predmet prázdny
    if (string.IsNullOrEmpty(subject))
    {
        await context.Response.WriteAsync("Predmet správy nesmie byť prázdny.");
        return;
    }

    // Sformátovanie správy pre odoslanie
    var fullMessage = $"Meno: {name}\nEmail: {email}\nSpráva: {message}";

    try
    {
        // Odoslanie emailu
        await emailService.SendEmailAsync("testovaciemailzborky@gmail.com", subject, fullMessage);
        await context.Response.WriteAsync("Správa bola úspešne odoslaná.");
    }
    catch (Exception ex)
    {
        await context.Response.WriteAsync($"Chyba pri odosielaní správy: {ex.Message}");
    }
});

// Spustenie aplikácie
app.Run();
