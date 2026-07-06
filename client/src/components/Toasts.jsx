// Pila de notificaciones (abajo a la derecha). Clic para descartar.
export default function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          onClick={() => onDismiss(t.id)}
          title="Clic para descartar"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
