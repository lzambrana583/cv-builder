import ResumeSection from "./ResumeSection.jsx";
import ResumeSkills from "./ResumeSkills.jsx";
import ResumeLanguages from "./ResumeLanguages.jsx";
import ResumeExperience from "./ResumeExperience.jsx";
import ResumeEducation from "./ResumeEducation.jsx";
import ResumeCourses from "./ResumeCourses.jsx";
import ResumeReferences from "./ResumeReferences.jsx";
import ResumeProjects from "./ResumeProjects.jsx";

// Apila las secciones estándar. Por defecto usa model.sectionOrder (orden
// del usuario > recomendado de la plantilla > global), de modo que
// reordenar en el editor afecta a estas plantillas. Una plantilla puede
// pasar `order` explícito (un subconjunto) para layouts especiales.
// Claves canónicas: profile, employmentHistory, education, courses, skills,
// languages, references, projects. Aliases: employment, coursesCerts.
// coursesTitleKey elige el título de "courses" ("cv.courses" | "cv.coursesCerts").
export default function SingleColumnStack({
  model,
  order,
  skills = "auto",
  languages = "auto",
  sectionClass = "",
  coursesTitleKey = "cv.courses",
}) {
  const { t, show, opts } = model;
  const effectiveOrder = Array.isArray(order) && order.length ? order : model.sectionOrder;

  const coursesRenderer = (titleKey) => () =>
    show("courses") && model.courses.length ? (
      <ResumeSection title={t(titleKey)} className={sectionClass}>
        <ResumeCourses model={model} />
      </ResumeSection>
    ) : null;

  const sections = {
    profile: () =>
      show("profile") && model.profile ? (
        <ResumeSection title={t("cv.profile")} className={sectionClass}>
          <p className="rs-profile">{model.profile}</p>
        </ResumeSection>
      ) : null,
    employmentHistory: () =>
      show("employmentHistory") && model.jobs.length ? (
        <ResumeSection title={t("cv.employment")} className={sectionClass}>
          <ResumeExperience model={model} />
        </ResumeSection>
      ) : null,
    education: () =>
      show("education") && model.education.length ? (
        <ResumeSection title={t("cv.education")} className={sectionClass}>
          <ResumeEducation model={model} />
        </ResumeSection>
      ) : null,
    courses: coursesRenderer(coursesTitleKey),
    skills: () =>
      show("skills") && model.skills.length ? (
        <ResumeSection title={t("cv.skills")} className={sectionClass}>
          <ResumeSkills model={model} layout={skills} />
        </ResumeSection>
      ) : null,
    languages: () =>
      show("languages") && model.languages.length ? (
        <ResumeSection title={t("cv.languages")} className={sectionClass}>
          <ResumeLanguages model={model} layout={languages} />
        </ResumeSection>
      ) : null,
    projects: () =>
      show("projects") && model.projects.length ? (
        <ResumeSection title={t("cv.projects")} className={sectionClass}>
          <ResumeProjects model={model} />
        </ResumeSection>
      ) : null,
    references: () =>
      show("references") && opts.showReferences && model.references.length ? (
        <ResumeSection title={t("cv.references")} className={sectionClass}>
          <ResumeReferences model={model} />
        </ResumeSection>
      ) : null,
  };
  // Aliases retrocompatibles para llamadas con order explícito.
  sections.employment = sections.employmentHistory;
  sections.coursesCerts = coursesRenderer("cv.coursesCerts");

  return <>{effectiveOrder.map((key, i) => <Slot key={key + i} render={sections[key]} />)}</>;
}

function Slot({ render }) {
  return render ? render() : null;
}
