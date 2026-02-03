import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import "./Sidebar.css";

function Sidebar() {
  const {
    newSession,
    sessions,
    setSessionId,
    removeSession,
    updateSessionTitle,
  } = useContext(ChatContext);
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="brand">Sahayakisan</h2>
        <button className="new-chat" onClick={newSession}>
          + New Chat
        </button>
      </div>
      <div className="session-list">
        {sessions.length === 0 ? (
          <div className="empty">No sessions yet</div>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="session-row">
              {editingId === s.id ? (
                <input
                  className="title-input"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <button
                  className="session-item"
                  onClick={() => setSessionId(s.id)}
                  title={s.title}
                >
                  {s.title}
                </button>
              )}
              {editingId === s.id ? (
                <button
                  className="icon-btn"
                  onClick={async () => {
                    await updateSessionTitle(
                      s.id,
                      draftTitle.trim() || s.title,
                    );
                    setEditingId(null);
                  }}
                >
                  Save
                </button>
              ) : (
                <button
                  className="icon-btn"
                  onClick={() => {
                    setEditingId(s.id);
                    setDraftTitle(s.title);
                  }}
                >
                  Rename
                </button>
              )}
              <button
                className="icon-btn"
                onClick={async () => {
                  if (
                    window.confirm(
                      `Delete "${s.title}"? This will remove all messages.`,
                    )
                  ) {
                    await removeSession(s.id);
                    if (editingId === s.id) setEditingId(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
