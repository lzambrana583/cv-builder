import "./compact-one-page.css";
import { buildResumeModel, orderedSubset } from "../components/resume/resumeModel.js";
import ResumeRoot from "../components/resume/ResumeRoot.jsx";
import ResumeHeader from "../components/resume/ResumeHeader.jsx";
import ResumeContactInfo from "../components/resume/ResumeContactInfo.jsx";
import SingleColumnStack from "../components/resume/SingleColumnStack.jsx";

// Compact One Page: tipografía pequeña y cuerpo a dos columnas para
// caber en una sola página. Ideal para versiones resumidas.
export default function CompactOnePageTemplate({ cv, language, settings, mode = "preview", templateOrder }) {
  const m = buildResumeModel(cv, language, templateOrder);
  return (
    <ResumeRoot model={m} mode={mode} base="cop">
      <div className="cop-head">
        <ResumeHeader model={m} photo={false} />
        {m.show("details") ? <ResumeContactInfo model={m} layout="inline" separator=" · " /> : null}
      </div>
      <div className="cop-body">
        <div className="cop-main">
          <SingleColumnStack model={m} order={orderedSubset(m.sectionOrder, ["profile", "employmentHistory", "projects"])} />
        </div>
        <div className="cop-side">
          <SingleColumnStack
            model={m}
            order={orderedSubset(m.sectionOrder, ["skills", "languages", "education", "courses", "references"])}
            skills="list"
            languages="list"
            coursesTitleKey="cv.coursesCerts"
          />
        </div>
      </div>
    </ResumeRoot>
  );
}
