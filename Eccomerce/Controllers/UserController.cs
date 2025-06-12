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
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        // Load every users from table USERS
        var users = _context.Users.ToList();

        // Return Data in JSON form
        return Ok(users);
    }
}