const NASA_FIRMS_KEY = "5dcf43011bc38a1990556e9ea8bc4f44";

export interface EarthquakeFeature {
  mag: number;
  place: string;
  time: number;
  lat: number;
  lon: number;
  depth: number;
}

export interface FireFeature {
  lat: number;
  lon: number;
  brightness: number;
  confidence: string;
}

export interface InpeFeature {
  lat: number;
  lon: number;
  municipio: string;
  estado: string;
  bioma: string;
}

export interface FloodFeature {
  lat: number;
  lon: number;
  discharge: number;
  level: "normal" | "attention" | "critical";
}

export interface AirQualityFeature {
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  pm10: number;
  level: "good" | "moderate" | "poor" | "hazardous";
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  humidity: number;
  precipitation: number;
  weathercode: number;
  city: string;
  lat: number;
  lon: number;
}

export interface GdacsEvent {
  lat: number;
  lon: number;
  title: string;
  type: string;
  alertLevel: "green" | "orange" | "red";
  country: string;
  date: string;
  url: string;
}

export async function fetchEarthquakes(): Promise<EarthquakeFeature[]> {
  try {
    const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
    const data = await res.json();
    return data.features
      .filter((f: any) => f.properties.mag && f.properties.mag >= 1)
      .map((f: any) => ({
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
      }));
  } catch {
    return [];
  }
}

