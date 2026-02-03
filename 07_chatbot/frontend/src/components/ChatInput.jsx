import { useState } from "react";
import "./ChatInput.css";

function ChatInput({ onSend, disabled, onVoiceClick, isRecording }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) {
      return;
    }
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <button
        type="button"
        className={`mic-button ${isRecording ? "recording" : ""}`}
        onClick={onVoiceClick}
        disabled={disabled}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isRecording ? "■" : "🎤"}
      </button>
      <input
        className="chat-input-field"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about crops, tea, schemes"
        disabled={disabled}
      />
      <button className="send-button" onClick={handleSend} disabled={disabled}>
        {disabled ? "Sending..." : "Send"}
      </button>
    </div>
  );
}

export default ChatInput;
