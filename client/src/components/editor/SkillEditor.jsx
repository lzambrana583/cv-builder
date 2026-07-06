// Fila de habilidad o idioma: nombre + slider de nivel 0–100.
export default function SkillEditor({ item, onChange, namePlaceholder = "Nombre" }) {
  const pct = Math.max(0, Math.min(100, Number(item.level) || 0));
  return (
    <div className="skill-ed">
      <input
        type="text"
        value={item.name || ""}
        placeholder={namePlaceholder}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={pct}
        onChange={(e) => onChange({ level: Number(e.target.value) })}
      />
      <span className="skill-num">{pct}</span>
    </div>
  );
}
