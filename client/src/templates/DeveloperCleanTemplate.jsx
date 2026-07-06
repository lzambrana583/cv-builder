import "./developer-clean.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Developer Clean: skills técnicas arriba como chips mono, experiencia
// muy legible. Balance entre técnico y profesional.
export default function DeveloperCleanTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="dvc">
      <div className="dvc-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " withLinks /> : null}
      </div>

      {show("skills") && m.skills.length ? (
        <ResumeSection title={t("cv.skills")}>
          <div className="dvc-chips">
            {m.skills.map((s, i) => <code className="dvc-chip" key={i}>{s.name}</code>)}
          </div>
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["profile", "employmentHistory", "education", "courses", "languages", "references", "projects"])}
        languages="inline"
        coursesTitleKey="cv.coursesCerts"
      />
    </ResumeRoot>
  );
}
