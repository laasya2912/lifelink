/**
 * locationApi.js
 * -----------------------------------------------------------------------
 * REAL PUBLIC API: Browser Geolocation API (navigator.geolocation)
 *
 * This module obtains the device's actual latitude/longitude from the
 * browser, when the user grants permission. If geolocation is
 * unavailable, denied, or times out, it falls back to fixed prototype
 * coordinates and CLEARLY labels the result as "Simulated GPS" — it is
 * never presented as real GPS data.
 * -----------------------------------------------------------------------
 */

// Fallback prototype coordinates (Vijayawada, Andhra Pradesh, India)
export const FALLBACK_COORDINATES = {
  latitude: 16.5062,
  longitude: 80.648,
};

export const LOCATION_SOURCE = {
  REAL: 'Browser Geolocation',
  SIMULATED: 'Simulated GPS',
};

/**
 * Attempts to retrieve the current device location using the browser's
 * native Geolocation API.
 *
 * @param {Object} options
 * @param {number} options.timeout - ms to wait before failing (default 8000)
 * @returns {Promise<{latitude:number, longitude:number, accuracy:number|null, source:string, error:string|null}>}
 */
export function getCurrentLocation(options = {}) {
  const { timeout = 8000 } = options;

  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({
        latitude: FALLBACK_COORDINATES.latitude,
        longitude: FALLBACK_COORDINATES.longitude,
        accuracy: null,
        source: LOCATION_SOURCE.SIMULATED,
        error: 'Geolocation API not supported by this browser.',
      });
      return;
    }

    const timer = setTimeout(() => {
      resolve({
        latitude: FALLBACK_COORDINATES.latitude,
        longitude: FALLBACK_COORDINATES.longitude,
        accuracy: null,
        source: LOCATION_SOURCE.SIMULATED,
        error: 'Location request timed out — using simulated GPS.',
      });
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: LOCATION_SOURCE.REAL,
          error: null,
        });
      },
      (err) => {
        clearTimeout(timer);
        resolve({
          latitude: FALLBACK_COORDINATES.latitude,
          longitude: FALLBACK_COORDINATES.longitude,
          accuracy: null,
          source: LOCATION_SOURCE.SIMULATED,
          error: `Location permission unavailable (${err.message}) — using simulated GPS.`,
        });
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 0,
      }
    );
  });
}
