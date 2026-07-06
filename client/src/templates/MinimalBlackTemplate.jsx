import "./minimal-black.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Minimal Black: una columna en blanco y negro, muy limpia.
export default function MinimalBlackTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="mnb">
      <div className="mnb-head">
        <ResumeHeader model={m} photo={false} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " withLinks /> : null}
      </div>
      <SingleColumnStack model={m} skills="inline" languages="inline" />
    </ResumeRoot>
  );
}
