import "./startup-modern.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Startup Modern: limpio y ágil, mucho aire, skills como chips.
export default function StartupModernTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show } = m;

  return (
    <ResumeRoot model={m} mode={mode} base="stm">
      <div className="stm-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " withLinks /> : null}
      </div>

      <SingleColumnStack model={m} order={["profile"]} />

      {show("skills") && m.skills.length ? (
        <ResumeSection title={t("cv.skills")}>
          <div className="stm-chips">
            {m.skills.map((s, i) => <span className="stm-chip" key={i}>{s.name}</span>)}
          </div>
        </ResumeSection>
      ) : null}

      <SingleColumnStack
        model={m}
        order={orderedSubset(m.sectionOrder, ["employmentHistory", "education", "courses", "languages", "references", "projects"])}
        languages="inline"
      />
    </ResumeRoot>
  );
}
