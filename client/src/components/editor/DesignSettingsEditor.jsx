import { useT } from "../../i18n/LangContext.jsx";
import TemplateSelector from "./TemplateSelector.jsx";
import SectionOrderEditor from "./SectionOrderEditor.jsx";
import { resolveTemplate, DEFAULT_TEMPLATE_ID } from "../../templates/templateRegistry.js";
import { resolveSectionOrder, SECTION_KEYS } from "../resume/resumeModel.js";

// Ajustes de diseño (cv.settings) + visibilidad de secciones (cv.sectionsVisibility).
const BODY_FONTS = ["Inter", "Arial", "Segoe UI", "Verdana", "system-ui"];
const HEADING_FONTS = ["Georgia", "Times New Roman", "Garamond", "Palatino Linotype", "Inter"];

const TOGGLES = [
  { key: "showPhoto", labelKey: "d.showPhoto", def: true },
  { key: "compactMode", labelKey: "d.compactMode", def: false },
  { key: "showSkillBars", labelKey: "d.showSkillBars", def: true },
  { key: "showReferences", labelKey: "d.showReferences", def: true },
  { key: "showNationality", labelKey: "d.showNationality", def: true },
  { key: "showBirthDate", labelKey: "d.showBirthDate", def: true },
];

export default function DesignSettingsEditor({
  cv,
  settings,
  onSettingsChange,
  visibility,
  onVisibilityChange,
  sectionLabels,
}) {
  const t = useT();
  const s = settings || {};
  const vis = visibility || {};
  const val = (key, def) => (s[key] === undefined ? def : s[key]);

  // Orden efectivo de secciones (usuario > recomendado de la plantilla).
  const tpl = resolveTemplate(val("template", DEFAULT_TEMPLATE_ID));
  const recommended = tpl.recommendedSectionOrder;
  const effectiveOrder = resolveSectionOrder(s.sectionOrder, recommended);
  // Etiquetas de sección solo para las claves ordenables.
  const orderLabels = {
    profile: sectionLabels.profile,
    employmentHistory: sectionLabels.employmentHistory,
    education: sectionLabels.education,
    courses: sectionLabels.courses,
    skills: sectionLabels.skills,
    languages: sectionLabels.languages,
    references: sectionLabels.references,
    projects: sectionLabels.projects,
  };

  return (
    <>
      <span className="fld-label" style={{ display: "block" }}>{t("d.template")}</span>
      <TemplateSelector
        cv={cv}
        value={val("template", "emerald-sidebar")}
        onChange={(id) => onSettingsChange({ template: id })}
      />

      <div className="row2" style={{ marginTop: 12 }}>
        <label className="fld">
          <span className="fld-label">{t("d.language")}</span>
          <select value={val("language", "es")} onChange={(e) => onSettingsChange({ language: e.target.value })}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <div />
      </div>

      <div className="row2">
        <label className="fld">
          <span className="fld-label">{t("d.pageSize")}</span>
          <select value={val("pageSize", "A4")} onChange={(e) => onSettingsChange({ pageSize: e.target.value })}>
            <option value="A4">A4</option>
            <option value="Letter">{t("d.letter")}</option>
          </select>
        </label>
        <ColorField label={t("d.sidebarColor")} value={val("sidebarColor", "#0b4f3f")} onChange={(v) => onSettingsChange({ sidebarColor: v })} />
      </div>
      <div className="row2">
        <ColorField label={t("d.accentColor")} value={val("accentColor", "#0b4f3f")} onChange={(v) => onSettingsChange({ accentColor: v })} />
        <ColorField label={t("d.textColor")} value={val("textColor", "#26302c")} onChange={(v) => onSettingsChange({ textColor: v })} />
      </div>
      <div className="row2">
        <ColorField label={t("d.headingColor")} value={val("headingColor", "#0d0f0e")} onChange={(v) => onSettingsChange({ headingColor: v })} />
        <label className="fld">
          <span className="fld-label">{t("d.bodyFont")}</span>
          <select value={val("fontFamily", "Inter")} onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}>
            {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <div className="row2">
        <label className="fld">
          <span className="fld-label">{t("d.headingFont")}</span>
          <select value={val("headingFontFamily", "Georgia")} onChange={(e) => onSettingsChange({ headingFontFamily: e.target.value })}>
            {HEADING_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <div />
      </div>

      <span className="fld-label" style={{ marginTop: 12, display: "block" }}>{t("d.templateOptions")}</span>
      <div className="vis-grid">
        {TOGGLES.map((tg) => (
          <label className="vis-check" key={tg.key}>
            <input
              type="checkbox"
              checked={Boolean(val(tg.key, tg.def))}
              onChange={(e) => onSettingsChange({ [tg.key]: e.target.checked })}
            />
            {t(tg.labelKey)}
          </label>
        ))}
      </div>

      <span className="fld-label" style={{ marginTop: 12, display: "block" }}>{t("d.sectionsVisible")}</span>
      <div className="vis-grid">
        {Object.entries(sectionLabels).map(([key, label]) => (
          <label className="vis-check" key={key}>
            <input
              type="checkbox"
              checked={vis[key] !== false}
              onChange={(e) => onVisibilityChange(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <SectionOrderEditor
          order={effectiveOrder}
          labels={orderLabels}
          visibility={vis}
          onReorder={(next) => onSettingsChange({ sectionOrder: next })}
          onReset={() => onSettingsChange({ sectionOrder: [] })}
          onUseRecommended={() =>
            onSettingsChange({ sectionOrder: resolveSectionOrder(null, recommended) })
          }
        />
      </div>
    </>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
