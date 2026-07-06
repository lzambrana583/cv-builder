import "./project-portfolio.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeProjects from "../components/resume/ResumeProjects.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Project Portfolio: sección visual de proyectos (cv.projects[], opcional)
// destacada tras el perfil. Para PM, arquitectos y Product Owners.
export default function ProjectPortfolioTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="prj">
      <div className="prj-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " withLinks /> : null}
      </div>

      <SingleColumnStack model={m} order={["profile"]} />

      {show("projects") && m.projects.length ? (
        <ResumeSection title={t("cv.projects")} className="prj-grid-section">
          <ResumeProjects model={m} />
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["employmentHistory", "education", "courses", "skills", "languages", "references"])}
        skills="inline"
        languages="inline"
      />
    </ResumeRoot>
  );
}
