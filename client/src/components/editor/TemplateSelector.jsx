import { memo, useEffect, useState } from "react";
import { templateRegistry, TEMPLATE_CATEGORIES, getTemplate } from "../../templates/templateRegistry.js";
import ResumePreview from "../ResumePreview.jsx";

// Galería de plantillas: buscador, filtros, badges, mini preview EN VIVO
// (renderiza cada plantilla con los datos reales del CV, escalada) y
// preview a pantalla completa antes de aplicar.
const FILTERS = ["All", ...TEMPLATE_CATEGORIES, "Banking"];

export default function TemplateSelector({ cv, value, onChange }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [fsId, setFsId] = useState(null);

  const list = templateRegistry.filter((tpl) => {
    const byFilter =
      filter === "All" ||
      tpl.category === filter ||
      (filter === "Banking" && (tpl.tags || []).includes("banking"));
    const byQuery = !query.trim() || tpl.name.toLowerCase().includes(query.trim().toLowerCase());
    return byFilter && byQuery;
  });

  return (
    <div className="tpl-gallery">
      {/* Toolbar: buscador + filtros */}
      <div className="tpl-toolbar">
        <input
          type="search"
          className="tpl-search"
          placeholder="Search templates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="tpl-filters">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              className={"tpl-filter" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="tpl-grid">
        {list.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            cv={cv}
            active={value === tpl.id}
            onUse={() => onChange(tpl.id)}
            onPreview={() => setFsId(tpl.id)}
          />
        ))}
        {!list.length ? <p className="list-empty">No templates found.</p> : null}
      </div>

      {/* Preview a pantalla completa */}
      {fsId ? (
        <TemplateFullscreen
          cv={cv}
          templateId={fsId}
          active={value === fsId}
          onUse={() => { onChange(fsId); setFsId(null); }}
          onClose={() => setFsId(null)}
        />
      ) : null}
    </div>
  );
}

function TemplateCard({ tpl, cv, active, onUse, onPreview }) {
  const badges = [
    tpl.atsFriendly && { label: "ATS Friendly", cls: "b-ats" },
    tpl.supportsPhoto && { label: "Supports Photo", cls: "" },
    tpl.columns === 1 && { label: "One Column", cls: "" },
    tpl.columns === 2 && { label: "Two Columns", cls: "" },
    (tpl.tags || []).includes("tech") && { label: "Best for Tech", cls: "b-tag" },
    (tpl.tags || []).includes("banking") && { label: "Best for Banking", cls: "b-tag" },
    (tpl.tags || []).includes("executive") && { label: "Best for Executive", cls: "b-tag" },
  ].filter(Boolean);

  return (
    <div className={"tpl-card" + (active ? " active" : "")}>
      <button type="button" className="tpl-mini" title="Preview Template Fullscreen" onClick={onPreview}>
        <LiveThumb cv={cv} templateId={tpl.id} />
        <span className="tpl-mini-zoom">⛶</span>
        {active ? <span className="tpl-active-tag">✓ Active</span> : null}
      </button>
      <div className="tpl-info">
        <div className="tpl-head-row">
          <span className="tpl-name">{tpl.name}</span>
          <span className="tpl-cat-chip">{tpl.category}</span>
        </div>
        <span className="tpl-desc">{tpl.description}</span>
        <div className="tpl-badges">
          {badges.map((b) => <span key={b.label} className={"tpl-badge " + b.cls}>{b.label}</span>)}
        </div>
        <div className="tpl-actions">
          <button type="button" className={"tpl-use" + (active ? " in-use" : "")} onClick={onUse} disabled={active}>
            {active ? "✓ In Use" : "Use Template"}
          </button>
          <button type="button" className="tpl-fs-btn" title="Preview Template Fullscreen" onClick={onPreview}>
            ⛶ Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// Mini preview en vivo: la plantilla real con los datos reales, escalada.
// memo(): solo re-renderiza si cambia el CV o la plantilla.
const LiveThumb = memo(function LiveThumb({ cv, templateId }) {
  const cvT = { ...cv, settings: { ...(cv.settings || {}), template: templateId } };
  return (
    <span className="tpl-thumb-live" aria-hidden="true">
      <span className="tpl-thumb-scale">
        <ResumePreview cv={cvT} mode="preview" />
      </span>
    </span>
  );
});

function TemplateFullscreen({ cv, templateId, active, onUse, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tpl = getTemplate(templateId);
  const cvT = { ...cv, settings: { ...(cv.settings || {}), template: templateId } };

  return (
    <div className="fs-overlay" onClick={onClose}>
      <div className="tpl-fs-bar" onClick={(e) => e.stopPropagation()}>
        <strong>{tpl?.name}</strong>
        <span className="tpl-cat-chip">{tpl?.category}</span>
        <span className="tpl-fs-spacer" />
        <button type="button" className="primary" onClick={onUse} disabled={active}>
          {active ? "✓ In Use" : "Use Template"}
        </button>
        <button type="button" onClick={onClose}>✕ Close (Esc)</button>
      </div>
      <div className="tpl-fs-doc" onClick={(e) => e.stopPropagation()}>
        <ResumePreview cv={cvT} mode="preview" />
      </div>
    </div>
  );
}
