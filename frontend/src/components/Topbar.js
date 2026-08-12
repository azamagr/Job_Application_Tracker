import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Action buttons to show per route
const ROUTE_ACTIONS = {
  '/applications': {
    label: '+ Add Application',
    action: 'open-add-app',   // handled via custom event
  },
  '/admin/jobs': {
    label: '+ Post New Job',
    action: 'open-add-job',
  },
};

const Topbar = ({ pageTitles = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || '';
  const routeAction = ROUTE_ACTIONS[location.pathname];

  const handleAction = () => {
    if (!routeAction) return;
    // Dispatch custom event — the page component listens for it
    window.dispatchEvent(new CustomEvent(routeAction.action));
  };

  return (
    <div className="topbar">
      {/* Back button — show on deeper pages if needed */}
      <span className="topbar-title">{title}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {routeAction && (
          <button className="btn btn-primary" onClick={handleAction}>
            {routeAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;