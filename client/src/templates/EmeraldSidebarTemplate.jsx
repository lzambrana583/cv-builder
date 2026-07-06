import "./emerald-sidebar.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeSkills from "../components/resume/ResumeSkills.jsx";
import ResumeLanguages from "../components/resume/ResumeLanguages.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Plantilla principal: sidebar esmeralda (32%) + columna blanca.
// Solo define layout y estilos; el contenido viene del modelo compartido.
// El orden de las secciones de la columna principal respeta model.sectionOrder.
const MAIN_KEYS = ["profile", "employmentHistory", "education", "courses", "projects", "references"];

export default function EmeraldSidebarTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const s = settings || m.settings;
  const { t, show } = m;
  const mainOrder = orderedSubset(m.sectionOrder, MAIN_KEYS);

  // Variables CSS personalizables (con defaults en emerald-sidebar.css).
  const style = {};
  if (s.sidebarColor) style["--emt-green"] = s.sidebarColor;
  if (s.accentColor) style["--emt-accent"] = s.accentColor;
  if (s.textColor) style["--emt-ink"] = s.textColor;
  if (s.headingColor) style["--emt-heading"] = s.headingColor;
  if (s.fontFamily) style["--emt-font"] = `"${s.fontFamily}", "Segoe UI", Arial, system-ui, sans-serif`;
  if (s.headingFontFamily) style["--emt-heading-font"] = `"${s.headingFontFamily}", Georgia, serif`;

  return (
    <ResumeRoot model={m} mode={mode} base="emt" style={style}>
      {/* ---- Columna izquierda (sidebar) ---- */}
      <aside className="emt-side">
        <ResumeHeader model={m} divider={<div className="emt-rule" />} />

        {show("details") ? (
          <ResumeSection title={t("cv.details")}>
            <ResumeContactInfo model={m} layout="stacked" />
          </ResumeSection>
        ) : null}

        {show("links") && m.links.length ? (
          <ResumeSection title={t("cv.links")}>
            {m.links.map((l, i) => (
              <p key={i} className="rs-contact-row rs-wrap">
                <a href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>
              </p>
            ))}
          </ResumeSection>
        ) : null}

        {show("skills") && m.skills.length ? (
          <ResumeSection title={t("cv.skills")}>
            <ResumeSkills model={m} />
          </ResumeSection>
        ) : null}

        {show("languages") && m.languages.length ? (
          <ResumeSection title={t("cv.languages")}>
            <ResumeLanguages model={m} />
          </ResumeSection>
        ) : null}
      </aside>

      {/* ---- Columna derecha (orden respeta model.sectionOrder) ---- */}
      <main className="emt-main">
        <SingleColumnStack model={m} order={mainOrder} />
      </main>
    </ResumeRoot>
  );
}
