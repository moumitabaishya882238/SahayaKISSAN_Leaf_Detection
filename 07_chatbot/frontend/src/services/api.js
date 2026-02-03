import axios from "axios";

const api = axios.create({
  // With Vite proxy, baseURL can be empty and we use relative paths
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

export const sendMessage = async (sessionId, message, language = "en") => {
  try {
    const res = await api.post("/chat", {
      session_id: sessionId,
      message: message,
      language,
    });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    return { type: "ERROR", reply: msg };
  }
};

export const transcribeAudio = async (blob) => {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");

  try {
    const res = await api.post("/speech/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to transcribe audio", err);
    return { text: "", language: "en" };
  }
};

export const fetchSessions = async (userId = "local-user") => {
  try {
    const res = await api.get(`/chat/sessions`, {
      params: { user_id: userId },
    });
    return res.data.sessions || [];
  } catch (err) {
    console.error("Failed to fetch sessions", err);
    return [];
  }
};

export const createSession = async (
  userId = "local-user",
  title = "New Chat",
) => {
  try {
    const res = await api.post(`/chat/session`, { user_id: userId, title });
    return res.data.session_id;
  } catch (err) {
    console.error("Failed to create session", err);
    return null;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    await api.delete(`/chat/session/${sessionId}`);
    return true;
  } catch (err) {
    console.error("Failed to delete session", err);
    return false;
  }
};

export const renameSession = async (sessionId, title) => {
  try {
    await api.patch(`/chat/session/${sessionId}`, { title });
    return true;
  } catch (err) {
    console.error("Failed to rename session", err);
    return false;
  }
};

export const fetchMessages = async (sessionId) => {
  try {
    const res = await api.get(`/chat/messages/${sessionId}`);
    return res.data.messages || [];
  } catch (err) {
    console.error("Failed to fetch messages", err);
    return [];
  }
};
