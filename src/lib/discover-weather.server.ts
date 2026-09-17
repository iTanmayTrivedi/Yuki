import type { WeatherData } from "@/types/discover.types";

type OpenMeteoResponse = {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number; time?: string };
  daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
};

const conditions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Storm with hail",
  99: "Heavy storm with hail",
};

export async function fetchTokyoWeather(): Promise<WeatherData> {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=1";
  const response = await fetch(url, { headers: { "User-Agent": "YukiAI/1.0" } });
  if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
  const data = (await response.json()) as OpenMeteoResponse;
  const temperature = data.current?.temperature_2m;
  const high = data.daily?.temperature_2m_max?.[0];
  const low = data.daily?.temperature_2m_min?.[0];
  if (temperature === undefined || high === undefined || low === undefined) {
    throw new Error("Weather provider returned incomplete data");
  }
  const code = data.current?.weather_code ?? 0;
  return {
    city: "Tokyo, Japan",
    temp_c: Math.round(temperature),
    condition: conditions[code] ?? "Current conditions",
    high_c: Math.round(high),
    low_c: Math.round(low),
    weather_code: code,
    is_day: data.current?.is_day === 1,
    observed_at: data.current?.time ?? new Date().toISOString(),
    source: "Open-Meteo",
    source_url: "https://open-meteo.com/",
  };
}