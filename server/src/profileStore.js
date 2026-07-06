import fs from "fs";
import path from "path";
import {
  PROFILES_DIR,
  INDEX_FILE,
  LEGACY_CV_FILE,
  LEGACY_VERSIONS_DIR,
  LEGACY_BACKUP_DIR,
  LEGACY_UPLOADS_DIR,
  ensureProfileDirs,
  profileDir,
  cvFile,
  versionsDir,
  uploadsDir,
  profileExists,
  assertSafeProfileId,
  slugifyId,
  uniqueProfileId,
} from "./profilePaths.js";
import { defaultCV, readCV, countVersions } from "./cvStore.js";

// ---------- index.json ----------

function ensureIndex() {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, "[]", "utf-8");
  }
}

export function readIndex() {
  ensureIndex();
  try {
    const arr = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeIndex(entries) {
  ensureIndex();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// ---------- Helpers ----------

const lz = (v) => {
  if (v && typeof v === "object") return v.en || v.es || "";
  return v || "";
};

const displayNameFromCv = (cv) => {
  const pi = cv.personalInfo || {};
  return [pi.firstName, pi.lastName].filter(Boolean).join(" ").trim();
};

// Reescribe la ruta de la foto para que apunte al perfil dado.
function rewritePhotoPath(photo, profileId) {
  if (!photo) return "";
  const base = path.basename(String(photo));
  return `/uploads/${profileId}/${base}`;
}

// Aplica una transformación a la foto en cv.json y en todas las versiones.
function rewriteAllPhotos(profileId) {
  const files = [cvFile(profileId)];
  const vdir = versionsDir(profileId);
  if (fs.existsSync(vdir)) {
    for (const f of fs.readdirSync(vdir).filter((f) => f.endsWith(".json"))) {
      files.push(path.join(vdir, f));
    }
  }
  for (const file of files) {
    try {
      const cv = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (cv.personalInfo?.photo) {
        cv.personalInfo.photo = rewritePhotoPath(cv.personalInfo.photo, profileId);
        if (cv.metadata) cv.metadata.profileId = profileId;
        cv.profileId = profileId;
        fs.writeFileSync(file, JSON.stringify(cv, null, 2), "utf-8");
      }
    } catch { /* archivo ilegible: ignorar */ }
  }
}

function copyDirContents(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDirContents(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

// Metadata computada para las tarjetas del frontend.
function enrichEntry(entry) {
  let roleTitle = "";
  let template = "";
  let language = "";
  let versionsCount = 1;
  try {
    const cv = readCV(entry.id);
    roleTitle = lz(cv.roleTitle);
    template = cv.settings?.template || "";
    language = cv.settings?.language || "";
    versionsCount = countVersions(entry.id);
  } catch { /* perfil sin cv legible */ }
  return { ...entry, roleTitle, template, language, versionsCount };
}

// ---------- API de perfiles ----------

// Lista de perfiles activos, enriquecida. includeArchived=true incluye archivados.
export function listProfiles(includeArchived = false) {
  return readIndex()
    .filter((e) => includeArchived || e.active !== false)
    .map(enrichEntry);
}

export function getEntry(profileId) {
  return readIndex().find((e) => e.id === profileId) || null;
}

// Crea un perfil. baseCv opcional (importar / duplicar contenido).
export function createProfile({ displayName, email, baseCv, source = "manual" } = {}) {
  const index = readIndex();
  const name = String(displayName || "").trim() || "Nueva persona";
  const id = uniqueProfileId(name, index.map((e) => e.id));
  ensureProfileDirs(id);

  const now = new Date().toISOString();
  const cv = baseCv && typeof baseCv === "object" ? { ...baseCv } : defaultCV();
  // Si no viene email/nombre explícito, intentar deducir del CV.
  const cvEmail = email || cv.details?.email || "";
  cv.profileId = id;
  cv.metadata = {
    profileId: id,
    ownerName: name,
    createdAt: now,
    updatedAt: now,
    lastExportedAt: null,
    source,
  };
  cv.updatedAt = now;
  fs.writeFileSync(cvFile(id), JSON.stringify(cv, null, 2), "utf-8");
  // Normalizar foto (por si vino de otro perfil/importación).
  if (cv.personalInfo?.photo) rewriteAllPhotos(id);

  const entry = {
    id,
    displayName: name,
    email: cvEmail,
    createdAt: now,
    updatedAt: now,
    active: true,
    lastOpenedAt: now,
  };
  index.push(entry);
  writeIndex(index);
  console.log(`👤 Perfil creado: "${name}" (${id})`);
  return enrichEntry(entry);
}

export function updateEntry(profileId, patch) {
  assertSafeProfileId(profileId);
  const index = readIndex();
  const entry = index.find((e) => e.id === profileId);
  if (!entry) throw new Error(`El perfil "${profileId}" no existe.`);
  const allowed = ["displayName", "email", "active", "lastOpenedAt", "lastExportedAt"];
  for (const k of allowed) {
    if (patch[k] !== undefined) entry[k] = patch[k];
  }
  entry.updatedAt = new Date().toISOString();
  writeIndex(index);
  return enrichEntry(entry);
}

// Marca lastOpenedAt (perfil activo) sin tocar updatedAt de contenido.
export function touchOpened(profileId) {
  const index = readIndex();
  const entry = index.find((e) => e.id === profileId);
  if (!entry) return;
  entry.lastOpenedAt = new Date().toISOString();
  writeIndex(index);
}

// Refresca updatedAt/displayName/email del índice tras guardar el CV.
export function syncEntryFromCv(profileId, cv) {
  const index = readIndex();
  const entry = index.find((e) => e.id === profileId);
  if (!entry) return;
  const name = displayNameFromCv(cv);
  if (name) entry.displayName = name;
  if (cv.details?.email) entry.email = cv.details.email;
  entry.updatedAt = new Date().toISOString();
  writeIndex(index);
}

export function markExported(profileId) {
  const index = readIndex();
  const entry = index.find((e) => e.id === profileId);
  if (entry) {
    entry.lastExportedAt = new Date().toISOString();
    writeIndex(index);
  }
}

// Elimina (borra carpeta) o archiva (active:false, conserva archivos).
export function deleteProfile(profileId, { archive = false } = {}) {
  assertSafeProfileId(profileId);
  const index = readIndex();
  const idx = index.findIndex((e) => e.id === profileId);
  if (idx === -1) throw new Error(`El perfil "${profileId}" no existe.`);

  if (archive) {
    index[idx].active = false;
    index[idx].updatedAt = new Date().toISOString();
    writeIndex(index);
    console.log(`🗄️  Perfil archivado: ${profileId}`);
    return { archived: true };
  }

  index.splice(idx, 1);
  writeIndex(index);
  if (fs.existsSync(profileDir(profileId))) {
    fs.rmSync(profileDir(profileId), { recursive: true, force: true });
  }
  console.log(`🗑️  Perfil eliminado: ${profileId}`);
  return { deleted: true };
}

// Duplica un perfil completo (cv, versiones, uploads/foto, settings).
export function duplicateProfile(profileId, newName) {
  assertSafeProfileId(profileId);
  if (!profileExists(profileId)) throw new Error(`El perfil "${profileId}" no existe.`);
  const index = readIndex();
  const src = index.find((e) => e.id === profileId);
  const name = String(newName || "").trim() || `${src?.displayName || "Perfil"} (copia)`;
  const newId = uniqueProfileId(name, index.map((e) => e.id));

  ensureProfileDirs(newId);
  // Copiar cv.json, versiones y uploads (foto). Backups/exports parten limpios.
  fs.copyFileSync(cvFile(profileId), cvFile(newId));
  copyDirContents(versionsDir(profileId), versionsDir(newId));
  copyDirContents(uploadsDir(profileId), uploadsDir(newId));

  const now = new Date().toISOString();
  // Actualizar profileId/metadata en el cv.json duplicado.
  try {
    const cv = JSON.parse(fs.readFileSync(cvFile(newId), "utf-8"));
    cv.profileId = newId;
    cv.metadata = {
      ...(cv.metadata || {}),
      profileId: newId,
      ownerName: name,
      createdAt: now,
      updatedAt: now,
      source: "duplicate",
    };
    fs.writeFileSync(cvFile(newId), JSON.stringify(cv, null, 2), "utf-8");
  } catch { /* ignorar */ }
  // Reescribir rutas de foto (cv + versiones) al nuevo perfil.
  rewriteAllPhotos(newId);

  const entry = {
    id: newId,
    displayName: name,
    email: src?.email || "",
    createdAt: now,
    updatedAt: now,
    active: true,
    lastOpenedAt: now,
  };
  index.push(entry);
  writeIndex(index);
  console.log(`👥 Perfil duplicado: ${profileId} → ${newId}`);
  return enrichEntry(entry);
}

// ---------- Migración desde el esquema single-CV ----------

export function migrateLegacyIfNeeded() {
  ensureIndex();
  const index = readIndex();
  if (index.length > 0) return { migrated: false, reason: "index ya tiene perfiles" };
  if (!fs.existsSync(LEGACY_CV_FILE)) {
    return { migrated: false, reason: "no hay data/cv.json legacy" };
  }

  console.log("🔄 Migración: detectado data/cv.json legacy. Migrando al primer perfil…");
  let legacy;
  try {
    legacy = JSON.parse(fs.readFileSync(LEGACY_CV_FILE, "utf-8"));
  } catch {
    console.warn("⚠️  Migración: data/cv.json ilegible, se omite.");
    return { migrated: false, reason: "cv.json ilegible" };
  }

  const name = displayNameFromCv(legacy) || "Mi Perfil";
  const id = slugifyId(name) || "perfil-1";
  ensureProfileDirs(id);
  const now = new Date().toISOString();

  legacy.profileId = id;
  legacy.metadata = {
    profileId: id,
    ownerName: name,
    createdAt: legacy.updatedAt || now,
    updatedAt: now,
    lastExportedAt: null,
    source: "migrated",
  };
  fs.writeFileSync(cvFile(id), JSON.stringify(legacy, null, 2), "utf-8");
  console.log(`   • cv.json → data/profiles/${id}/cv.json`);

  // Mover versiones legacy.
  if (fs.existsSync(LEGACY_VERSIONS_DIR)) {
    copyDirContents(LEGACY_VERSIONS_DIR, versionsDir(id));
    const n = fs.readdirSync(LEGACY_VERSIONS_DIR).filter((f) => f.endsWith(".json")).length;
    console.log(`   • ${n} versión(es) → data/profiles/${id}/versions/`);
  }
  // Mover backups legacy.
  if (fs.existsSync(LEGACY_BACKUP_DIR)) {
    copyDirContents(LEGACY_BACKUP_DIR, path.join(profileDir(id), "backups"));
    console.log(`   • backups → data/profiles/${id}/backups/`);
  }
  // Mover uploads legacy y reescribir rutas de foto.
  if (fs.existsSync(LEGACY_UPLOADS_DIR)) {
    copyDirContents(LEGACY_UPLOADS_DIR, uploadsDir(id));
    console.log(`   • uploads → data/profiles/${id}/uploads/`);
  }
  rewriteAllPhotos(id);

  const email = legacy.details?.email || "";
  writeIndex([
    {
      id,
      displayName: name,
      email,
      createdAt: legacy.metadata.createdAt,
      updatedAt: now,
      active: true,
      lastOpenedAt: now,
    },
  ]);
  console.log(`   • index.json creado con el perfil "${name}" (${id})`);

  // No borrar el original: renombrarlo como respaldo.
  const legacyBackup = path.join(path.dirname(LEGACY_CV_FILE), "cv.legacy.backup.json");
  try {
    fs.renameSync(LEGACY_CV_FILE, legacyBackup);
    console.log("   • data/cv.json → data/cv.legacy.backup.json (conservado)");
  } catch {
    console.warn("⚠️  No se pudo renombrar data/cv.json (se conserva tal cual).");
  }

  console.log("✅ Migración completada.");
  return { migrated: true, profileId: id };
}
