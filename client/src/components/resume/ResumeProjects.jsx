// Proyectos (opcional, cv.projects[]): nombre, rol/empresa, fecha,
// descripción, bullets, tecnologías y enlace. Todo ya localizado en el modelo.
export default function ResumeProjects({ model }) {
  return (
    <div className="rs-projects">
      {model.projects.map((p, i) => (
        <div className="rs-item rs-project" key={i}>
          <h3 className="rs-item-title">
            {p.name}
            {p.role || p.company ? (
              <span className="rs-loc"> — {[p.role, p.company].filter(Boolean).join(", ")}</span>
            ) : null}
          </h3>
          {p.dates ? <p className="rs-dates">{p.dates}</p> : null}
          {p.description ? <p className="rs-project-desc">{p.description}</p> : null}
          {p.bullets.length ? (
            <ul className="rs-bullets">
              {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          ) : null}
          {p.technologies ? <p className="rs-project-tech">{p.technologies}</p> : null}
          {p.url ? (
            <p className="rs-project-link rs-wrap">
              <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
