import "./fintech-premium.css";
import { buildResumeModel } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Fintech Premium: sobrio con acentos verde/azul, cabecera a dos zonas.
export default function FintechPremiumTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="ftp">
      <div className="ftp-head">
        <ResumeHeader model={m} />
        {m.show("details") ? (
          <div className="ftp-contact">
            <ResumeContactInfo model={m} layout="stacked" />
          </div>
        ) : null}
      </div>
      <div className="ftp-body">
        <SingleColumnStack model={m} skills="auto" languages="auto" />
      </div>
    </ResumeRoot>
  );
}
