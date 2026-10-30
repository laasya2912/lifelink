import Card from './Card.jsx';
import StatusBadge from './StatusBadge.jsx';
import { Satellite, HeartPulse, MapPin, Map as MapIcon, CloudSun } from 'lucide-react';

/**
 * ApiStatusPanel
 * -----------------------------------------------------------------------
 * Gives judges/users a clear, at-a-glance view of which public APIs are
 * actually connected vs. running in fallback mode.
 * -----------------------------------------------------------------------
 */
export default function ApiStatusPanel({ status }) {
  const rows = [
    {
      key: 'location',
      label: 'Location API',
      icon: Satellite,
      connected: status.location === 'connected',
    },
    {
      key: 'hospital',
      label: 'Hospital API',
      icon: HeartPulse,
      connected: status.hospital === 'connected',
    },
    {
      key: 'address',
      label: 'Address API',
      icon: MapPin,
      connected: status.address === 'connected',
    },
    {
      key: 'map',
      label: 'Map',
      icon: MapIcon,
      connected: status.map === 'connected',
    },
    {
      key: 'weather',
      label: 'Weather API',
      icon: CloudSun,
      connected: status.weather === 'connected',
    },
  ];

  return (
    <Card title="API Status" className="api-status-card">
      <div className="api-status-grid">
        {rows.map((row) => (
          <div className="api-status-row" key={row.key}>
            <div className="api-status-label">
              <row.icon size={16} />
              <span>{row.label}</span>
            </div>
            <StatusBadge
              label={row.connected ? 'Connected' : 'Fallback'}
              tone={row.connected ? 'real' : 'simulated'}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
