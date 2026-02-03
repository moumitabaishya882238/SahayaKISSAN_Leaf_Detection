import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">
        <a href="http://localhost:5173" className="navbar__logo">
          <img src="/Logo.svg" alt="SahayaKISSAN" />
        </a>

        <div className="navbar__menu">
          <a href="http://localhost:5173" className="navbar__link">
            Home
          </a>
          <a href="http://localhost:5173/schemes" className="navbar__link">
            Schemes
          </a>
          <span className="navbar__link navbar__link--active">SahayaBot</span>
          <a
            href="https://sahaya-kissan-research.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link"
          >
            Research
          </a>
        </div>
      </div>
    </nav>
  );
}
