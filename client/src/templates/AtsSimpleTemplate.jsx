import "./ats-simple.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Plantilla "ATS Mode": una sola columna, sin sidebar, sin foto, sin barras.
// Estructura lineal para que los sistemas de reclutamiento la parseen bien.
// Respeta el orden de secciones (model.sectionOrder).
export default function AtsSimpleTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);

  return (
    <ResumeRoot model={m} mode={mode} base="ats">
      <ResumeHeader model={m} photo={false} />
      {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator=" | " withLinks /> : null}
      <SingleColumnStack model={m} skills="inline" languages="inline" coursesTitleKey="cv.coursesCerts" />
    </ResumeRoot>
  );
}
