import EmeraldSidebarTemplate from "./EmeraldSidebarTemplate.jsx";

// Variante corporativa/tecnológica del layout de sidebar: paleta azul
// oscuro y títulos sans. Reutiliza íntegramente EmeraldSidebarTemplate.
export default function ModernBlueSidebarTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const forced = {
    ...(cv.settings || {}),
    sidebarColor: "#16324c",
    accentColor: "#2563eb",
    headingColor: "#101b28",
    headingFontFamily: "Inter",
  };
  return (
    <EmeraldSidebarTemplate
      cv={{ ...cv, settings: forced }}
      language={language}
      settings={forced}
      mode={mode}
      templateOrder={templateOrder}
    />
  );
}
