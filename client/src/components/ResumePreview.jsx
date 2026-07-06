import { resolveTemplate } from "../templates/templateRegistry.js";
import { getT, normalizeLang } from "../i18n/translations.js";

// Despachador: lee cv.settings.template, busca la plantilla en el registry
// y la renderiza con las props estándar { cv, language, settings, mode }.
// Si el id no existe, cae a EmeraldSidebarTemplate (default del registry).
export default function ResumePreview({ cv, plain = false, mode }) {
  if (!cv) return null;

  const language = normalizeLang(cv.settings?.language);

  // CV sin contenido: mensaje de preview vacío (en el idioma del CV).
  if (isEmptyCV(cv)) {
    const t = getT(language);
    return <p className="preview-empty">{t("cv.empty")}</p>;
  }

  const tpl = resolveTemplate(cv.settings?.template);
  const Template = tpl.component;
  return (
    <Template
      cv={cv}
      language={language}
      settings={cv.settings || {}}
      mode={mode || (plain ? "print" : "preview")}
      templateOrder={tpl.recommendedSectionOrder}
    />
  );
}

function isEmptyCV(cv) {
  const pi = cv.personalInfo || {};
  const hasText = (v) => {
    if (v && typeof v === "object") return Boolean(String(v.en || "").trim() || String(v.es || "").trim());
    return String(v || "").trim().length > 0;
  };
  const hasItems = (v) => Array.isArray(v) && v.length > 0;
  return !(
    hasText(pi.firstName) ||
    hasText(pi.lastName) ||
    hasText(cv.roleTitle) ||
    hasText(cv.profile) ||
    hasItems(cv.employmentHistory) ||
    hasItems(cv.education) ||
    hasItems(cv.skills) ||
    hasItems(cv.languages) ||
    hasItems(cv.courses) ||
    hasItems(cv.references)
  );
}
