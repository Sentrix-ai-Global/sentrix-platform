// ============================================================
// SENTRIX — mapServices.ts
// Todas as APIs do mapa em um único arquivo
// ============================================================

// ─── TIPOS EXPORTADOS ────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  windspeed: number;
  humidity: number;
  precipitation: number;
  weathercode: number;
  lat: number;
  lon: number;
  city: string;
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

export interface GdacsEvent {
  lat: number;
  lon: number;
  title: string;
  type: string;
  alertLevel: "green" | "orange" | "red";
  country: string;
  date: string;
}

// ─── WEATHER CODES ───────────────────────────────────────────

export const weatherCodes: Record<number, { label: string; icon: string }> = {
  0:  { label: "Céu limpo",         icon: "☀️" },
  1:  { label: "Principalmente limpo", icon: "🌤️" },
  2:  { label: "Parcialmente nublado", icon: "⛅" },
  3:  { label: "Nublado",           icon: "☁️" },
  45: { label: "Neblina",           icon: "🌫️" },
  48: { label: "Neblina com gelo",  icon: "🌫️" },
  51: { label: "Garoa leve",        icon: "🌦️" },
  53: { label: "Garoa moderada",    icon: "🌦️" },
  55: { label: "Garoa intensa",     icon: "🌧️" },
  61: { label: "Chuva leve",        icon: "🌧️" },
  63: { label: "Chuva moderada",    icon: "🌧️" },
  65: { label: "Chuva intensa",     icon: "🌧️" },
  71: { label: "Neve leve",         icon: "🌨️" },
  80: { label: "Pancadas de chuva", icon: "⛈️" },
  95: { label: "Tempestade",        icon: "⛈️" },
  99: { label: "Tempestade severa", icon: "🌀️" },
};

// ─── FUNÇÕES DE COR / TAMANHO ────────────────────────────────

export function quakeColor(mag: number): string {
  if (mag >= 7) return "#ef4444";
  if (mag >= 5) return "#f97316";
  if (mag >= 3) return "#f59e0b";
  return "#22c55e";
}

export function quakeRadius(mag: number): number {
  if (mag >= 7) return 14;
  if (mag >= 5) return 10;
  if (mag >= 3) return 6;
  return 4;
}

export function airQualityColor(level: AirQualityFeature["level"]): string {
  if (level === "hazardous") return "#ef4444";
  if (level === "poor")      return "#f97316";
  if (level === "moderate")  return "#f59e0b";
  return "#22c55e";
}

export function floodColor(level: FloodFeature["level"]): string {
  if (level === "critical")  return "#ef4444";
  if (level === "attention") return "#f59e0b";
  return "#22c55e";
}

export function gdacsColor(level: GdacsEvent["alertLevel"]): string {
  if (level === "red")    return "#ef4444";
  if (level === "orange") return "#f97316";
  return "#22c55e";
}

// ─── API: TERREMOTOS USGS ────────────────────────────────────

export async function fetchEarthquakes(): Promise<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number }[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    );
    const data = await res.json();
    const results: { lat: number; lon: number; mag: number; place: string; time: number; depth: number }[] = [];
    for (const f of data.features) {
      const p = f.properties;
      const c = f.geometry.coordinates;
      if (p.mag && p.mag > 0) {
        results.push({ lat: c[1], lon: c[0], mag: p.mag, place: p.place || "—", time: p.time, depth: c[2] });
      }
    }
    return results;
  } catch (_) {
    return [];
  }
}

// ─── API: INCÊNDIOS NASA FIRMS ───────────────────────────────

export async function fetchNasaFires(): Promise<{ lat: number; lon: number; brightness: number; confidence: string }[]> {
  try {
    const url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_7d.csv";
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);
    const results: { lat: number; lon: number; brightness: number; confidence: string }[] = [];
    for (const line of lines.slice(0, 500)) {
      const cols = line.split(",");
      if (cols.length >= 5) {
        const lat = parseFloat(cols[0]);
        const lon = parseFloat(cols[1]);
        const brightness = parseFloat(cols[2]);
        const confidence = cols[8] || "n";
        if (!isNaN(lat) && !isNaN(lon)) {
          results.push({ lat, lon, brightness, confidence });
        }
      }
    }
    return results;
  } catch (_) {
    return [];
  }
}

