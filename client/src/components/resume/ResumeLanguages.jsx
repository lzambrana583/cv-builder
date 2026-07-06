import LevelList from "./LevelList.jsx";

// Idiomas. Mismos layouts que ResumeSkills.
export default function ResumeLanguages({ model, layout = "auto", joiner }) {
  const resolved = layout === "auto" ? (model.opts.skillBars ? "bars" : "list") : layout;
  return <LevelList items={model.languages} layout={resolved} joiner={joiner} />;
}
