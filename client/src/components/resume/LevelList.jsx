// Lista de pares nombre + nivel (0-100), usada por skills e idiomas.
// layout "bars": nombre + barra de progreso (.rs-track/.rs-fill)
// layout "list": solo nombres, apilados
// layout "inline": nombres unidos en una línea (ATS friendly)
export default function LevelList({ items, layout = "bars", joiner = " · " }) {
  if (!items.length) return null;

  if (layout === "inline") {
    return <p className="rs-inline-list">{items.map((it) => it.name).join(joiner)}</p>;
  }

  return (
    <div className={"rs-levels rs-levels--" + layout}>
      {items.map((it, i) => (
        <div className={"rs-lvl" + (layout === "list" ? " rs-lvl--plain" : "")} key={i}>
          <div className="rs-lvl-name">{it.name}</div>
          {layout === "bars" ? (
            <div className="rs-track">
              <div className="rs-fill" style={{ width: it.level + "%" }} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
