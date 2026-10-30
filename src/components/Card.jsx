export default function Card({ title, icon: Icon, children, className = '', actions = null }) {
  return (
    <div className={`card ${className}`}>
      {(title || Icon || actions) && (
        <div className="card-header">
          <div className="card-header-title">
            {Icon && <Icon size={18} />}
            {title && <h3>{title}</h3>}
          </div>
          {actions && <div className="card-header-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
