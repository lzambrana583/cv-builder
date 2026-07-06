import "./banking-professional.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Banking Professional: formal y sobrio, líneas finas y títulos discretos.
export default function BankingProfessionalTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="bnk">
      <div className="bnk-head">
        <ResumeHeader model={m} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   |   " /> : null}
      </div>
      <SingleColumnStack model={m} skills="inline" languages="inline" />
    </ResumeRoot>
  );
}
