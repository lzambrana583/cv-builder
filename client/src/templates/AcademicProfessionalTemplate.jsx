import "./academic-professional.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Academic Professional: educación y cursos antes que la experiencia,
// para docencia, investigación y universidad.
export default function AcademicProfessionalTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="acd">
      <div className="acd-head">
        <ResumeHeader model={m} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   ·   " withLinks /> : null}
      </div>
      <SingleColumnStack model={m} skills="inline" languages="inline" coursesTitleKey="cv.coursesCerts" />
    </ResumeRoot>
  );
}
