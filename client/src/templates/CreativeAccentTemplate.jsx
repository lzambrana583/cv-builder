import "./creative-accent.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Plantilla Creative: banda superior de color con foto, cuerpo a dos
// columnas asimétricas. Cada columna respeta model.sectionOrder.
export default function CreativeAccentTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const s = settings || m.settings;
  const { t, show } = m;

  const style = {};
  if (s.accentColor) style["--crt-accent"] = s.accentColor;
  if (s.sidebarColor) style["--crt-band"] = s.sidebarColor;

  return (
    <ResumeRoot model={m} mode={mode} base="crt" style={style}>
      {/* Banda superior */}
      <div className="crt-band">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  •  " /> : null}
      </div>

      <div className="crt-body">
        {/* Columna principal */}
        <main className="crt-main">
          <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["profile", "employmentHistory", "education", "projects"])} />
        </main>

        {/* Columna lateral */}
        <aside className="crt-side">
          {show("links") && m.links.length ? (
            <ResumeSection title={t("cv.links")}>
              {m.links.map((l, i) => (
                <p key={i} className="rs-contact-row rs-wrap">
                  <a href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>
                </p>
              ))}
            </ResumeSection>
          ) : null}
          <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["skills", "languages", "courses", "references"])} />
        </aside>
      </div>
    </ResumeRoot>
  );
}
