import "./consulting-brief.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Consulting Brief: resumen ejecutivo destacado en caja, experiencia
// orientada a proyectos y resultados.
export default function ConsultingBriefTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="cns">
      <div className="cns-head">
        <ResumeHeader model={m} photo={false} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   |   " /> : null}
      </div>

      {show("profile") && m.profile ? (
        <ResumeSection title={t("cv.profile")} className="cns-summary">
          <p className="rs-profile">{m.profile}</p>
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["employmentHistory", "education", "courses", "skills", "languages", "references", "projects"])}
        skills="inline"
        languages="inline"
        coursesTitleKey="cv.coursesCerts"
      />
    </ResumeRoot>
  );
}
