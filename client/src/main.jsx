import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Editor from "./pages/Editor.jsx";
import Preview from "./pages/Preview.jsx";
import Print from "./pages/Print.jsx";
import ProfilesPage from "./pages/ProfilesPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import "./tokens.css";
import "./styles.css";
import "./styles/landing.css";

// Aplicar el tema guardado antes del primer render (solo afecta a la app,
// nunca al documento CV, que tiene sus colores fijados).
const savedTheme = localStorage.getItem("cv-builder-theme");
if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Editor />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/print" element={<Print />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
