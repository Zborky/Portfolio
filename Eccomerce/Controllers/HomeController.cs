using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using EshopCrud.Models;

namespace EshopCrud.Controllers;

/// <summary>
/// HomeController je základný controller pre aplikáciu, ktorý obsahuje akcie pre zobrazenie úvodnej strany, stránky s informáciami o ochrane súkromia a stránky s chybovými hláškami.
/// </summary>
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    /// <summary>
    /// Konštruktor triedy HomeController, ktorý prijímajú logger.
    /// </summary>
    /// <param name="logger">Instancia triedy ILogger, ktorá sa používa na logovanie informácií o chybách.</param>
    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Akcia Index, ktorá vráti pohľad na úvodnú stranu aplikácie.
    /// </summary>
    /// <returns>Pohľad na úvodnú stranu aplikácie.</returns>
    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// Akcia Privacy, ktorá vráti pohľad na stránku s informáciami o ochrane súkromia.
    /// </summary>
    /// <returns>Pohľad na stránku s informáciami o ochrane súkromia.</returns>
    public IActionResult Privacy()
    {
        return View();
    }

    /// <summary>
    /// Akcia Error, ktorá vráti pohľad na stránku s chybovými hláškami. Táto akcia sa volá automaticky, ak sa v aplikácii vyskytne nejaká chyba.
    /// </summary>
    /// <returns>Pohľad na stránku s chybovými hláškami.</returns>
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}


