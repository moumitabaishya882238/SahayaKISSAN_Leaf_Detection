import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-link">
        Dashboard
      </Link>
      <Link to="/leaf-scan" className="navbar-link">
        Leaf Scan
      </Link>
    </nav>
  );
}