export async function fetchNasaFires(): Promise<FireFeature[]> {
  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_KEY}/VIIRS_SNPP_NRT/world/1`;
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);
    return lines.slice(0, 800).reduce<FireFeature[]>((acc, line) => {
      const cols = line.split(",");
      const lat = parseFloat(cols[0]);
      const lon = parseFloat(cols[1]);
      const brightness = parseFloat(cols[2]);
      const confidence = cols[9] || "n/a";
      if (!isNaN(lat) && !isNaN(lon)) acc.push({ lat, lon, brightness, confidence });
      return acc;
    }, []);
  } catch {
    return [];
  }
}

export async function fetchInpeFires(): Promise<InpeFeature[]> {
  try {
    const res = await fetch("https://queimadas.dgi.inpe.br/api/focos/?pais_id=33&quantidade=1000");
    const data = await res.json();
    return data.reduce<InpeFeature[]>((acc: InpeFeature[], f: any) => {
      const lat = parseFloat(f.latitude);
      const lon = parseFloat(f.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        acc.push({
          lat, lon,
          municipio: f.municipio || "—",
          estado: f.estado || "—",
          bioma: f.bioma || "—",
        });
      }
      return acc;
    }, []);
  } catch {
    return [];
  }
}

export async function fetchGdacsEvents(): Promise<GdacsEvent[]> {
  try {
    const res = await fetch(
      "https://www.gdacs.org/xml/rss.xml",
      { headers: { "Accept": "application/rss+xml, application/xml, text/xml" } }
    );
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = Array.from(xml.querySelectorAll("item"));

    return items.slice(0, 50).reduce<GdacsEvent[]>((acc, item) => {
      try {
        const title   = item.querySelector("title")?.textContent || "—";
        const link    = item.querySelector("link")?.textContent  || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";

        const geoLat = item.getElementsByTagNameNS("*", "lat")[0]?.textContent
          || item.querySelector("geo\\:lat, lat")?.textContent || "";
        const geoLon = item.getElementsByTagNameNS("*", "long")[0]?.textContent
          || item.querySelector("geo\\:long, long")?.textContent || "";

        const lat = parseFloat(geoLat);
        const lon = parseFloat(geoLon);
        if (isNaN(lat) || isNaN(lon)) return acc;

        const alertLevelRaw = item.getElementsByTagNameNS("*", "alertlevel")[0]?.textContent?.toLowerCase()
          || item.querySelector("gdacs\\:alertlevel, alertlevel")?.textContent?.toLowerCase()
          || "green";

        const alertLevel: GdacsEvent["alertLevel"] =
          alertLevelRaw === "red" ? "red" : alertLevelRaw === "orange" ? "orange" : "green";

        const eventType = item.getElementsByTagNameNS("*", "eventtype")[0]?.textContent
          || item.querySelector("gdacs\\:eventtype, eventtype")?.textContent
          || "—";

        const country = item.getElementsByTagNameNS("*", "country")[0]?.textContent
          || item.querySelector("gdacs\\:country, country")?.textContent
          || "—";

        acc.push({
          lat, lon,
          title: title.trim(),
          type: eventType.trim(),
          alertLevel,
          country: country.trim(),
          date: pubDate.trim(),
          url: link.trim(),
        });
      } catch {
        // item malformado — ignora
      }
      return acc;
    }, []);
  } catch {
    return [];
  }
}

export async function fetchFloodData(lat: number, lon: number): Promise<FloodFeature | null> {
  try {
    const res = await fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`
    );
    const data = await res.json();
    const discharge: number = data.daily?.river_discharge?.[0] ?? 0;
    const level: FloodFeature["level"] =
      discharge > 500 ? "critical" : discharge > 200 ? "attention" : "normal";
    return { lat, lon, discharge, level };
  } catch {
    return null;
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityFeature | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5`
    );
    const data = await res.json();
    const c = data.current;
    const aqi: number   = c.european_aqi ?? 0;
    const pm25: number  = c.pm2_5 ?? 0;
    const pm10: number  = c.pm10  ?? 0;
    const level: AirQualityFeature["level"] =
      aqi > 100 ? "hazardous" : aqi > 50 ? "poor" : aqi > 25 ? "moderate" : "good";
    return { lat, lon, aqi, pm25, pm10, level };
  } catch {
    return null;
  }
}

export async function fetchWeather(lat: number, lon: number, cityName?: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
    );
    const data = await res.json();
    const c = data.current;
    return {
      temperature: c.temperature_2m,
      windspeed:   c.wind_speed_10m,
      humidity:    c.relative_humidity_2m,
      precipitation: c.precipitation,
      weathercode: c.weather_code,
      city: cityName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      lat,
      lon,
    };
  } catch {
    return null;
  }
}

export const quakeColor = (mag: number): string =>
  mag >= 7 ? "#ef4444" : mag >= 5 ? "#f97316" : mag >= 3 ? "#f59e0b" : "#22c55e";

export const quakeRadius = (mag: number): number => Math.max(6, mag * 5);

export const airQualityColor = (level: AirQualityFeature["level"]): string => {
  const map = { good: "#22c55e", moderate: "#f59e0b", poor: "#f97316", hazardous: "#ef4444" };
  return map[level];
};

export const floodColor = (level: FloodFeature["level"]): string => {
  const map = { normal: "#22c55e", attention: "#f59e0b", critical: "#ef4444" };
  return map[level];
};

export const gdacsColor = (level: GdacsEvent["alertLevel"]): string => {
  const map = { green: "#22c55e", orange: "#f97316", red: "#ef4444" };
  return map[level];
};

export const weatherCodes: Record<number, { label: string; icon: string }> = {
  0:  { label: "Céu limpo",            icon: "☀️"  },
  1:  { label: "Predominante limpo",   icon: "🌤️" },
  2:  { label: "Parcialmente nublado", icon: "⛅"  },
  3:  { label: "Nublado",              icon: "☁️"  },
  45: { label: "Neblina",              icon: "🌫️" },
  51: { label: "Garoa leve",           icon: "🌦️" },
  61: { label: "Chuva leve",           icon: "🌧️" },
  63: { label: "Chuva moderada",       icon: "🌧️" },
  65: { label: "Chuva intensa",        icon: "🌧️" },
  71: { label: "Neve leve",            icon: "🌨️" },
  80: { label: "Pancadas de chuva",    icon: "⛈️" },
  95: { label: "Tempestade",           icon: "⛈️" },
  99: { label: "Tempestade severa",    icon: "🌩️" },
};