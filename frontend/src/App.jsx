import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

import Layout from "./components/Layout";
import LeafDisease from "./components/LeafDisease";
import Home from "./pages/Home";
import History from "./pages/History";
import PageNotFound from "./pages/PageNotFound";
import Splash from "./components/Splash";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/leaf-scan" element={<LeafDisease />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
