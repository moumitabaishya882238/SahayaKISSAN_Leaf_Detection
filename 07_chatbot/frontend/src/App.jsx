import { useState } from "react";
import { ChatProvider } from "./context/ChatContext";
import Chat from "./pages/Chat";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <Navbar />
      <div className="app-shell">
        {isSidebarOpen && <div className="sidebar-overlay" />}
        <Sidebar 
          className={`sidebar ${isSidebarOpen ? 'open' : ''}`} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <Chat 
          className="chat-container" 
          onToggleSidebar={() => setIsSidebarOpen(true)} 
        />
      </div>
    </ChatProvider>
  );
}

export default App;
