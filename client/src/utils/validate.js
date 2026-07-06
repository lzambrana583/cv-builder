import { getT, DEFAULT_LANG } from "../i18n/translations.js";
import { getLocalizedValue } from "../i18n/localized.js";

// Validación básica del CV antes de guardar. Devuelve lista de errores
// en el idioma del CV (t opcional; por defecto español).
export function validateCV(cv, t = getT(DEFAULT_LANG)) {
  const errors = [];
  const pi = cv.personalInfo || {};
  const det = cv.details || {};

  if (!String(pi.firstName || "").trim() && !String(pi.lastName || "").trim()) {
    errors.push(t("val.nameRequired"));
  }

  if (det.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(det.email)) {
    errors.push(t("val.emailInvalid"));
  }

  (cv.links || []).forEach((l, i) => {
    if (l.url && !/^https?:\/\//i.test(l.url)) {
      errors.push(t("val.linkHttp", { n: i + 1 }));
    }
  });

  (cv.projects || []).forEach((p, i) => {
    if (p.url && !/^https?:\/\//i.test(p.url)) {
      errors.push(t("val.linkHttp", { n: i + 1 }));
    }
  });

  checkLevels(cv.skills, t("val.kindSkill"), errors, t);
  checkLevels(cv.languages, t("val.kindLanguage"), errors, t);

  return errors;
}

function checkLevels(items, kind, errors, t) {
  (items || []).forEach((it) => {
    const lv = Number(it.level);
    if (Number.isNaN(lv) || lv < 0 || lv > 100) {
      errors.push(t("val.levelInvalid", { kind, name: getLocalizedValue(it.name, "es") || t("val.noName") }));
    }
  });
}

// Comprobación mínima de que un JSON importado parece un CV de esta app.
export function looksLikeCV(data) {
  return (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    ("personalInfo" in data || "details" in data || "employmentHistory" in data)
  );
}
