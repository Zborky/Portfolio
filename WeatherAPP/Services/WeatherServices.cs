using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class WeatherServices
{
    private readonly HttpClient _httpClient;
    private const string ApiKey = ""; // OpenWeather API key

    public WeatherServices(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.openweathermap.org/data/2.5/"); // Set base address for API requests
    }

    // Method to retrieve current weather data for a given city
    public async Task<WeatherResponse?> GetWeatherAsync(string city)
    {
        // Send GET request to the weather endpoint with city name, API key, metric units, and Slovak language
        var response = await _httpClient.GetAsync($"weather?q={city}&appid={ApiKey}&units=metric&lang=sk");

        if (response.IsSuccessStatusCode)
        {
            // Deserialize the response JSON into a WeatherResponse object
            var weatherResponse = await response.Content.ReadFromJsonAsync<WeatherResponse>();
            return weatherResponse ?? throw new InvalidOperationException("Weather data could not be deserialized.");
        }

        // Return null if the response was not successful
        return null;
    }

    // Method to retrieve 5-day weather forecast for a given city
    public async Task<ForecastResponse?> GetForecastAsync(string city)
    {
        // Send GET request to the forecast endpoint with city name, API key, metric units, and Slovak language
        var response = await _httpClient.GetAsync($"forecast?q={city}&appid={ApiKey}&units=metric&lang=sk");

        if (response.IsSuccessStatusCode)
        {
            // Deserialize the response JSON into a ForecastResponse object
            var forecastResponse = await response.Content.ReadFromJsonAsync<ForecastResponse>();

            // Ensure the response contains valid forecast data
            if (forecastResponse == null || forecastResponse.List == null || forecastResponse.List.Count == 0)
            {
                throw new InvalidOperationException("No forecast data found or deserialization failed.");
            }

            return forecastResponse;
        }

        // Return null if the response was not successful
        return null;
    }

    // Models for deserializing API responses
    public class WeatherResponse
    {
        public Main? Main { get; set; } // Contains temperature and other main data
        public Weather[]? Weather { get; set; } // Contains descriptions of weather conditions
        public string? Name { get; set; } // City name
        public int? RoundedTemperature => Main?.Temp != null ? (int)Math.Round(Main.Temp) : null; // Rounds temperature to an integer
    }

    public class ForecastResponse
    {
        public List<ForecastItem> List { get; set; } = new(); // List of forecast items
    }

    public class ForecastItem
    {
        public Main? Main { get; set; } // Contains temperature and other main data
        public Weather[]? Weather { get; set; } // Contains descriptions of weather conditions
        public long Dt { get; set; } // Unix timestamp for the forecasted time

        // Converts Unix timestamp to DateTime
        public DateTime DateTime => DateTimeOffset.FromUnixTimeSeconds(Dt).DateTime;

        public int? RoundedTemperature => Main?.Temp != null ? (int)Math.Round(Main.Temp) : null; // Rounds temperature to an integer
    }

    public class Main
    {
        public double Temp { get; set; } // Current temperature
    }

    public class Weather
    {
        public string? Description { get; set; } // Weather condition description
    }
}
