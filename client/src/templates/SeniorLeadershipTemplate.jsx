import "./senior-leadership.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Senior Leadership: cabecera oscura ejecutiva, resumen profesional
// fuerte y logros destacados. Para Delivery Lead, TPM y PMO.
export default function SeniorLeadershipTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="snl">
      <div className="snl-band">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="   |   " /> : null}
      </div>

      <div className="snl-body">
        {show("profile") && m.profile ? (
          <ResumeSection title={t("cv.profile")} className="snl-summary">
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
      </div>
    </ResumeRoot>
  );
}
