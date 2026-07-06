import { useT } from "../../i18n/LangContext.jsx";

// Tarjeta de sección del editor: título + acciones opcionales (p. ej. el
// switch EN/ES de contenido) + toggle de visibilidad + contenido.
export default function SectionEditor({ title, visible, onToggleVisible, actions, children }) {
  const t = useT();
  return (
    <section className="sec">
      <header className="sec-head">
        <h3>{title}</h3>
        <div className="sec-head-right">
          {actions}
          {onToggleVisible ? (
            <label className="sec-vis">
              <input
                type="checkbox"
                checked={visible !== false}
                onChange={(e) => onToggleVisible(e.target.checked)}
              />
              {t("sec.visibleInCV")}
            </label>
          ) : null}
        </div>
      </header>
      <div className="sec-body">{children}</div>
    </section>
  );
}
