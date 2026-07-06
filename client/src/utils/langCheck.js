// Heurística ligera para avisar de mezcla de idiomas en el contenido.
// Busca palabras "marcador" del idioma contrario en campos con pinta de
// título (roleTitle, perfil, nombres de idiomas, fechas "Present/Actual"…).
// Es solo una advertencia: nunca bloquea ni traduce nada.

const ES_MARKERS = [
  "perfil", "experiencia", "laboral", "educación", "educacion", "cursos",
  "habilidades", "idiomas", "referencias", "logros", "detalles", "enlaces",
  "español", "espanol", "inglés", "ingles", "francés", "frances", "alemán",
  "portugués", "actual", "presente", "desarrollador", "ingeniero", "gerente",
  "jefe", "consultor", "analista", "universidad", "maestría", "maestria",
  "licenciatura", "nativo", "básico", "intermedio", "avanzado",
];

const EN_MARKERS = [
  "profile", "employment", "history", "education", "courses", "skills",
  "languages", "references", "achievements", "details", "links",
  "spanish", "english", "french", "german", "portuguese", "present",
  "current", "developer", "engineer", "manager", "lead", "consultant",
  "analyst", "university", "master", "bachelor", "native", "basic",
  "intermediate", "advanced",
];

function findMarkers(text, markers) {
  if (!text) return [];
  const words = String(text).toLowerCase();
  return markers.filter((m) => new RegExp(`(^|[^\\p{L}])${m}([^\\p{L}]|$)`, "u").test(words));
}

import { getLocalizedValue } from "../i18n/localized.js";

// Devuelve [{ field, words }] con los campos que mezclan idioma.
// Revisa el texto TAL COMO SE MUESTRA (idioma activo con fallback).
export function detectLanguageMismatches(cv, lang) {
  const markers = lang === "en" ? ES_MARKERS : EN_MARKERS;
  const lz = (v) => getLocalizedValue(v, lang);

  // Campos revisados: solo los que actúan como títulos/etiquetas visibles.
  const fields = [
    ["roleTitle", lz(cv.roleTitle)],
    ["languages", (cv.languages || []).map((l) => lz(l.name)).join(" ")],
    ["employmentHistory.endDate", (cv.employmentHistory || []).map((e) => e.endDate).join(" ")],
    ["details.nationality", cv.details?.nationality],
  ];

  const results = [];
  for (const [field, value] of fields) {
    const found = findMarkers(value, markers);
    if (found.length) results.push({ field, words: [...new Set(found)] });
  }
  return results;
}
