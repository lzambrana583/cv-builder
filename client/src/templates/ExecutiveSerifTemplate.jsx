import "./executive-serif.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Plantilla Executive: una columna serif elegante, cabecera centrada
// con doble filete, títulos en versalitas. Respeta model.sectionOrder.
export default function ExecutiveSerifTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);

  return (
    <ResumeRoot model={m} mode={mode} base="exv">
      <div className="exv-head">
        <ResumeHeader model={m} photo={false} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   ·   " withLinks /> : null}
        <div className="exv-double-rule" />
      </div>
      <SingleColumnStack model={m} skills="inline" languages="inline" />
    </ResumeRoot>
  );
}
