import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCV } from "../api.js";
import ResumePreview from "../components/ResumePreview.jsx";

// Versión limpia para imprimir / exportar a PDF (sin barras ni cromo).
// Acepta ?profile=<id>&version=<id> para renderizar el CV de una persona.
export default function Print() {
  const [cv, setCv] = useState(null);
  const [params] = useSearchParams();
  const profile = params.get("profile") || "";
  const version = params.get("version") || "default";

  useEffect(() => {
    if (!profile) return;
    getCV(profile, version).then(setCv).catch(() => {});
  }, [profile, version]);

  return (
    <div className="print-root">
      <ResumePreview cv={cv} plain />
    </div>
  );
}
