import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Incident from './pages/Incident.jsx';
import Tracking from './pages/Tracking.jsx';
import User from './pages/User.jsx';
import { IncidentProvider } from './state/IncidentContext.jsx';

export default function App() {
  return (
    <IncidentProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/incident" element={<Incident />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </main>
      </div>
    </IncidentProvider>
  );
}
