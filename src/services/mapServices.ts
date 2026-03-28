// ============================================================
// SENTRIX — mapServices.ts
// APIs com fallbacks (CORS / proxies) para dados em produção
// ============================================================

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

/** Pontos iniciais para módulos Enchentes / Ar (bacias e metrópoles). */
export const FLOOD_AIR_SAMPLE_POINTS: { lat: number; lon: number }[] = [
  { lat: -23.55, lon: -46.63 },
  { lat: -3.1, lon: -60.03 },
  { lat: -12.98, lon: -38.52 },
  { lat: -15.78, lon: -47.93 },
  { lat: -1.45, lon: -48.49 },
  { lat: 51.51, lon: -0.12 },
  { lat: 40.71, lon: -74.01 },
];

async function fetchTextViaProxies(targetUrl: string): Promise<string | null> {
  const tryGet = async (url: string): Promise<string | null> => {
    const r = await fetch(url);
    if (!r.ok) return null;
    const t = await r.text();
    const s = t.trim();
    if (!s || s.toLowerCase().startsWith("<!doctype")) return null;
    return t;
  };
  try {
    const t = await tryGet(targetUrl);
    if (t) return t;
  } catch { /* next */ }
  try {
    const u = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const t = await tryGet(u);
    if (t) return t;
  } catch { /* next */ }
  try {
    const u = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = (await r.json()) as { contents?: string };
    if (j.contents && typeof j.contents === "string") return j.contents;
  } catch { /* next */ }
  try {
    const u = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const t = await tryGet(u);
    if (t) return t;
  } catch { /* next */ }
  return null;
}

async function fetchJsonViaProxies(targetUrl: string): Promise<unknown | null> {
  try {
    const r = await fetch(targetUrl);
    if (r.ok) return await r.json();
  } catch { /* next */ }
  try {
    const u = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = (await r.json()) as { contents?: string };
    if (j.contents) return JSON.parse(j.contents);
  } catch { /* next */ }
  try {
    const u = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const r = await fetch(u);
    if (r.ok) return await r.json();
  } catch { /* next */ }
  return null;
}

function inpeRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.focos)) return o.focos as Record<string, unknown>[];
  if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
  return [];
}

function gdacsReadLatLon(item: Element): { lat: number; lon: number } {
  let lat = 0;
  let lon = 0;
  const scan = (el: Element) => {
    for (const c of Array.from(el.children)) {
      const ln = (c.localName || "").toLowerCase();
      const tv = parseFloat(c.textContent || "NaN");
      if (c.children.length === 0 && !Number.isNaN(tv)) {
        if (ln === "lat" || ln.endsWith("lat")) lat = tv;
        if (ln === "long" || ln === "lon" || ln.endsWith("long")) lon = tv;
      }
      scan(c);
    }
  };
  scan(item);
  return { lat, lon };
}

function gdacsChildText(item: Element, names: string[]): string {
  for (const n of names) {
    const els = item.getElementsByTagName("*");
    for (let i = 0; i < els.length; i++) {
      const e = els[i];
      const ln = (e.localName || "").toLowerCase();
      if (ln === n || ln.endsWith(n) || e.tagName.toLowerCase().includes(`:${n}`)) {
        const t = e.textContent?.trim();
        if (t) return t;
      }
    }
  }
  return "—";
}

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

export async function fetchEarthquakes(): Promise<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number }[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: { lat: number; lon: number; mag: number; place: string; time: number; depth: number }[] = [];
    for (const f of data.features || []) {
      const p = f.properties;
      const c = f.geometry?.coordinates;
      if (!c || p?.mag == null || p.mag <= 0) continue;
      results.push({ lat: c[1], lon: c[0], mag: p.mag, place: p.place || "—", time: p.time, depth: c[2] ?? 0 });
    }
    return results;
  } catch {
    return [];
  }
}

export async function fetchNasaFires(): Promise<{ lat: number; lon: number; brightness: number; confidence: string }[]> {
  const url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_7d.csv";
  const text = await fetchTextViaProxies(url);
  if (!text) return [];
  const lines = text.trim().split(/\n/).filter(Boolean);
  const results: { lat: number; lon: number; brightness: number; confidence: string }[] = [];
  for (const line of lines) {
    const cols = line.split(",");
    const h0 = (cols[0] || "").toLowerCase();
    if (h0 === "latitude" || h0 === "lat" || h0.includes("latitude")) continue;
    if (cols.length < 3) continue;
    const lat = parseFloat(cols[0]);
    const lon = parseFloat(cols[1]);
    const brightness = parseFloat(cols[2]) || 0;
    const confCol = cols[cols.length - 1] || cols[9] || cols[8] || "n";
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      results.push({ lat, lon, brightness, confidence: String(confCol).trim() || "n" });
    }
    if (results.length >= 800) break;
  }
  return results;
}

