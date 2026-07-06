import "./product-leader.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeSection from "../components/resume/ResumeSection.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import ResumeLanguages from "../components/resume/ResumeLanguages.jsx";
import ResumeExperience from "../components/resume/ResumeExperience.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Product Leader: header fuerte, skills agrupadas por nivel de dominio
// y experiencia con logros destacados. Para PO / PM / Delivery Lead.
export default function ProductLeaderTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  const { t, show, opts } = m;

  // Agrupación por dominio a partir del nivel 0-100 del modelo.
  const groups = [
    { label: "Expert", min: 90 },
    { label: "Advanced", min: 60 },
    { label: "Familiar", min: 0 },
  ].map((g, i, all) => ({
    ...g,
    items: m.skills.filter((s) => s.level >= g.min && (i === 0 || s.level < all[i - 1].min)),
  })).filter((g) => g.items.length);

  return (
    <ResumeRoot model={m} mode={mode} base="pdl">
      <div className="pdl-head">
        <ResumeHeader model={m} />
        {show("details") ? <ResumeContactInfo model={m} layout="inline" separator="  ·  " /> : null}
      </div>

      <SingleColumnStack model={m} order={["profile"]} />

      {show("skills") && m.skills.length ? (
        <ResumeSection title={t("cv.skills")}>
          {groups.map((g) => (
            <div className="pdl-skill-group" key={g.label}>
              <span className="pdl-tier">{g.label}</span>
              <span className="pdl-chips">
                {g.items.map((s, i) => <span className="pdl-chip" key={i}>{s.name}</span>)}
              </span>
            </div>
          ))}
        </ResumeSection>
      ) : null}

      {show("employmentHistory") && m.jobs.length ? (
        <ResumeSection title={t("cv.employment")} className="pdl-exp">
          <ResumeExperience model={m} />
        </ResumeSection>
      ) : null}

      <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["education", "courses", "references", "projects"])} />

      {show("languages") && m.languages.length ? (
        <ResumeSection title={t("cv.languages")}>
          <ResumeLanguages model={m} layout="inline" />
        </ResumeSection>
      ) : null}
    </ResumeRoot>
  );
}
