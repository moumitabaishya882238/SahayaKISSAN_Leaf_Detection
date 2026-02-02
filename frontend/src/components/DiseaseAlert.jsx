import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DiseaseAlert({ risk }) {
  const [isVisible, setIsVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (risk) {
      setIsVisible(true);
      setPulse(true);
      
      // Pulse animation for first 3 seconds
      const pulseTimer = setTimeout(() => setPulse(false), 3000);
      
      // Auto-hide after 12 seconds
      const hideTimer = setTimeout(() => setIsVisible(false), 12000);
      
      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [risk]);

  if (!risk || !isVisible) return null;

  const getSeverityClass = (level) => {
    const levels = {
      low: 'safe',
      medium: 'warning',
      high: 'danger',
      critical: 'critical'
    };
    return levels[level?.toLowerCase()] || 'warning';
  };

  return (
    <div className={`disease-alert disease-alert--${getSeverityClass(risk.level)} ${pulse ? 'pulse' : ''}`}>
      <div className="alert-header">
        <div className="alert-icon">🚨</div>
        <div className="alert-main">
          <h4 className="alert-title">Disease Risk Alert</h4>
          <div className="severity-badge">{risk.level?.toUpperCase()}</div>
        </div>
        <button 
          className="alert-dismiss"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      </div>

      <div className="alert-body">
        <div className="disease-info">
          <span className="info-label">Disease</span>
          <span className="info-value">{risk.disease}</span>
        </div>
        
        <p className="alert-message">{risk.message}</p>
      </div>

      <div className="alert-actions">
        <Link to="/scan" className="scan-action">
          <span>Scan Leaf Immediately</span>
          <svg className="action-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <div className="alert-footer">
        <span className="urgency-text">Urgent action recommended</span>
      </div>
    </div>
  );
}
