import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon paths (Vite + Leaflet quirk)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function makeIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="background:${color}" class="custom-marker-dot"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const ICONS = {
  accident: makeIcon('#e11d3f'),
  victim: makeIcon('#f59e0b'),
  hospitalSelected: makeIcon('#16a34a'),
  hospital: makeIcon('#2563eb'),
};

/**
 * IncidentMap
 * -----------------------------------------------------------------------
 * REAL PUBLIC API: OpenStreetMap tiles rendered via Leaflet / React
 * Leaflet. Displays the accident location, victim locations, the
 * selected hospital, and nearby hospitals — all using real coordinates
 * returned by the location, geocoding, and hospital APIs where
 * available.
 * -----------------------------------------------------------------------
 */
export default function IncidentMap({ accident, victims = [], hospitals = [], selectedHospitalId, height = 420 }) {
  if (!accident) return null;

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={[accident.latitude, accident.longitude]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[accident.latitude, accident.longitude]} icon={ICONS.accident}>
          <Tooltip permanent direction="top" offset={[0, -8]}>
            Accident
          </Tooltip>
          <Popup>
            <strong>Accident Location</strong>
            <br />
            {accident.latitude.toFixed(5)}, {accident.longitude.toFixed(5)}
          </Popup>
        </Marker>

        {victims.map((v, idx) => (
          <Marker key={`victim-${idx}`} position={[v.latitude, v.longitude]} icon={ICONS.victim}>
            <Tooltip permanent direction="top" offset={[0, -8]}>
              Victim {idx + 1}
            </Tooltip>
            <Popup>
              <strong>Victim {idx + 1}</strong>
              <br />
              Status: {v.status}
            </Popup>
          </Marker>
        ))}

        {hospitals.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={h.id === selectedHospitalId ? ICONS.hospitalSelected : ICONS.hospital}
          >
            <Popup>
              <strong>{h.name}</strong>
              <br />
              {h.distanceKm} km away
              <br />
              Source: {h.source}
              {h.id === selectedHospitalId && (
                <>
                  <br />
                  <em>Selected hospital</em>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
