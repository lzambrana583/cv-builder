// warn: el campo no tiene versión en el idioma de contenido activo
// (el CV muestra el otro idioma como respaldo).
export default function TextInput({ label, value, onChange, placeholder, type = "text", error, warn, warnTitle }) {
  const cls = error ? "invalid" : warn ? "lz-missing" : undefined;
  return (
    <label className="fld">
      {label ? <span className="fld-label">{label}</span> : null}
      <input
        type={type}
        className={cls}
        title={warn ? warnTitle : undefined}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="fld-error">{error}</span> : null}
    </label>
  );
}
