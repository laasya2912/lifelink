import Card from '../components/Card.jsx';
import Timeline from '../components/Timeline.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import { useIncident } from '../state/IncidentContext.jsx';
import { VICTIM_RESPONSE } from '../logic/escalation.js';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Tracking() {
  const { incident, victimStatus, escalation, hospitals } = useIncident();
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

  const victim1Safe = victimStatus[0] === VICTIM_RESPONSE.SAFE;
  const bestHospital = hospitals.find((h) => h.id === incident.bestHospitalId) || hospitals[0];

  const steps = [
    {
      title: 'Accident Signal Received',
      status: 'Completed',
      description: `${incident.signalSource} reported a possible incident.`,
    },
    {
      title: 'Signals Validated',
      status: 'Completed',
      description: `${incident.crashResult.signalCount} of 5 rule-based signals confirmed (${incident.crashResult.confidence}% confidence).`,
    },
    {
      title: 'Location Acquired',
      status: 'Completed',
      description: `${incident.location.source} — ${incident.address?.displayName || 'address unavailable'}.`,
    },
    {
      title: 'Severity Assessed',
      status: 'Completed',
      description: `${incident.severity.severity} (score ${incident.severity.score}/100). Prototype classification, not a medical diagnosis.`,
    },
    {
      title: 'Hospital Identified',
      status: bestHospital ? 'Completed' : 'Pending',
      description: bestHospital
        ? `${bestHospital.name} — ${bestHospital.distanceKm} km away (${bestHospital.source}).`
        : 'Awaiting hospital match.',
    },
    {
      title: 'Victim Confirmation',
      status: victim1Safe && victimStatus[1] !== VICTIM_RESPONSE.AWAITING ? 'Completed' : 'Active',
      description: `Victim 1: ${victimStatus[0]} · Victim 2: ${victimStatus[1]}`,
    },
    {
      title: 'Emergency Contact',
      status: escalation.active ? 'Active' : 'Pending',
      description: escalation.active ? escalation.emergencyContact : 'Not required unless escalation activates.',
    },
    {
      title: 'Verified Responder',
      status: escalation.active ? 'Active' : 'Pending',
      description: escalation.active ? escalation.verifiedResponder : 'No responder assignment needed.',
    },
    {
      title: 'Emergency Dispatch',
      status: escalation.active ? 'Active' : 'Pending',
      description: escalation.active ? escalation.emergencyDispatch : 'Dispatch simulation not triggered.',
    },
    {
      title: 'Response Tracking',
      status: escalation.active ? 'Active' : victim1Safe ? 'Cancelled' : 'Pending',
      description: escalation.active
        ? 'Simulated ETA: 8–12 minutes (Simulated ETA).'
        : victim1Safe
        ? 'Tracking stopped – victim marked safe.'
        : 'Awaiting victim status.',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Emergency Response Timeline</h1>
        <StatusBadge
          label={escalation.active ? 'Escalation: ACTIVE' : 'Escalation: Inactive'}
          tone={escalation.active ? 'critical' : 'real'}
        />
      </div>

      {victim1Safe && !escalation.active && (
        <Card className="mt-section">
          <p className="tracking-stopped-note">
            <Activity size={16} /> Tracking stopped – victim marked safe.
          </p>
        </Card>
      )}

      <Card className="mt-section">
        <Timeline steps={steps} />
      </Card>

      {escalation.active && (
        <Card title="Escalation Details" className="mt-section">
          <dl className="detail-list">
            <div>
              <dt>Triggered By</dt>
              <dd>{escalation.triggeredBy.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Emergency Contact</dt>
              <dd>
                <StatusBadge label={escalation.emergencyContact} tone="simulated" />
              </dd>
            </div>
            <div>
              <dt>Verified Responder</dt>
              <dd>
                <StatusBadge label={escalation.verifiedResponder} tone="simulated" />
              </dd>
            </div>
            <div>
              <dt>Emergency Dispatch</dt>
              <dd>
                <StatusBadge label={escalation.emergencyDispatch} tone="simulated" />
              </dd>
            </div>
            <div>
              <dt>ETA</dt>
              <dd>Simulated ETA</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
