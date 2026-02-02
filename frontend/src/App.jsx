import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import LeafDisease from "./components/LeafDisease";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/leaf-scan" element={<LeafDisease />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
