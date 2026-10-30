import { useState } from 'react';
import { HeartPulse, ShieldCheck, Siren, MapPin, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { useIncident } from '../state/IncidentContext.jsx';
import { VICTIM_RESPONSE } from '../logic/escalation.js';

export default function User() {
  const { simulateAccident, isProcessing } = useIncident();
  const navigate = useNavigate();
  const [safe, setSafe] = useState(false);

  const handleSafe = () => {
    setSafe(true);
    setTimeout(() => setSafe(false), 3500);
  };

  const handleHelp = async () => {
    await simulateAccident(VICTIM_RESPONSE.NEED_HELP, false);
    navigate('/incident');
  };

  return (
    <div className="user-page">
      <section className="user-hero">
        <div className="user-icon"><HeartPulse size={34} /></div>
        <p className="user-kicker">LIFELINK EMERGENCY ASSIST</p>
        <h1>Are you safe?</h1>
        <p>Choose an option. If you need help, LIFELINK will use your device location and create an emergency incident.</p>
      </section>

      <div className="user-actions">
        <button className="user-action user-action--safe" onClick={handleSafe} disabled={isProcessing}>
          <span className="user-action-icon"><ShieldCheck size={40} /></span>
          <span className="user-action-copy">
            <strong>I'M SAFE</strong>
            <small>I'm okay. No emergency assistance needed.</small>
          </span>
        </button>

        <button className="user-action user-action--help" onClick={handleHelp} disabled={isProcessing}>
          <span className="user-action-icon"><Siren size={40} /></span>
          <span className="user-action-copy">
            <strong>I NEED HELP</strong>
            <small>Send an emergency signal with my current location.</small>
          </span>
        </button>
      </div>

      {safe && (
        <div className="user-confirmation">
          <CheckCircle2 size={20} />
          <span>You're marked safe. Stay calm and stay where you are if needed.</span>
        </div>
      )}

      <div className="user-note">
        <MapPin size={16} />
        <span>Location is requested only when emergency help is initiated.</span>
      </div>
    </div>
  );
}
