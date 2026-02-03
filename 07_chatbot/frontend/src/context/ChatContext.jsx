import { createContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  fetchSessions,
  createSession as apiCreateSession,
  deleteSession as apiDeleteSession,
  renameSession as apiRenameSession,
  fetchMessages,
} from "../services/api";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    const list = await fetchSessions("local-user");
    setSessions(list);
  };

  useEffect(() => {
    // Load existing sessions or create a new one if none exist
    const initSession = async () => {
      const list = await fetchSessions("local-user");
      setSessions(list);
      
      if (list.length > 0) {
        // Use the most recent session
        setSessionId(list[0].id);
      } else {
        // Create initial session only if none exist
        const id = await apiCreateSession("local-user", "New Chat");
        setSessionId(id || uuidv4());
        const updatedList = await fetchSessions("local-user");
        setSessions(updatedList);
      }
    };
    initSession();
  }, []);

  // Load messages when sessionId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (sessionId) {
        const msgs = await fetchMessages(sessionId);
        setMessages(msgs);
      }
    };
    loadMessages();
  }, [sessionId]);

  const newSession = async () => {
    const id = await apiCreateSession("local-user", "New Chat");
    setSessionId(id || uuidv4());
    setMessages([]);
    loadSessions();
  };

  const removeSession = async (id) => {
    const ok = await apiDeleteSession(id);
    if (ok) {
      // If deleting current session, reset to a new one
      if (id === sessionId) {
        setSessionId(uuidv4());
        setMessages([]);
      }
      loadSessions();
    }
  };

  const updateSessionTitle = async (id, title) => {
    const ok = await apiRenameSession(id, title);
    if (ok) {
      loadSessions();
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessionId,
        messages,
        setMessages,
        newSession,
        sessions,
        setSessionId,
        removeSession,
        updateSessionTitle,
        reloadSessions: loadSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
