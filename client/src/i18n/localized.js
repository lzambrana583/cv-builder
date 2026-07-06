// Helpers de contenido bilingüe. Un "campo localizado" tiene la forma
// { en: string, es: string }. Por compatibilidad, un string legacy se
// interpreta como { en: "valor anterior", es: "" }.

export const CONTENT_LANGS = ["en", "es"];

export function isLocalized(value) {
  return (
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("en" in value || "es" in value)
  );
}

// Normaliza cualquier valor (string legacy, objeto parcial, null) a { en, es }.
export function normalizeLocalizedField(value) {
  if (isLocalized(value)) {
    return { en: String(value.en ?? ""), es: String(value.es ?? "") };
  }
  return { en: typeof value === "string" ? value : "", es: "" };
}

// Texto a mostrar: idioma activo, con fallback al otro idioma.
export function getLocalizedValue(value, language, fallbackLanguage) {
  const n = normalizeLocalizedField(value);
  const primary = n[language === "en" ? "en" : "es"];
  if (String(primary).trim()) return primary;
  const fb = fallbackLanguage || (language === "en" ? "es" : "en");
  return n[fb] || "";
}

// ¿El idioma activo está vacío pero el otro tiene contenido? (→ fallback)
export function usesFallback(value, language) {
  const n = normalizeLocalizedField(value);
  const lang = language === "en" ? "en" : "es";
  const other = lang === "en" ? "es" : "en";
  return !String(n[lang]).trim() && Boolean(String(n[other]).trim());
}

// Devuelve una copia del campo con el texto escrito en el idioma dado.
export function setLocalizedValue(value, language, text) {
  const n = normalizeLocalizedField(value);
  return { ...n, [language === "en" ? "en" : "es"]: text };
}

// Aplica fn a todos los campos localizados del CV (inmutable).
export function mapLocalizedFields(cv, fn) {
  const mapArr = (arr, mapper) => (Array.isArray(arr) ? arr.map(mapper) : arr);
  return {
    ...cv,
    roleTitle: fn(cv.roleTitle),
    profile: fn(cv.profile),
    employmentHistory: mapArr(cv.employmentHistory, (e) => ({
      ...e,
      role: fn(e.role),
      company: fn(e.company),
      location: fn(e.location),
      bullets: mapArr(e.bullets, fn),
      achievements: mapArr(e.achievements, fn),
    })),
    education: mapArr(cv.education, (ed) => ({
      ...ed,
      degree: fn(ed.degree),
      institution: fn(ed.institution),
      location: fn(ed.location),
    })),
    courses: mapArr(cv.courses, (c) => ({
      ...c,
      name: fn(c.name),
      institution: fn(c.institution),
    })),
    references: mapArr(cv.references, (r) => ({ ...r, role: fn(r.role) })),
    skills: mapArr(cv.skills, (s) => ({ ...s, name: fn(s.name) })),
    languages: mapArr(cv.languages, (l) => ({ ...l, name: fn(l.name) })),
    ...(cv.projects
      ? {
          projects: mapArr(cv.projects, (p) => ({
            ...p,
            name: fn(p.name),
            description: fn(p.description),
          })),
        }
      : {}),
  };
}

// Migra un CV completo al formato bilingüe (strings → { en, es }).
export function normalizeCvLanguageFields(cv) {
  return mapLocalizedFields(cv, normalizeLocalizedField);
}

// Copia el texto de un idioma al otro en los campos donde el destino
// esté vacío. No traduce: duplica para editar manualmente.
export function duplicateLocalizedContent(cv, from, to) {
  return mapLocalizedFields(cv, (v) => {
    const n = normalizeLocalizedField(v);
    if (!String(n[to]).trim() && String(n[from]).trim()) n[to] = n[from];
    return n;
  });
}

// Cuenta los campos que usan fallback en el idioma dado (para avisar).
export function countMissingLocalized(cv, language) {
  let count = 0;
  mapLocalizedFields(cv, (v) => {
    if (usesFallback(v, language)) count += 1;
    return v;
  });
  return count;
}