export async function fetchInpeFires(): Promise<{ lat: number; lon: number; municipio: string; estado: string; bioma: string }[]> {
  const url = "https://queimadas.dgi.inpe.br/api/focos/?pais_id=33&quantidade=200";
  const results: { lat: number; lon: number; municipio: string; estado: string; bioma: string }[] = [];
  try {
    const data = await fetchJsonViaProxies(url);
    const rows = inpeRows(data);
    for (const f of rows) {
      const lat = parseFloat(String(f.latitude ?? f.lat ?? ""));
      const lon = parseFloat(String(f.longitude ?? f.lon ?? ""));
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
      results.push({
        lat, lon,
        municipio: String(f.municipio ?? f.municipio_nome ?? "—"),
        estado: String(f.estado ?? f.estado_sigla ?? "—"),
        bioma: String(f.bioma ?? "—"),
      });
    }
  } catch { /* empty */ }
  return results;
}

export async function fetchGdacsEvents(): Promise<GdacsEvent[]> {
  const text = await fetchTextViaProxies("https://www.gdacs.org/xml/rss.xml");
  if (!text) return [];
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    if (xml.querySelector("parsererror")) return [];
    const items = xml.querySelectorAll("item");
    const results: GdacsEvent[] = [];
    items.forEach(item => {
      try {
        const title = item.querySelector("title")?.textContent || "—";
        let { lat, lon } = gdacsReadLatLon(item);
        if (lat === 0 || lon === 0) {
          const blob = item.textContent || "";
          const m = blob.match(/(-?\d{1,2}\.\d+)\s*°?\s*N?[,\s/]+(-?\d{1,3}\.\d+)\s*°?\s*E?/i)
            || blob.match(/lat[itude]*[:\s]+(-?\d+\.\d+).*?lon[gitude]*[:\s]+(-?\d+\.\d+)/i);
          if (m) {
            lat = parseFloat(m[1]);
            lon = parseFloat(m[2]);
          }
        }
        let alert = gdacsChildText(item, ["alertlevel"]).toLowerCase() as GdacsEvent["alertLevel"];
        if (alert !== "red" && alert !== "orange" && alert !== "green") {
          alert = (item.querySelector("alertlevel")?.textContent || "green").toLowerCase() as GdacsEvent["alertLevel"];
        }
        if (alert !== "red" && alert !== "orange" && alert !== "green") alert = "green";
        const type = gdacsChildText(item, ["eventtype"]);
        const country = gdacsChildText(item, ["country"]);
        const date = item.querySelector("pubDate")?.textContent || new Date().toISOString();
        if (lat !== 0 && lon !== 0) {
          results.push({ lat, lon, title, type, alertLevel: alert, country, date });
        }
      } catch { /* skip item */ }
    });
    return results;
  } catch {
    return [];
  }
}

export async function fetchFloodData(lat: number, lon: number): Promise<FloodFeature | null> {
  try {
    const res = await fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || data?.reason) return null;
    const discharge = Number(data.daily?.river_discharge?.[0] ?? 0);
    const level: FloodFeature["level"] = discharge > 1000 ? "critical" : discharge > 300 ? "attention" : "normal";
    return { lat, lon, discharge, level };
  } catch {
    return null;
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityFeature | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cur = data.current;
    if (!cur) return null;
    const aqi = Number(cur.european_aqi ?? 0);
    const pm25 = Number(cur.pm2_5 ?? 0);
    const pm10 = Number(cur.pm10 ?? 0);
    const level: AirQualityFeature["level"] = aqi > 150 ? "hazardous" : aqi > 100 ? "poor" : aqi > 50 ? "moderate" : "good";
    return { lat, lon, aqi, pm25, pm10, level };
  } catch {
    return null;
  }
}

export async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation&forecast_days=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) return null;
    return {
      temperature:   cw.temperature,
      windspeed:     cw.windspeed,
      humidity:      data.hourly?.relativehumidity_2m?.[0] ?? 0,
      precipitation: data.hourly?.precipitation?.[0] ?? 0,
      weathercode:   Number(cw.weathercode ?? 0),
      lat, lon, city,
    };
  } catch {
    return null;
  }
}
