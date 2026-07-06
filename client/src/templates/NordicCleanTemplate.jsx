import "./nordic-clean.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Nordic Clean: minimalismo premium con mucho espacio en blanco.
export default function NordicCleanTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="nrd">
      <div className="nrd-head">
        <ResumeHeader model={m} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="      " /> : null}
      </div>
      <SingleColumnStack model={m} skills="list" languages="list" />
    </ResumeRoot>
  );
}
