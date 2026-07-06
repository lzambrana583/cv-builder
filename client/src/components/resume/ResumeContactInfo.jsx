// Datos de contacto y detalles personales.
// layout "inline": líneas compactas (email | tel | ubicación) para cabeceras.
// layout "stacked": filas con etiquetas (estilo sidebar).
export default function ResumeContactInfo({ model, layout = "inline", separator = "  •  ", withLinks = false }) {
  const { contact, links, opts, t, show } = model;
  const main = [contact.email, contact.phone, contact.location].filter(Boolean);
  const nat = opts.showNationality && contact.nationality;
  const birth = opts.showBirthDate && contact.birth;
  const linkTexts = withLinks && show("links")
    ? links.map((l) => (l.label ? `${l.label}: ${l.url}` : l.url)).filter(Boolean)
    : [];

  if (layout === "stacked") {
    return (
      <div className="rs-contact rs-contact--stacked">
        {contact.location ? <p className="rs-contact-row">{contact.location}</p> : null}
        {contact.phone ? <p className="rs-contact-row">{contact.phone}</p> : null}
        {contact.email ? <p className="rs-contact-row rs-wrap">{contact.email}</p> : null}
        {nat ? (
          <>
            <h4 className="rs-contact-label">{t("cv.nationality")}</h4>
            <p className="rs-contact-row">{contact.nationality}</p>
          </>
        ) : null}
        {birth ? (
          <>
            <h4 className="rs-contact-label">{t("cv.birthInfo")}</h4>
            <p className="rs-contact-row">{contact.birth}</p>
          </>
        ) : null}
      </div>
    );
  }

  const extra = [
    nat ? `${t("cv.nationality")}: ${contact.nationality}` : null,
    birth ? `${t("cv.birth")}: ${contact.birth}` : null,
  ].filter(Boolean);

  return (
    <div className="rs-contact rs-contact--inline">
      {main.length ? <p className="rs-contact-line">{main.join(separator)}</p> : null}
      {extra.length ? <p className="rs-contact-line rs-contact-extra">{extra.join(separator)}</p> : null}
      {linkTexts.length ? <p className="rs-contact-line rs-contact-links">{linkTexts.join(separator)}</p> : null}
    </div>
  );
}
