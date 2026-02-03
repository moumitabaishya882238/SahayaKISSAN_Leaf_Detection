import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatbotButton from "./ChatbotButton";

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <Outlet />
      <ChatbotButton />
    </div>
  );
}
