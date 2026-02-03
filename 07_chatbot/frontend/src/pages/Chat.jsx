import { useNavigate } from "react-router-dom";
import { sendMessage, transcribeAudio } from "../services/api";
import { useContext, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";
import "./Chat.css";

function Chat() {
  const { sessionId, messages, setMessages, reloadSessions } = useContext(ChatContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();

  const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const speak = (text, lang) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { hi: "hi-IN", as: "as-IN", en: "en-US" };
    utterance.lang = langMap[lang] || "en-US";
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()),
    );
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text, languageHint = "en") => {
    const isFirstMessage = messages.length === 0;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    const res = await sendMessage(sessionId, text, languageHint);
    setIsLoading(false);

    if (res.type === "NAVIGATION") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: ` I can help you with ${res.label}. Click below to continue.`,
          navigationUrl: res.url,
          navigationLabel: res.label,
        },
      ]);
    } else {
      const reply = res.type === "ERROR" ? `⚠️ ${res.reply}` : res.reply;
      const replyLanguage = res.language || languageHint || "en";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply, replyLanguage);
      if (isFirstMessage) reloadSessions();
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startRecording = async () => {
    if (isLoading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        setVoiceStatus("processing");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const { text, language } = await transcribeAudio(audioBlob);
          if (text) await handleSend(text, language || "en");
        } catch (err) {
          console.error("Transcription failed", err);
        }
        setVoiceStatus("idle");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setVoiceStatus("listening");
      recorder.start();
    } catch (err) {
      console.error("Recording failed", err);
      setIsRecording(false);
      setVoiceStatus("idle");
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-page-header">
        <span className="header-icon"></span>
        <h1 className="header-title">SahayaKISSAN Assistant</h1>
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-row ${m.role}`}>
            <Message
              role={m.role}
              content={m.content}
              navigationUrl={m.navigationUrl}
              navigationLabel={m.navigationLabel}
            />
          </div>
        ))}
        {isSpeaking && (
          <div className="stop-speech-container">
            <button className="stop-speech-btn" onClick={stopSpeech}>
               Stop Speaking
            </button>
          </div>
        )}
        {(voiceStatus === "listening" || voiceStatus === "processing") && (
          <div className="message-row assistant">
            <span className="message-bubble thinking">
              {voiceStatus === "listening" ? "🎤 Listening..." : " Processing voice..."}
            </span>
          </div>
        )}
        {isLoading && (
          <div className="message-row assistant">
            <span className="message-bubble thinking">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <ChatInput
          onSend={handleSend}
          onVoiceClick={handleVoiceClick}
          isRecording={isRecording}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default Chat;
