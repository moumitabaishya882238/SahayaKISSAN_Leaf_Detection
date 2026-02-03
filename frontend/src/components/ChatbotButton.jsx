import React from "react";
import "./ChatbotButton.css";

export default function ChatbotButton() {
  const openChatbot = () => {
    window.open("http://localhost:5175", "chatbot", "width=500,height=700");
  };

  return (
    <button
      className="chatbot-button"
      onClick={openChatbot}
      title="Open Chatbot"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
