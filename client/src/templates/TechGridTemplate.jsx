import "./tech-grid.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeSkills from "../components/resume/ResumeSkills.jsx";
import ResumeLanguages from "../components/resume/ResumeLanguages.jsx";
import ResumeCourses from "../components/resume/ResumeCourses.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Plantilla Technical: cabecera con contacto monoespaciado, títulos con
// filete de acento y skills en cuadrícula compacta. Skills fijo arriba;
// el resto del flujo respeta model.sectionOrder. Cursos+idiomas en 2 col.
export default function TechGridTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const s = settings || m.settings;
  const { t, show } = m;

  const style = {};
  if (s.accentColor) style["--tch-accent"] = s.accentColor;

  return (
    <ResumeRoot model={m} mode={mode} base="tch" style={style}>
      <div className="tch-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " withLinks /> : null}
      </div>

      {show("skills") && m.skills.length ? (
        <ResumeSection title={t("cv.skills")}>
          <ResumeSkills model={m} />
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["profile", "employmentHistory", "education", "projects"])}
      />

      <div className="tch-two-col">
        {show("courses") && m.courses.length ? (
          <ResumeSection title={t("cv.courses")}>
            <ResumeCourses model={m} />
          </ResumeSection>
        ) : null}

        {show("languages") && m.languages.length ? (
          <ResumeSection title={t("cv.languages")}>
            <ResumeLanguages model={m} />
          </ResumeSection>
        ) : null}
      </div>

      <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["references"])} />
    </ResumeRoot>
  );
}
