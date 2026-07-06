import { useRef, useState } from "react";
import { useT } from "../../i18n/LangContext.jsx";

// Lista genérica de ítems editables.
// - onAdd / onRemove: añadir y eliminar.
// - onReorder(from, to): habilita drag & drop con el asa ⠿.
// - itemActions(item, i): botones extra por ítem (duplicar, ocultar…).
// - itemClassName(item, i): clase extra (p. ej. atenuar ocultos).
export default function ListEditor({
  items,
  renderItem,
  onAdd,
  onRemove,
  onReorder,
  addLabel,
  emptyText,
  itemActions,
  itemClassName,
}) {
  const t = useT();
  const safe = Array.isArray(items) ? items : [];
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const cls = (item, i) =>
    "list-item" +
    (onReorder ? " list-item--draggable" : "") +
    (dragOver === i ? " list-item--dragover" : "") +
    (itemClassName ? " " + (itemClassName(item, i) || "") : "");

  return (
    <div className="list-ed">
      {safe.length === 0 && emptyText ? <p className="list-empty">{emptyText}</p> : null}
      {safe.map((item, i) => (
        <div
          className={cls(item, i)}
          key={i}
          onDragOver={onReorder ? (e) => { e.preventDefault(); setDragOver(i); } : undefined}
          onDragLeave={onReorder ? () => setDragOver((d) => (d === i ? null : d)) : undefined}
          onDrop={
            onReorder
              ? (e) => {
                  e.preventDefault();
                  const from = dragFrom.current;
                  if (from != null && from !== i) onReorder(from, i);
                  dragFrom.current = null;
                  setDragOver(null);
                }
              : undefined
          }
        >
          {onReorder ? (
            <span
              className="drag-handle"
              draggable
              title={t("a.dragReorder")}
              onDragStart={(e) => {
                dragFrom.current = i;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
            >
              ⠿
            </span>
          ) : null}

          <div className="list-item-actions">
            {itemActions ? itemActions(item, i) : null}
            <button type="button" className="icon-danger" title={t("a.delete")} onClick={() => onRemove(i)}>
              ✕
            </button>
          </div>

          {renderItem(item, i)}
        </div>
      ))}
      <button type="button" className="list-add" onClick={onAdd}>
        {addLabel || t("btn.add")}
      </button>
    </div>
  );
}
