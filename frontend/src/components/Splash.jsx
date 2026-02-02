import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";
import splashVideo from "../assets/video1.mp4";

export default function Splash() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 6000);

    const navTimer = setTimeout(() => {
      navigate("/home");
    }, 7000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  };

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-content">
        <video className="splash-video" autoPlay muted playsInline loop>
          <source src={splashVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <button className="skip-button" onClick={handleSkip}>
          Skip Video →
        </button>
      </div>
    </div>
  );
}
