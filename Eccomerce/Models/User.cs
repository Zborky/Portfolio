using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EshopCrud.Models;    
public class User
{
    public int UserId { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string Email { get; set; }
    public  string Role { get; set; } = "User";

    public List<Order> Orders { get; set; } = new List<Order>();


    

}