// ─── API: QUEIMADAS INPE ─────────────────────────────────────

export async function fetchInpeFires(): Promise<{ lat: number; lon: number; municipio: string; estado: string; bioma: string }[]> {
  try {
    const url = "https://queimadas.dgi.inpe.br/api/focos/?pais_id=33&quantidade=200";
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const data = await res.json();
    const results: { lat: number; lon: number; municipio: string; estado: string; bioma: string }[] = [];
    if (Array.isArray(data)) {
      for (const f of data) {
        if (f.latitude && f.longitude) {
          results.push({
            lat: parseFloat(f.latitude),
            lon: parseFloat(f.longitude),
            municipio: f.municipio || "—",
            estado: f.estado || "—",
            bioma: f.bioma || "—",
          });
        }
      }
    }
    return results;
  } catch (_) {
    return [];
  }
}

// ─── API: GDACS ONU ──────────────────────────────────────────

export async function fetchGdacsEvents(): Promise<GdacsEvent[]> {
  try {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent("https://www.gdacs.org/xml/rss.xml")}`;
    const res = await fetch(proxy);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = xml.querySelectorAll("item");
    const results: GdacsEvent[] = [];
    items.forEach(item => {
      try {
        const title   = item.querySelector("title")?.textContent || "—";
        const lat     = parseFloat(item.querySelector("geo\\:lat, lat")?.textContent || "0");
        const lon     = parseFloat(item.querySelector("geo\\:long, long")?.textContent || "0");
        const alert   = (item.querySelector("gdacs\\:alertlevel, alertlevel")?.textContent || "green").toLowerCase() as GdacsEvent["alertLevel"];
        const type    = item.querySelector("gdacs\\:eventtype, eventtype")?.textContent || "—";
        const country = item.querySelector("gdacs\\:country, country")?.textContent || "—";
        const date    = item.querySelector("pubDate")?.textContent || new Date().toISOString();
        if (lat !== 0 && lon !== 0) {
          results.push({ lat, lon, title, type, alertLevel: alert, country, date });
        }
      } catch (_) {}
    });
    return results;
  } catch (_) {
    return [];
  }
}

// ─── API: ENCHENTES OPEN-METEO ───────────────────────────────

export async function fetchFloodData(lat: number, lon: number): Promise<FloodFeature | null> {
  try {
    const res = await fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`
    );
    const data = await res.json();
    const discharge = data.daily?.river_discharge?.[0] ?? 0;
    const level: FloodFeature["level"] = discharge > 1000 ? "critical" : discharge > 300 ? "attention" : "normal";
    return { lat, lon, discharge, level };
  } catch (_) {
    return null;
  }
}

// ─── API: QUALIDADE DO AR OPEN-METEO ─────────────────────────

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityFeature | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10`
    );
    const data = await res.json();
    const aqi  = data.current?.european_aqi  ?? 0;
    const pm25 = data.current?.pm2_5         ?? 0;
    const pm10 = data.current?.pm10          ?? 0;
    const level: AirQualityFeature["level"] = aqi > 150 ? "hazardous" : aqi > 100 ? "poor" : aqi > 50 ? "moderate" : "good";
    return { lat, lon, aqi, pm25, pm10, level };
  } catch (_) {
    return null;
  }
}

// ─── API: METEOROLOGIA OPEN-METEO ────────────────────────────

export async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation&forecast_days=1`
    );
    const data = await res.json();
    const cw = data.current_weather;
    return {
      temperature:   cw.temperature,
      windspeed:     cw.windspeed,
      humidity:      data.hourly?.relativehumidity_2m?.[0] ?? 0,
      precipitation: data.hourly?.precipitation?.[0] ?? 0,
      weathercode:   cw.weathercode,
      lat, lon, city,
    };
  } catch (_) {
    return null;
  }
}