import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCV } from "../api.js";
import { getT } from "../i18n/translations.js";
import ResumePreview from "../components/ResumePreview.jsx";

// Solo preview. Acepta ?profile=<id>&version=<id>.
export default function Preview() {
  const [cv, setCv] = useState(null);
  const [params] = useSearchParams();
  const profile = params.get("profile") || "";
  const version = params.get("version") || "default";

  useEffect(() => {
    if (!profile) return;
    getCV(profile, version).then(setCv).catch(() => {});
  }, [profile, version]);

  const qs = new URLSearchParams({ profile });
  if (version !== "default") qs.set("version", version);
  const t = getT(cv?.settings?.language);

  return (
    <div className="app">
      <header className="topbar">
        <strong>CV Builder — {t("btn.preview")}{cv?.versionName ? ` · ${cv.versionName}` : ""}</strong>
        <nav className="topbar-nav">
          <Link to="/app">{t("btn.editor")}</Link>
          <Link to={`/print?${qs.toString()}`}>{t("btn.print")}</Link>
        </nav>
      </header>
      <div className="pane pane--preview centered">
        <ResumePreview cv={cv} />
      </div>
    </div>
  );
}
