import "./elegant-gray.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Elegant Gray: tonos grises sofisticados, cabecera con banda suave.
export default function ElegantGrayTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="elg">
      <div className="elg-head">
        <ResumeHeader model={m} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   ·   " /> : null}
      </div>
      <div className="elg-body">
        <SingleColumnStack model={m} skills="auto" languages="auto" />
      </div>
    </ResumeRoot>
  );
}
