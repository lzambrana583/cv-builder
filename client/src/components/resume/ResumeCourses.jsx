// Cursos y certificaciones: nombre, institución y fechas.
export default function ResumeCourses({ model }) {
  return (
    <>
      {model.courses.map((c, i) => (
        <div className="rs-item rs-item--tight" key={i}>
          <h3 className="rs-item-title">
            {[c.name, c.institution].filter(Boolean).join(" — ")}
          </h3>
          {c.dates ? <p className="rs-dates">{c.dates}</p> : null}
        </div>
      ))}
    </>
  );
}
