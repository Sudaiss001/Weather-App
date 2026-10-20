
import { useState } from "react";

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

type WeatherDetailProps = {
  label: string;
  value: string;
  icon: string;
};

type LocationData = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

function WeatherDetail({
  label,
  value,
  icon,
}: WeatherDetailProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {icon} {label}
      </p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "Rainy";
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Snowy";
  }
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Weather conditions unavailable";
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "🌧️";
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌦️";
}

function App() {
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchCity(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const cityName = city.trim();

    if (!cityName) {
      setError("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Step 1: Find the city.
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for this city.");
      }

      const geoData: { results?: LocationData[] } =
        await geoResponse.json();

      const foundLocation = geoData.results?.[0];

      if (!foundLocation) {
        throw new Error("City not found. Try another city name.");
      }

      // Step 2: Get current weather using the coordinates.
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${foundLocation.latitude}&longitude=${foundLocation.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to retrieve weather data.");
      }

      const weatherData: {
        current: {
          temperature_2m: number;
          relative_humidity_2m: number;
          wind_speed_10m: number;
          weather_code: number;
        };
      } = await weatherResponse.json();

      // Step 3: Update React state with the results.
      setLocation(foundLocation);
      setWeather({
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
      });
    } catch (err) {
      setWeather(null);
      setLocation(null);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Sudaiss<span className="text-sky-400">Weather</span>
          </h1>

          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            Live Weather App
          </span>
        </header>

        <form
          className="mb-4 flex gap-3"
          onSubmit={searchCity}
        >
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Search for a city..."
            aria-label="City name"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {loading && (
          <p className="mb-4 text-sky-400" role="status">
            Fetching the latest weather...
          </p>
        )}

        {error && (
          <p
            className="mb-4 rounded-xl border border-red-900 bg-red-950/50 p-4 text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        {weather && location ? (
          <>
            <section className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl sm:p-10">
              <p className="text-slate-400">Current weather in</p>

              <h2 className="mt-1 text-3xl font-bold">
                {location.name}
                {location.country ? `, ${location.country}` : ""}
              </h2>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-7xl font-light tracking-tight">
                    {Math.round(weather.temperature)}°C
                  </p>

                  <p className="mt-3 text-lg text-sky-300">
                    {getWeatherDescription(weather.weatherCode)}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Current conditions from Open-Meteo
                  </p>
                </div>

                <div
                  className="text-8xl"
                  role="img"
                  aria-label={getWeatherDescription(weather.weatherCode)}
                >
                  {getWeatherIcon(weather.weatherCode)}
                </div>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <WeatherDetail
                label="Humidity"
                value={`${weather.humidity}%`}
                icon="💧"
              />

              <WeatherDetail
                label="Wind speed"
                value={`${weather.windSpeed} km/h`}
                icon="💨"
              />

              <WeatherDetail
                label="Weather code"
                value={String(weather.weatherCode)}
                icon="🌡️"
              />
            </section>
          </>
        ) : (
          !loading &&
          !error && (
            <section className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
              <p className="text-5xl">🌦️</p>
              <h2 className="mt-4 text-xl font-semibold">
                Your weather awaits
              </h2>
              <p className="mt-2 text-slate-400">
                Search for a city to see its current weather.
              </p>

              <button
                type="button"
                onClick={() => void searchCity()}
                className="mt-5 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 hover:bg-sky-400"
              >
                Get Minna weather
              </button>
            </section>
          )
        )}

        <footer className="mt-12 text-center text-sm text-slate-500">
          Built with React, TypeScript & Tailwind CSS
        </footer>
      </div>
    </main>
  );
}

export default App;
