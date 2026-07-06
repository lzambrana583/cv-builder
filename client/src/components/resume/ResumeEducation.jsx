// Educación: título, institución, ubicación y fechas.
export default function ResumeEducation({ model }) {
  return (
    <>
      {model.education.map((ed, i) => (
        <div className="rs-item" key={i}>
          <h3 className="rs-item-title">
            {[ed.degree, ed.institution].filter(Boolean).join(" — ")}
            {ed.location ? <span className="rs-loc">, {ed.location}</span> : null}
          </h3>
          {ed.dates ? <p className="rs-dates">{ed.dates}</p> : null}
        </div>
      ))}
    </>
  );
}
