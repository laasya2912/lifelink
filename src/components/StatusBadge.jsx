/**
 * StatusBadge
 * -----------------------------------------------------------------------
 * Generic status pill. `tone` controls color:
 *   'real'       -> green  (used for real public API data)
 *   'simulated'  -> amber  (used for simulated/prototype data)
 *   'critical'   -> red
 *   'active'     -> blue
 *   'neutral'    -> gray
 * -----------------------------------------------------------------------
 */
export default function StatusBadge({ label, tone = 'neutral', dot = true }) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {dot && <span className="status-badge-dot" />}
      {label}
    </span>
  );
}
