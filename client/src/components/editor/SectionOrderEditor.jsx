import { useRef, useState } from "react";
import { useT } from "../../i18n/LangContext.jsx";

// Reordenamiento de secciones con drag & drop. Recibe el orden efectivo
// (ya resuelto) y notifica el nuevo orden explícito al reordenar.
// Muestra atenuadas las secciones ocultas (sectionsVisibility).
export default function SectionOrderEditor({ order, labels, visibility, onReorder, onReset, onUseRecommended }) {
  const t = useT();
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const move = (from, to) => {
    if (from == null || from === to) return;
    const next = [...order];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onReorder(next);
  };

  const vis = visibility || {};

  return (
    <div className="secorder">
      <span className="fld-label" style={{ display: "block" }}>{t("d.sectionOrder")}</span>
      <p className="secorder-hint">{t("d.sectionOrderHint")}</p>

      <ul className="secorder-list">
        {order.map((key, i) => (
          <li
            key={key}
            className={
              "secorder-item" +
              (dragOver === i ? " dragover" : "") +
              (vis[key] === false ? " hidden" : "")
            }
            draggable
            onDragStart={(e) => {
              dragFrom.current = i;
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
            onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
            onDrop={(e) => {
              e.preventDefault();
              move(dragFrom.current, i);
              dragFrom.current = null;
              setDragOver(null);
            }}
            onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
          >
            <span className="secorder-handle" title={t("a.dragReorder")}>⠿</span>
            <span className="secorder-name">{labels[key] || key}</span>
            {vis[key] === false ? <span className="secorder-off">✕</span> : null}
            <span className="secorder-moves">
              <button type="button" disabled={i === 0} title="↑" onClick={() => move(i, i - 1)}>↑</button>
              <button type="button" disabled={i === order.length - 1} title="↓" onClick={() => move(i, i + 1)}>↓</button>
            </span>
          </li>
        ))}
      </ul>

      <div className="secorder-actions">
        <button type="button" onClick={onReset}>{t("d.resetOrder")}</button>
        <button type="button" onClick={onUseRecommended}>{t("d.useRecommended")}</button>
      </div>
    </div>
  );
}
