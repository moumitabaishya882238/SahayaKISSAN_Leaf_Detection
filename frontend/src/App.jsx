import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import LeafDisease from "./components/LeafDisease";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Splash from "./components/Splash";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/leaf-scan" element={<LeafDisease />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
