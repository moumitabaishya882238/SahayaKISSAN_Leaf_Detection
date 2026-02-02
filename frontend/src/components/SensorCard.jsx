import "./SensorCard.css";

export default function SensorCard({ title, value, status, unit = "" }) {
  const statusConfig = {
    safe: {
      bg: "0 0% 95%",
      border: "#c3e6cb",
      text: "#155724",
      icon: "🌱"
    },
    warning: {
      bg: "50 100% 92%",
      border: "#ffeaa7",
      text: "#856404",
      icon: "⚠️"
    },
    danger: {
      bg: "355 86% 93%",
      border: "#f5c6cb",
      text: "#721c24",
      icon: "🚨"
    }
  };

  const config = statusConfig[status] || statusConfig.safe;

  return (
    <div className={`sensor-card sensor-card--${status}`}>
      <div className="sensor-card__header">
        <div className="sensor-icon">{config.icon}</div>
        <h4 className="sensor-title">{title}</h4>
      </div>
      
      <div className="sensor-value">
        <span className="value-number">{value}</span>
        <span className="value-unit">{unit}</span>
      </div>
      
      <div className="sensor-status">
        <span className="status-indicator"></span>
        <span className="status-text">Status: {status}</span>
      </div>
    </div>
  );
}
