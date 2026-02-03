import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/home" className="navbar-link">
          🏠 Dashboard
        </Link>
        <Link to="/leaf-scan" className="navbar-link">
          🔬 Leaf Scan
        </Link>
        <Link to="/history" className="navbar-link">
          📋 History
        </Link>
      </div>
      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <div className="navbar-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">SahayaKISSAN</span>
        </div>
      </div>
    </nav>
  );
}
