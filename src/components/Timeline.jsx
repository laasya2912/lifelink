import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

const ICONS = {
  Completed: CheckCircle2,
  Active: Clock,
  Pending: Circle,
  Cancelled: XCircle,
};

export default function Timeline({ steps }) {
  return (
    <ol className="timeline">
      {steps.map((step, idx) => {
        const Icon = ICONS[step.status] || Circle;
        return (
          <li key={idx} className={`timeline-step timeline-step--${step.status.toLowerCase()}`}>
            <div className="timeline-marker">
              <Icon size={18} />
              {idx < steps.length - 1 && <span className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-title-row">
                <h4>{step.title}</h4>
                <span className={`timeline-status timeline-status--${step.status.toLowerCase()}`}>
                  {step.status}
                </span>
              </div>
              {step.description && <p>{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
