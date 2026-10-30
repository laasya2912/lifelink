/**
 * geocodingApi.js
 * -----------------------------------------------------------------------
 * REAL PUBLIC API: OpenStreetMap Nominatim (Reverse Geocoding)
 * Endpoint: https://nominatim.openstreetmap.org/reverse
 *
 * Converts latitude/longitude into a human-readable address.
 *
 * Usage policy note: Nominatim's public instance has a strict rate
 * limit (max 1 request/second, no heavy/automated polling). This
 * module only calls the API when explicitly triggered by an incident
 * event (never on a timer/poll loop), and results are cached in
 * memory per-session to avoid redundant lookups of the same
 * coordinates.
 * -----------------------------------------------------------------------
 */

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

export const ADDRESS_SOURCE = 'OpenStreetMap Nominatim';

const cache = new Map();

/**
 * Reverse-geocodes a coordinate pair into a readable address.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{displayName:string, city:string, state:string, country:string, source:string, isFallback:boolean, error:string|null}>}
 */
export async function reverseGeocode(latitude, longitude) {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const url = `${NOMINATIM_ENDPOINT}?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Nominatim usage policy requests a descriptive identifier.
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim responded with status ${response.status}`);
    }

    const data = await response.json();

    const result = {
      displayName: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        'Unknown',
      state: data.address?.state || 'Unknown',
      country: data.address?.country || 'Unknown',
      source: ADDRESS_SOURCE,
      isFallback: false,
      error: null,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    return {
      displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (coordinates only)`,
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      source: ADDRESS_SOURCE,
      isFallback: true,
      error: `Address lookup unavailable. (${err.message})`,
    };
  }
}
