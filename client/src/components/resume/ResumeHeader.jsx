// Cabecera: foto (si la plantilla y los settings la permiten), nombre,
// separador decorativo opcional y título profesional.
export default function ResumeHeader({ model, photo = true, divider = null }) {
  const showPhoto = photo && model.opts.showPhoto && model.photo;
  const name = model.fullName || model.t("cv.yourName");
  return (
    <header className="rs-header">
      {showPhoto ? <img className="rs-photo" src={model.photo} alt={name} /> : null}
      <div className="rs-header-text">
        <h1 className="rs-name">{name}</h1>
        {divider}
        {model.roleTitle ? <p className="rs-role">{model.roleTitle}</p> : null}
      </div>
    </header>
  );
}
