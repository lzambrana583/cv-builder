import LevelList from "./LevelList.jsx";

// Habilidades. layout: "bars" | "list" | "inline" (o automático según
// settings.showSkillBars cuando la plantilla pasa "auto").
export default function ResumeSkills({ model, layout = "auto", joiner }) {
  const resolved = layout === "auto" ? (model.opts.skillBars ? "bars" : "list") : layout;
  return <LevelList items={model.skills} layout={resolved} joiner={joiner} />;
}
