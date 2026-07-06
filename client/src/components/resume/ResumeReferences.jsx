// Referencias en cuadrícula: nombre, cargo y contacto.
export default function ResumeReferences({ model }) {
  return (
    <div className="rs-refs">
      {model.references.map((r, i) => (
        <div className="rs-ref" key={i}>
          <strong className="rs-ref-name">{r.name}</strong>
          {r.role ? <div className="rs-muted">{r.role}</div> : null}
          {r.email ? <div className="rs-muted rs-wrap">{r.email}</div> : null}
          {r.phone ? <div className="rs-muted">{r.phone}</div> : null}
        </div>
      ))}
    </div>
  );
}
