import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";
import splashVideo from "../assets/video1.mp4";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <video
          className="splash-video"
          autoPlay
          muted
          playsInline
          loop
        >
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
