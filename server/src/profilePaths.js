import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Raíz de datos y de perfiles.
export const DATA_DIR = path.resolve(__dirname, "../../data");
export const PROFILES_DIR = path.join(DATA_DIR, "profiles");
export const INDEX_FILE = path.join(PROFILES_DIR, "index.json");

// Rutas legacy (single-CV) para la migración.
export const LEGACY_CV_FILE = path.join(DATA_DIR, "cv.json");
export const LEGACY_VERSIONS_DIR = path.join(DATA_DIR, "versions");
export const LEGACY_BACKUP_DIR = path.join(DATA_DIR, "backups");
export const LEGACY_UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Convierte un texto en un id seguro para nombre de carpeta.
export function slugifyId(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Valida que un profileId sea seguro para rutas de archivo.
// Rechaza path traversal, separadores y caracteres peligrosos.
export function assertSafeProfileId(id) {
  if (!id || typeof id !== "string") throw new Error("profileId requerido.");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) {
    throw new Error(`profileId inválido: "${id}".`);
  }
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    throw new Error("profileId inseguro.");
  }
  // Defensa en profundidad: la ruta resuelta debe quedar dentro de PROFILES_DIR.
  const resolved = path.resolve(PROFILES_DIR, id);
  const rel = path.relative(PROFILES_DIR, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("profileId fuera del directorio de perfiles.");
  }
  return id;
}

export const profileDir = (id) => path.join(PROFILES_DIR, assertSafeProfileId(id));
export const cvFile = (id) => path.join(profileDir(id), "cv.json");
export const versionsDir = (id) => path.join(profileDir(id), "versions");
export const backupsDir = (id) => path.join(profileDir(id), "backups");
export const exportsDir = (id) => path.join(profileDir(id), "exports");
export const uploadsDir = (id) => path.join(profileDir(id), "uploads");

export function profileExists(id) {
  try {
    return fs.existsSync(cvFile(id));
  } catch {
    return false;
  }
}

// Crea todas las subcarpetas del perfil si faltan.
export function ensureProfileDirs(id) {
  fs.mkdirSync(profileDir(id), { recursive: true });
  fs.mkdirSync(versionsDir(id), { recursive: true });
  fs.mkdirSync(backupsDir(id), { recursive: true });
  fs.mkdirSync(exportsDir(id), { recursive: true });
  fs.mkdirSync(uploadsDir(id), { recursive: true });
}

// Devuelve un id único derivado de un nombre (añade sufijo si ya existe).
export function uniqueProfileId(baseName, existingIds) {
  let base = slugifyId(baseName) || "profile";
  const taken = new Set(existingIds || []);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
