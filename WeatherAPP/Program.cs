using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<WeatherServices>(); // Add HTTP Client to WeatherServices
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); //Support for static files

// Maps the endpoint to the WeatherServices and Index.html
app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("wwwroot/index.html");
});

// Endpoint for get actual weather
app.MapGet("/api/weather/current/{city}", async (string city, WeatherServices weatherServices) =>
{
    var weatherData = await weatherServices.GetWeatherAsync(city);
    return weatherData != null ? Results.Ok(weatherData) : Results.NotFound();
});



// Endpoint pre získanie predpovede počasia na 5 dní
app.MapGet("/api/weather/forecast/{city}", async (string city, WeatherServices weatherServices) =>
{
    var forecastData = await weatherServices.GetForecastAsync(city);
    return forecastData != null ? Results.Ok(forecastData) : Results.NotFound();
});

// Ukážková predpoveď
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
