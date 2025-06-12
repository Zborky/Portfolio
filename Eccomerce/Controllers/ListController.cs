using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EshopCrud.Data;
using EshopCrud.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EshopCrud.Services;
using System;
[ApiController]
[Route("api/[controller]")]
public class OrderItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrderItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetOrderItems()
    {
        // Load Every orders in admin system
        var orders = _context.Orders.ToList();

        // Return data in JSON form
        return Ok(orders);
    }
}
