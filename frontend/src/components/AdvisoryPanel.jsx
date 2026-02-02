import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./AdvisoryPanel.css";

export default function AdvisoryPanel({ risk }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (risk) {
      setIsVisible(true);
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => setIsVisible(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [risk]);

  if (!risk || !isVisible) return null;

  return (
    <div className="advisory-panel">
      <div className="advisory-panel__header">
        <div className="advisory-icon">🌿</div>
        <h4 className="advisory-title">Advisory Recommendation</h4>
        <button 
          className="advisory-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close advisory"
        >
          ×
        </button>
      </div>

      <div className="advisory-content">
        <div className="disease-info">
          <span className="label">Disease:</span>
          <span className="value">{risk.disease}</span>
        </div>
        
        <div className="severity-badge severity-{risk.severity.toLowerCase()}">
          {risk.severity}
        </div>

        <p className="reason-text">{risk.reason}</p>

        <ul className="action-list">
          <li className="action-item">
            <span className="action-check">✔</span>
            Avoid overhead irrigation
          </li>
          <li className="action-item">
            <span className="action-check">✔</span>
            Improve field drainage
          </li>
          <li className="action-item">
            <span className="action-check">✔</span>
            Apply preventive fungicide
          </li>
          <li className="action-item">
            <span className="action-check">✔</span>
            Monitor leaves closely
          </li>
        </ul>
      </div>

      <Link to="/scan" className="scan-button">
        <span>Scan Leaf Now</span>
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}
