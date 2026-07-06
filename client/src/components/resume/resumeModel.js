import { getT, normalizeLang } from "../../i18n/translations.js";
import { getLocalizedValue } from "../../i18n/localized.js";

// Claves de sección ordenables (settings.sectionOrder).
export const SECTION_KEYS = [
  "profile",
  "employmentHistory",
  "education",
  "courses",
  "skills",
  "languages",
  "references",
  "projects",
];

export const DEFAULT_SECTION_ORDER = [...SECTION_KEYS];

// Orden efectivo: el del usuario (settings.sectionOrder) manda; si no,
// el recomendado de la plantilla; si no, el global. Se ignoran claves
// desconocidas (p. ej. "achievements") y se añaden al final las que
// falten, para no perder nunca secciones visibles.
export function resolveSectionOrder(userOrder, templateOrder) {
  const base =
    Array.isArray(userOrder) && userOrder.length
      ? userOrder
      : Array.isArray(templateOrder) && templateOrder.length
        ? templateOrder
        : DEFAULT_SECTION_ORDER;
  const known = base.filter((k) => SECTION_KEYS.includes(k));
  for (const k of DEFAULT_SECTION_ORDER) {
    if (!known.includes(k)) known.push(k);
  }
  return known;
}

// Sub-orden para plantillas con zonas (sidebar, dos columnas…):
// las claves de la zona, en el orden efectivo.
export function orderedSubset(order, zoneKeys) {
  return order.filter((k) => zoneKeys.includes(k));
}

// Modelo de datos listo para renderizar. TODA la lógica de contenido vive
// aquí (localización, visibilidad de secciones, experiencias/bullets
// ocultos, fechas). Las plantillas solo definen layout y estilos.
export function buildResumeModel(cv, languageOverride, templateOrder) {
  const s = cv.settings || {};
  const lang = normalizeLang(languageOverride || s.language);
  const t = getT(lang);
  const lz = (v) => getLocalizedValue(v, lang);
  const arr = (v) => (Array.isArray(v) ? v : []);
  const opt = (key, def = true) => (s[key] === undefined ? def : Boolean(s[key]));
  const dates = (item) => [item.startDate, item.endDate].filter(Boolean).join(" – ");
  const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

  const pi = cv.personalInfo || {};
  const det = cv.details || {};
  const vis = cv.sectionsVisibility || {};

  const jobs = arr(cv.employmentHistory)
    .filter((e) => !e.hidden)
    .map((e) => ({
      role: lz(e.role),
      company: lz(e.company),
      location: lz(e.location),
      dates: dates(e),
      bullets: arr(e.bullets)
        .filter((_, i) => !arr(e.hiddenBullets).includes(i))
        .map(lz)
        .filter(Boolean),
      achievements: arr(e.achievements).map(lz).filter(Boolean),
    }));

  return {
    lang,
    t,
    settings: s,
    opts: {
      showPhoto: opt("showPhoto"),
      compact: opt("compactMode", false),
      skillBars: opt("showSkillBars"),
      showReferences: opt("showReferences"),
      showBirthDate: opt("showBirthDate"),
      showNationality: opt("showNationality"),
      pageSize: s.pageSize || s.paperSize || "A4",
    },
    show: (key) => vis[key] !== false,

    fullName: [pi.firstName, pi.lastName].filter(Boolean).join(" "),
    photo: pi.photo || "",
    roleTitle: lz(cv.roleTitle),
    profile: lz(cv.profile),
    contact: {
      email: det.email || "",
      phone: det.phone || "",
      location: det.location || "",
      nationality: det.nationality || "",
      birth: [det.birthDate, det.birthPlace].filter(Boolean).join(", "),
    },
    links: arr(cv.links).filter((l) => l.url || l.label),
    jobs,
    education: arr(cv.education).map((ed) => ({
      degree: lz(ed.degree),
      institution: lz(ed.institution),
      location: lz(ed.location),
      dates: dates(ed),
    })),
    courses: arr(cv.courses).map((c) => ({
      name: lz(c.name),
      institution: lz(c.institution),
      dates: dates(c),
    })),
    skills: arr(cv.skills)
      .map((sk) => ({ name: lz(sk.name), level: clamp(sk.level) }))
      .filter((x) => x.name),
    languages: arr(cv.languages)
      .map((l) => ({ name: lz(l.name), level: clamp(l.level) }))
      .filter((x) => x.name),
    references: arr(cv.references).map((r) => ({
      name: r.name || "",
      role: lz(r.role),
      email: r.email || "",
      phone: r.phone || "",
    })),
    // Opcional: proyectos (Project Portfolio y plantillas que lo soporten).
    // Esquema rico y retrocompatible: technologies string o array;
    // fecha desde `date` o desde start/end.
    projects: arr(cv.projects)
      .map((p) => ({
        name: lz(p.name),
        role: lz(p.role),
        company: lz(p.company),
        description: lz(p.description),
        bullets: arr(p.bullets).map(lz).filter(Boolean),
        technologies: Array.isArray(p.technologies)
          ? p.technologies.filter(Boolean).join(", ")
          : p.technologies || "",
        url: p.url || "",
        dates: p.date || dates(p),
      }))
      .filter((p) => p.name || p.description || p.role),

    // Orden de secciones efectivo (usuario > plantilla > global).
    sectionOrder: resolveSectionOrder(s.sectionOrder, templateOrder),
  };
}
