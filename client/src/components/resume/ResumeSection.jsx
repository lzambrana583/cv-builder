// Sección con título. Las plantillas estilizan .rs-section / .rs-title
// bajo el scope de su clase raíz.
export default function ResumeSection({ title, className = "", children }) {
  return (
    <section className={("rs-section " + className).trim()}>
      {title ? <h2 className="rs-title">{title}</h2> : null}
      {children}
    </section>
  );
}
