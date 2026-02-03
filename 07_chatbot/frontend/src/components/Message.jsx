import { useNavigate } from "react-router-dom";
import "./Message.css";
import chatbotLogo from "../assets/chatbot1.png";

function Message({ role, content, navigationUrl, navigationLabel }) {
  const isUser = role === "user";
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (!navigationUrl) return;
    if (/^https?:\/\//i.test(navigationUrl)) {
      // External/absolute URL: open in a new tab
      window.open(navigationUrl, "_blank", "noopener");
    } else {
      // Internal route: use client-side navigation
      navigate(navigationUrl);
    }
  };

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="avatar assistant-avatar">
          <img src={chatbotLogo} alt="AI" className="avatar-img" />
        </div>
      )}
      <div className="message-content">
        <span className="message-bubble">{content}</span>
        {navigationUrl && (
          <button className="nav-button" onClick={handleNavigate}>
            {navigationLabel}
          </button>
        )}
      </div>
      {isUser && (
        <div className="avatar user-avatar">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default Message;
