using Microsoft.AspNetCore.Mvc;

[ApiController]
// Specifies the base route for all actions in this controller.
[Route("api/[controller]")]
public class WeatherController : ControllerBase
{
    private readonly WeatherServices _weatherService;

    // Constructor for dependency injection of WeatherServices.
    public WeatherController(WeatherServices weatherService)
    {
        _weatherService = weatherService;
    }

    [HttpGet("current/{city}")]
    // Handles a GET request to retrieve current weather data for a specific city.
    public async Task<IActionResult> GetWeather(string city)
    {
        try
        {
            // Calls the weather service to get current weather data.
            var weatherData = await _weatherService.GetWeatherAsync(city);
            
            if (weatherData == null)
            {
                // Returns a 404 response if no data is found.
                return NotFound();
            }

            // Returns a 200 response with the weather data.
            return Ok(weatherData);
        }
        catch (Exception ex)
        {
            // Logs the error message to the console.
            Console.WriteLine($"Error: {ex.Message}");
            // Returns a 500 response if an internal server error occurs.
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("forecast/{city}")]
    // Handles a GET request to retrieve weather forecast data for a specific city.
    public async Task<IActionResult> GetForecast(string city)
    {
        try
        {
            // Calls the weather service to get forecast data.
            var forecastData = await _weatherService.GetForecastAsync(city);
            
            if (forecastData == null)
            {
                // Returns a 404 response if no data is found.
                return NotFound();
            }

            // Returns a 200 response with the forecast data.
            return Ok(forecastData);
        }
        catch (Exception ex)
        {
            // Logs the error message to the console.
            Console.WriteLine($"Error: {ex.Message}");
            // Returns a 500 response if an internal server error occurs.
            return StatusCode(500, "Internal server error");
        }
    }
}
