document.getElementById('weatherForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const city = document.getElementById('cityInput').value; // Get the city input value

    try {
        // Fetch current weather data from the API for the entered city
        const response = await fetch(`/api/weather/current/${city}`);
        if (!response.ok) {
            // Throw error if response is not successful
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json(); // Parse JSON response
        console.log(data); // Log data for debugging

        // Check if weather data exists and has at least one entry
        if (data.weather && data.weather.length > 0) {
            const temperature = data.main.temp; // Get current temperature
            // Display current weather information
            document.getElementById('weatherResult').innerHTML = `
                <h2>Počasie v ${data.name}</h2>
                <p>Teplota: ${temperature} °C</p>
                <p>Stav: ${data.weather[0].description}</p>
            `;
        } else {
            // Display message if no weather data is available for the city
            document.getElementById('weatherResult').innerHTML = `<p>Žiadne údaje o počasí pre ${city}.</p>`;
            return;
        }

        // Fetch 5-day weather forecast data from the API
        const forecastResponse = await fetch(`/api/weather/forecast/${city}`);
        if (!forecastResponse.ok) {
            // Throw error if forecast response is not successful
            throw new Error('Network response was not ok ' + forecastResponse.statusText);
        }
        const forecastData = await forecastResponse.json(); // Parse forecast JSON data
        console.log(forecastData); // Log forecast data for debugging

        // Check if forecast data contains a list and it is not empty
        if (forecastData.list && Array.isArray(forecastData.list) && forecastData.list.length > 0) {
            let forecast = {};

            // Group forecast entries by date
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString(); // Convert Unix timestamp to date string
                const temperature = item.main.temp; // Extract temperature
                const description = item.weather[0].description; // Extract weather description

                // Initialize date entry if not exists
                if (!forecast[date]) {
                    forecast[date] = {
                        temperatures: [],
                        descriptions: []
                    };
                }

                // Append temperature and description to the date group
                forecast[date].temperatures.push(temperature);
                forecast[date].descriptions.push(description);
            });

            // Build HTML output for the forecast summary
            let forecastHTML = `<h2>Predpoveď na 5 dní:</h2><ul>`;
            for (const date in forecast) {
                // Calculate average temperature for the day
                const avgTemp = (forecast[date].temperatures.reduce((a, b) => a + b, 0) / forecast[date].temperatures.length).toFixed(2);
                const mostCommonDescription = forecast[date].descriptions[0]; // Use first description as representative

                // Get the weekday name in Slovak locale
                const dayName = new Date(date).toLocaleDateString('sk-SK', { weekday: 'long' });

                // Append list item with day name, date, average temperature, and description
                forecastHTML += `<li>${dayName}, ${date}: ${avgTemp} °C, ${mostCommonDescription}</li>`;
            }
            forecastHTML += `</ul>`;
            // Display the forecast HTML in the forecastResult element
            document.getElementById('forecastResult').innerHTML = forecastHTML;
        } else {
            // Display message if no forecast data is available for the city
            document.getElementById('forecastResult').innerHTML = `<p>Žiadna predpoveď pre ${city}.</p>`;
        }

    } catch (error) {
        // Display error message if any error occurs during fetch or processing
        document.getElementById('weatherResult').innerHTML = `
            <p>Chyba: ${error.message}</p>
        `;
    }
});
