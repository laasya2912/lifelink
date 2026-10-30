import { useNavigate } from 'react-router-dom';
import { Siren, RotateCcw, ArrowRight, Radio, Clock3, Smartphone } from 'lucide-react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ApiStatusPanel from '../components/ApiStatusPanel.jsx';
import { useIncident } from '../state/IncidentContext.jsx';
import { VICTIM_RESPONSE } from '../logic/escalation.js';

export default function Dashboard() {
  const {
    incident,
    victimStatus,
    apiStatus,
    modalOpen,
    setModalOpen,
    isProcessing,
    victim2Timer,
    conditionChecked,
    simulateAccident,
    checkCondition,
    setVictimResponse,
    resetDemo,
  } = useIncident();

  const navigate = useNavigate();

  return (
    <div className="page">
      <section className="hero-panel">
        <div className="hero-text">
          <h1>LIFELINK</h1>
          <p className="hero-subtitle">Intelligent Accident Emergency Response System</p>
          <div className="hero-meta">
            <StatusBadge label="System Status: Operational" tone="active" />
          </div>
          <p className="hero-description">
            LIFELINK is a hackathon prototype that fuses simulated crash-sensor signals with
            real public geographic APIs — live GPS, OpenStreetMap hospital data, reverse
            geocoding, and interactive mapping — to demonstrate an end-to-end accident
            emergency-response workflow.
          </p>
          <div className="hero-actions">
            <Button icon={Smartphone} variant="secondary" onClick={() => navigate('/user')}>
              Open User Interface
            </Button>
            <Button icon={Siren} size="lg" onClick={() => simulateAccident()} disabled={isProcessing}>
              {isProcessing ? 'Processing Signal…' : 'Simulate Accident Signal'}
            </Button>
            {incident && (
              <Button icon={RotateCcw} variant="ghost" onClick={resetDemo}>
                Reset Demo
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <ApiStatusPanel status={apiStatus} />

        <Card title="Latest Incident" icon={Radio}>
          {incident ? (
            <div className="latest-incident">
              <div className="latest-incident-row">
                <span>Incident ID</span>
                <strong>{incident.id}</strong>
              </div>
              <div className="latest-incident-row">
                <span>Severity</span>
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
              <div className="latest-incident-row">
                <span>Location Source</span>
                <StatusBadge
                  label={incident.location.source}
                  tone={incident.location.source === 'Browser Geolocation' ? 'real' : 'simulated'}
                />
              </div>
              <Button
                icon={ArrowRight}
                variant="secondary"
                fullWidth
                onClick={() => navigate('/incident')}
              >
                View Full Incident
              </Button>
            </div>
          ) : (
            <p className="empty-state">
              No active incident. Click "Simulate Accident Signal" to start a demo run.
            </p>
          )}
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title="Incoming Incident Signal"
        onClose={() => setModalOpen(false)}
        wide
      >
        <div className="incident-modal">
          <div className="incident-modal-row">
            <span>Signal Source</span>
            <strong>Simulated Vehicle + Phone Sensors</strong>
          </div>
          <div className="incident-modal-row">
            <span>Signal Status</span>
            <StatusBadge label="Simulated" tone="simulated" />
          </div>

          <hr />

          {!conditionChecked ? (
            <div className="condition-check-panel">
              <div className="condition-icon"><Siren size={28} /></div>
              <h4>Accident Detected</h4>
              <p>Vehicle and phone sensors indicate a possible accident. Check the victims' condition before starting emergency escalation.</p>
              <Button
                icon={ArrowRight}
                fullWidth
                onClick={checkCondition}
                disabled={isProcessing}
              >
                {isProcessing ? 'Preparing Condition Check…' : 'Check Condition'}
              </Button>
            </div>
          ) : (
            <>
              <div className="condition-checked-banner">
                <span className="condition-dot" />
                <div>
                  <strong>Condition check active</strong>
                  <small>Waiting for victim responses. No response after the timer triggers simulated escalation.</small>
                </div>
              </div>

              <div className="victim-block">
                <div className="victim-block-header">
                  <h4>Victim 1</h4>
                  <StatusBadge
                    label={victimStatus[0]}
                    tone={
                      victimStatus[0] === VICTIM_RESPONSE.SAFE
                        ? 'real'
                        : victimStatus[0] === VICTIM_RESPONSE.AWAITING
                        ? 'active'
                        : 'critical'
                    }
                  />
                </div>
                <div className="victim-actions">
                  <Button size="sm" variant="secondary" onClick={() => setVictimResponse(0, VICTIM_RESPONSE.SAFE)}>
                    I'm Safe
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setVictimResponse(0, VICTIM_RESPONSE.NEED_HELP)}>
                    I Need Help
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setVictimResponse(0, VICTIM_RESPONSE.NO_RESPONSE)}>
                    No Response
                  </Button>
                </div>
              </div>

              <div className="victim-block">
                <div className="victim-block-header">
                  <h4>Victim 2</h4>
                  <div className="victim-timer">
                    {victimStatus[1] === VICTIM_RESPONSE.AWAITING && (
                      <span className="timer-chip">
                        <Clock3 size={14} /> {victim2Timer}s
                      </span>
                    )}
                    <StatusBadge
                      label={victimStatus[1]}
                      tone={
                        victimStatus[1] === VICTIM_RESPONSE.SAFE
                          ? 'real'
                          : victimStatus[1] === VICTIM_RESPONSE.AWAITING
                          ? 'active'
                          : 'critical'
                      }
                    />
                  </div>
                </div>
                <div className="victim-actions">
                  <Button size="sm" variant="secondary" onClick={() => setVictimResponse(1, VICTIM_RESPONSE.SAFE)}>
                    I'm Safe
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setVictimResponse(1, VICTIM_RESPONSE.NEED_HELP)}>
                    I Need Help
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setVictimResponse(1, VICTIM_RESPONSE.NO_RESPONSE)}>
                    No Response
                  </Button>
                </div>
              </div>

              <hr />

              <Button
                icon={ArrowRight}
                fullWidth
                onClick={() => {
                  setModalOpen(false);
                  navigate('/incident');
                }}
              >
                View Incident Details
              </Button>
            </>
          )}
        </div>
      </Modal>

      <p className="safety-notice">
        LIFELINK is a hackathon prototype. Accident signals, victim responses, responder
        availability, hospital availability, emergency notifications and dispatch are
        simulated. Public APIs provide geographic and environmental information only. This
        system does not provide medical diagnosis, contact emergency services, or guarantee
        emergency response.
      </p>
    </div>
  );
}
