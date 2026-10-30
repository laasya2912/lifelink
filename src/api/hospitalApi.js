
/**
 * hospitalApi.js
 * Hospital lookup using OpenStreetMap Nominatim.
 */

export const HOSPITAL_SOURCE = 'OpenStreetMap Nominatim';

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getNearbyHospitals(
  latitude,
  longitude,
  radius = 8000
) {
  try {
    const latDelta = radius / 111320;
    const lonDelta =
      radius / (111320 * Math.cos((latitude * Math.PI) / 180));

    const url = new URL(
      'https://nominatim.openstreetmap.org/search'
    );

    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', 'hospital');
    url.searchParams.set('limit', '50');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('viewbox', [
      longitude - lonDelta,
      latitude + latDelta,
      longitude + lonDelta,
      latitude - latDelta,
    ].join(','));
    url.searchParams.set('bounded', '1');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const data = await response.json();

    const hospitals = data
      .filter((item) => {
        const category = item.category || item.class;

        return (
          category === 'amenity' &&
          item.type === 'hospital'
        );
      })
      .map((item) => {
        const lat = Number(item.lat);
        const lon = Number(item.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          return null;
        }

        const distance = distanceKm(
          latitude,
          longitude,
          lat,
          lon
        );

        if (distance > radius / 1000) {
          return null;
        }

        return {
          id: `nominatim-${item.place_id}`,
          name: item.name || item.display_name?.split(',')[0] || 'Unnamed Hospital',
          latitude: lat,
          longitude: lon,
          address: item.display_name || null,
          emergency: false,
          distanceKm: Math.round(distance * 100) / 100,
          source: HOSPITAL_SOURCE,
          availability: 'Not verified',
          availabilityLabel: 'Not verified',
          capabilityLabel: 'Emergency capability not verified',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (!hospitals.length) {
      throw new Error(
        'No records classified as hospitals were found within this radius'
      );
    }

    console.log('Verified hospital category records:', hospitals);

    return {
      hospitals: hospitals.slice(0, 8),
      source: HOSPITAL_SOURCE,
      isFallback: false,
      error: null,
    };
  } catch (error) {
    console.error('Hospital lookup failed:', error.message);

    return {
      hospitals: [],
      source: HOSPITAL_SOURCE,
      isFallback: true,
      error: error.message,
    };
  }
}

export function getFallbackHospitals(latitude, longitude) {
  const fallbackLat = latitude + 0.0045;
  const fallbackLon = longitude + 0.0045;

  return [
    {
      id: 'fallback-nearest-hospital',
      name: 'Hospital Location Unavailable',
      latitude: fallbackLat,
      longitude: fallbackLon,
      address: 'Real hospital data could not be retrieved',
      emergency: false,
      distanceKm: Math.round(
        distanceKm(latitude, longitude, fallbackLat, fallbackLon) * 100
      ) / 100,
      source: 'Prototype Fallback',
      availability: 'Not verified',
      availabilityLabel: 'Not verified',
      capabilityLabel: 'Emergency capability not verified',
    },
  ];
}
