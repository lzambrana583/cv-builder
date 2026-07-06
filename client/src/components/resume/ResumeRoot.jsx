import "./resume-base.css";

// Raíz común de toda plantilla: caja A4/Carta, clase de modo print,
// modo compacto y @page dinámico. `base` es la clase raíz de la plantilla.
export default function ResumeRoot({ model, mode = "preview", base, style, children }) {
  const { pageSize, compact } = model.opts;
  const cls =
    `rs-resume ${base}` +
    (mode === "print" ? " rs--plain" : "") +
    (compact ? ` ${base}--compact` : "") +
    (pageSize === "Letter" ? " rs--letter" : "");

  return (
    <div className={cls} style={style}>
      <style>{`@page { size: ${pageSize === "Letter" ? "letter" : "A4"}; margin: 0; }`}</style>
      {children}
    </div>
  );
}
