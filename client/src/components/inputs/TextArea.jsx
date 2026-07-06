// warn: el campo no tiene versión en el idioma de contenido activo.
export default function TextArea({ label, value, onChange, rows = 4, placeholder, warn, warnTitle }) {
  return (
    <label className="fld">
      {label ? <span className="fld-label">{label}</span> : null}
      <textarea
        rows={rows}
        className={warn ? "lz-missing" : undefined}
        title={warn ? warnTitle : undefined}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
