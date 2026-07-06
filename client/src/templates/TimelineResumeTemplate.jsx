import "./timeline-resume.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeExperience from "../components/resume/ResumeExperience.jsx";
import ResumeEducation from "../components/resume/ResumeEducation.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Timeline Resume: experiencia y educación en línea de tiempo vertical
// con fechas destacadas. Visual pero profesional.
export default function TimelineResumeTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="tml">
      <div className="tml-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " /> : null}
      </div>

      <SingleColumnStack model={m} order={["profile"]} />

      {show("employmentHistory") && m.jobs.length ? (
        <ResumeSection title={t("cv.employment")} className="tml-timeline">
          <ResumeExperience model={m} />
        </ResumeSection>
      ) : null}

      {show("education") && m.education.length ? (
        <ResumeSection title={t("cv.education")} className="tml-timeline">
          <ResumeEducation model={m} />
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["courses", "skills", "languages", "references", "projects"])}
        skills="inline"
        languages="inline"
      />
    </ResumeRoot>
  );
}
