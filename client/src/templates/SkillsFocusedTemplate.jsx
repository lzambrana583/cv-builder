import "./skills-focused.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeSkills from "../components/resume/ResumeSkills.jsx";
import ResumeLanguages from "../components/resume/ResumeLanguages.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Skills Focused: habilidades arriba y muy visibles, en cuadrícula.
export default function SkillsFocusedTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="skf">
      <div className="skf-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " /> : null}
      </div>

      {show("skills") && m.skills.length ? (
        <ResumeSection title={t("cv.skills")} className="skf-skills">
          <ResumeSkills model={m} />
        </ResumeSection>
      ) : null}

      {show("languages") && m.languages.length ? (
        <ResumeSection title={t("cv.languages")} className="skf-skills">
          <ResumeLanguages model={m} />
        </ResumeSection>
      ) : null}

      <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["profile", "employmentHistory", "education", "courses", "references", "projects"])} />
    </ResumeRoot>
  );
}
