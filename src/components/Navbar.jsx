import { NavLink } from 'react-router-dom';
import { Siren, LayoutDashboard, MapPinned, Activity, Smartphone } from 'lucide-react';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `navbar-link${isActive ? ' navbar-link--active' : ''}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Siren size={22} strokeWidth={2.4} />
          <span>
            LIFE<strong>LINK</strong>
          </span>
        </div>
        <nav className="navbar-links">
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/user" className={linkClass}>
            <Smartphone size={16} />
            <span>User</span>
          </NavLink>
          <NavLink to="/incident" className={linkClass}>
            <MapPinned size={16} />
            <span>Incident</span>
          </NavLink>
          <NavLink to="/tracking" className={linkClass}>
            <Activity size={16} />
            <span>Tracking</span>
          </NavLink>
        </nav>
        <div className="navbar-status">
          <span className="status-dot status-dot--operational" />
          <span>Operational</span>
        </div>
      </div>
    </header>
  );
}
