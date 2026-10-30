/**
 * weatherApi.js
 * -----------------------------------------------------------------------
 * REAL PUBLIC API: Open-Meteo
 * Endpoint: https://api.open-meteo.com/v1/forecast
 *
 * Weather is informational only. It is not used for medical diagnosis or
 * automatic severity decisions.
 * -----------------------------------------------------------------------
 */

const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'lifelink_weather_cache';
const CACHE_TTL_MS = 5 * 60 * 1000;

export const WEATHER_SOURCE = 'Open-Meteo';

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || data.key !== key) return null;
    if (Date.now() - data.savedAt > CACHE_TTL_MS) return null;
    return data.value;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ key, savedAt: Date.now(), value }));
  } catch {
    // Ignore storage restrictions.
  }
}

const memoryCache = new Map();
const inFlight = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch current weather conditions for a coordinate pair.
 */
export async function getEnvironmentalContext(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;

  const memory = memoryCache.get(cacheKey);
  if (memory && Date.now() - memory.savedAt < CACHE_TTL_MS) return memory.value;

  const stored = readCache(cacheKey);
  if (stored) {
    memoryCache.set(cacheKey, { savedAt: Date.now(), value: stored });
    return stored;
  }

  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const request = (async () => {
    const url = `${OPEN_METEO_ENDPOINT}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    let lastError = null;

    // A short retry handles transient 429/5xx responses without slowing the
    // normal successful demo path.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const current = data?.current;

        if (!current) throw new Error('No current weather data returned');

        const value = {
          temperatureC: Number.isFinite(current.temperature_2m) ? current.temperature_2m : null,
          windKph: Number.isFinite(current.wind_speed_10m) ? current.wind_speed_10m : null,
          precipitationMm: Number.isFinite(current.precipitation) ? current.precipitation : null,
          condition: WEATHER_CODE_MAP[current.weather_code] || 'Current conditions',
          source: WEATHER_SOURCE,
          isFallback: false,
          error: null,
        };

        memoryCache.set(cacheKey, { savedAt: Date.now(), value });
        writeCache(cacheKey, value);
        return value;
      } catch (err) {
        lastError = err;
        if (attempt === 0) await sleep(900);
      }
    }

    // Do not break the incident flow when a public weather provider is busy.
    // A previously cached value is preferred; otherwise show a clear demo
    // fallback instead of exposing a raw 429/abort error in the UI.
    const stale = readCache(cacheKey);
    if (stale) return { ...stale, isFallback: true, error: null };

    return {
      temperatureC: null,
      windKph: null,
      precipitationMm: null,
      condition: 'Weather temporarily unavailable',
      source: WEATHER_SOURCE,
      isFallback: true,
      error: null,
      providerError: lastError?.message || null,
    };
  })();

  inFlight.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inFlight.delete(cacheKey);
  }
}
