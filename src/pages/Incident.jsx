import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { useIncident } from '../state/IncidentContext.jsx';
import { FileWarning, MapPin, Hospital, Users, Siren, CloudSun } from 'lucide-react';

export default function Incident() {
  const { incident, hospitals, errors } = useIncident();
  const navigate = useNavigate();

  if (!incident) {
    return (
      <div className="page">
        <Card>
          <p className="empty-state">
            No incident data yet. Go to the Dashboard and click "Simulate Accident Signal".
          </p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const bestHospital = hospitals.find((h) => h.id === incident.bestHospitalId) || hospitals[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Incident Report</h1>
        <StatusBadge
          label={incident.severity.severity}
          tone={
            incident.severity.severity === 'Critical'
              ? 'critical'
              : incident.severity.severity === 'Moderate'
              ? 'simulated'
              : 'real'
          }
        />
      </div>

      <div className="incident-detail-grid">
        <Card title="Signal Detail" icon={Siren}>
          <dl className="detail-list">
            <div>
              <dt>Incident ID</dt>
              <dd>{incident.id}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{new Date(incident.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{new Date(incident.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</dd>
            </div>
            <div>
              <dt>Signal Source</dt>
              <dd>{incident.signalSource}</dd>
            </div>
            <div>
              <dt>Signal Status</dt>
              <dd>
                <StatusBadge label={incident.sourceStatus} tone="simulated" />
              </dd>
            </div>
            <div>
              <dt>Victim Response</dt>
              <dd>{incident.signalResponse === 'Need Help' ? 'I Need Help' : incident.signalResponse === 'Safe' ? "I'm Safe" : incident.signalResponse}</dd>
            </div>
            <div>
              <dt>Signal Count</dt>
              <dd>{incident.crashResult.signalCount} / 5 confirmed</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{incident.crashResult.confidence}%</dd>
            </div>
          </dl>
        </Card>

        <Card title="Severity Assessment" icon={FileWarning}>
          <dl className="detail-list">
            <div>
              <dt>Severity</dt>
              <dd>{incident.severity.severity}</dd>
            </div>
            <div>
              <dt>Severity Score</dt>
              <dd>{incident.severity.score} / 100</dd>
            </div>
            <div>
              <dt>Severity Confidence</dt>
              <dd>{incident.severity.confidence}%</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{incident.severity.reason}</dd>
            </div>
          </dl>
          <p className="fine-print">
            Severity is a rule-based prototype classification only. It is NOT a medical
            diagnosis.
          </p>
        </Card>

        <Card title="Location" icon={MapPin}>
          <dl className="detail-list">
            <div>
              <dt>Latitude</dt>
              <dd>{incident.location.latitude.toFixed(5)}</dd>
            </div>
            <div>
              <dt>Longitude</dt>
              <dd>{incident.location.longitude.toFixed(5)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{incident.address?.displayName || 'Unavailable'}</dd>
            </div>
            <div>
              <dt>Location Source</dt>
              <dd>
                <StatusBadge
                  label={incident.location.source}
                  tone={incident.location.source === 'Browser Geolocation' ? 'real' : 'simulated'}
                />
              </dd>
            </div>
          </dl>
          {errors.location && <p className="api-error-note">{errors.location}</p>}
          {errors.address && <p className="api-error-note">{errors.address}</p>}
        </Card>

        <Card title="Hospital" icon={Hospital}>
          {bestHospital ? (
            <dl className="detail-list">
              <div>
                <dt>Hospital Name</dt>
                <dd>{bestHospital.name}</dd>
              </div>
              <div>
                <dt>Distance</dt>
                <dd>{bestHospital.distanceKm} km</dd>
              </div>
              <div>
                <dt>Hospital Source</dt>
                <dd>
                  <StatusBadge
                    label={bestHospital.source}
                    tone={bestHospital.source === 'OpenStreetMap' ? 'real' : 'simulated'}
                  />
                </dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  <StatusBadge label={bestHospital.availability} tone="simulated" />
                </dd>
              </div>
            </dl>
          ) : (
            <p className="empty-state">No hospital data available.</p>
          )}
        </Card>

        {incident.weather && (
          <Card title="Environmental Context" icon={CloudSun}>
            <dl className="detail-list">
              <div>
                <dt>Condition</dt>
                <dd>{incident.weather.condition}</dd>
              </div>
              <div>
                <dt>Temperature</dt>
                <dd>{incident.weather.temperatureC != null ? `${incident.weather.temperatureC}°C` : '—'}</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{incident.weather.windKph != null ? `${incident.weather.windKph} km/h` : '—'}</dd>
              </div>
              <div>
                <dt>Precipitation</dt>
                <dd>{incident.weather.precipitationMm != null ? `${incident.weather.precipitationMm} mm` : '—'}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  <StatusBadge
                    label={incident.weather.source}
                    tone={incident.weather.isFallback ? 'simulated' : 'real'}
                  />
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>

      <Card title="Accident Locations" icon={Users} className="mt-section">
        <div className="victims-summary">
          {incident.victims.map((v, idx) => (
            <div className="victim-summary-row" key={idx}>
              <span>Victim {idx + 1}</span>
              <span className="victim-coords">
                {v.latitude.toFixed(5)}, {v.longitude.toFixed(5)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Interactive Map" icon={MapPin} className="mt-section">
        <IncidentMap
          accident={incident.location}
          victims={incident.victims}
          hospitals={hospitals}
          selectedHospitalId={incident.bestHospitalId}
        />
        <p className="map-caption">
          Map tiles &amp; hospital locations: OpenStreetMap. Victim and accident marker
          positions are derived from the incident's real or simulated GPS coordinates.
        </p>
      </Card>
    </div>
  );
}
