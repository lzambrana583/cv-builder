import fs from "fs";
import path from "path";
import {
  ensureProfileDirs,
  cvFile,
  versionsDir,
  backupsDir,
  profileExists,
  slugifyId,
} from "./profilePaths.js";

export const DEFAULT_VERSION = "default";

// Estructura base de un CV (una versión). El profileId y metadata se
// añaden al crear el perfil.
export function defaultCV() {
  return {
    personalInfo: { firstName: "", lastName: "", photo: "" },
    roleTitle: "",
    profile: "",
    details: {
      location: "",
      phone: "",
      email: "",
      nationality: "",
      birthDate: "",
      birthPlace: "",
    },
    links: [],
    skills: [],
    languages: [],
    employmentHistory: [],
    education: [],
    courses: [],
    references: [],
    projects: [],
    settings: {
      template: "emerald-sidebar",
      language: "es",
      accentColor: "#0b4f3f",
      sidebarColor: "#0b4f3f",
      textColor: "#26302c",
      headingColor: "#0d0f0e",
      fontFamily: "Inter",
      headingFontFamily: "Georgia",
      pageSize: "A4",
      showPhoto: true,
      compactMode: false,
      showSkillBars: true,
      showReferences: true,
      showBirthDate: true,
      showNationality: true,
      sectionOrder: [],
    },
    sectionsVisibility: {
      profile: true,
      details: true,
      links: true,
      skills: true,
      languages: true,
      employmentHistory: true,
      education: true,
      courses: true,
      references: true,
      projects: true,
    },
    updatedAt: null,
  };
}

export function isDefaultVersion(id) {
  return !id || id === DEFAULT_VERSION;
}

// Ruta del archivo de una versión dentro del perfil.
function fileFor(profileId, versionId) {
  if (isDefaultVersion(versionId)) return cvFile(profileId);
  const id = slugifyId(versionId);
  if (!id) throw new Error("Id de versión inválido.");
  return path.join(versionsDir(profileId), `${id}.json`);
}

export function versionExists(profileId, versionId) {
  return fs.existsSync(fileFor(profileId, versionId));
}

export function listVersions(profileId) {
  if (!profileExists(profileId)) throw new Error(`El perfil "${profileId}" no existe.`);
  ensureProfileDirs(profileId);
  const versions = [{ id: DEFAULT_VERSION, name: "Default", isDefault: true }];
  const dir = versionsDir(profileId);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const id = path.basename(f, ".json");
    let name = id;
    try {
      name = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")).versionName || id;
    } catch { /* nombre ilegible: usar el id */ }
    versions.push({ id, name, isDefault: false });
  }
  return versions;
}

export function countVersions(profileId) {
  try {
    return listVersions(profileId).length;
  } catch {
    return 1;
  }
}

export function createVersion(profileId, name, cv) {
  ensureProfileDirs(profileId);
  const id = slugifyId(name);
  if (!id) throw new Error("El nombre de la versión no es válido.");
  if (id === DEFAULT_VERSION) throw new Error('El id "default" está reservado.');
  const file = fileFor(profileId, id);
  if (fs.existsSync(file)) throw new Error(`Ya existe una versión "${id}".`);
  const payload = { ...cv, versionName: name, updatedAt: new Date().toISOString() };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf-8");
  return { id, name, cv: payload };
}

export function deleteVersion(profileId, versionId) {
  if (isDefaultVersion(versionId)) throw new Error("La versión default no se puede eliminar.");
  const file = fileFor(profileId, versionId);
  if (!fs.existsSync(file)) throw new Error("La versión no existe.");
  backupFile(profileId, "deleted", versionId);
  fs.unlinkSync(file);
}

// --- Lectura / escritura ---

export function readCV(profileId, versionId) {
  if (!profileExists(profileId)) {
    throw new Error(`El perfil "${profileId}" no existe.`);
  }
  ensureProfileDirs(profileId);
  const file = fileFor(profileId, versionId);

  if (!fs.existsSync(file)) {
    if (!isDefaultVersion(versionId)) throw new Error(`La versión "${versionId}" no existe.`);
    const seed = defaultCV();
    fs.writeFileSync(file, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }

  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    backupFile(profileId, "corrupto", versionId);
    if (!isDefaultVersion(versionId)) throw new Error(`La versión "${versionId}" está corrupta.`);
    const seed = defaultCV();
    fs.writeFileSync(file, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
}

function backupFile(profileId, tag = "", versionId) {
  const file = fileFor(profileId, versionId);
  if (!fs.existsSync(file)) return null;
  ensureProfileDirs(profileId);
  const prefix = isDefaultVersion(versionId) ? "cv" : slugifyId(versionId);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = tag ? `-${tag}` : "";
  const dest = path.join(backupsDir(profileId), `${prefix}-${stamp}${suffix}.json`);
  fs.copyFileSync(file, dest);
  return dest;
}

export function writeCV(profileId, data, versionId) {
  if (!profileExists(profileId)) {
    throw new Error(`El perfil "${profileId}" no existe.`);
  }
  ensureProfileDirs(profileId);
  if (!isDefaultVersion(versionId) && !versionExists(profileId, versionId)) {
    throw new Error(`La versión "${versionId}" no existe.`);
  }
  backupFile(profileId, "", versionId);
  const payload = { ...data, updatedAt: new Date().toISOString() };
  fs.writeFileSync(fileFor(profileId, versionId), JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export function listBackups(profileId, versionId) {
  if (!profileExists(profileId)) throw new Error(`El perfil "${profileId}" no existe.`);
  ensureProfileDirs(profileId);
  const prefix = isDefaultVersion(versionId) ? "cv-" : `${slugifyId(versionId)}-`;
  return fs
    .readdirSync(backupsDir(profileId))
    .filter((f) => f.endsWith(".json") && f.startsWith(prefix))
    .sort()
    .map((file) => ({ id: file, file }));
}

// Restaura un backup concreto (o el más reciente si no se indica id).
export function restoreBackup(profileId, versionId, backupId) {
  const backups = listBackups(profileId, versionId);
  if (!backups.length) return null;
  let chosen = backups[backups.length - 1].file;
  if (backupId) {
    const match = backups.find((b) => b.file === backupId);
    if (!match) throw new Error("El backup no existe.");
    chosen = match.file;
  }
  backupFile(profileId, "pre-restore", versionId);
  fs.copyFileSync(path.join(backupsDir(profileId), chosen), fileFor(profileId, versionId));
  return readCV(profileId, versionId);
}
