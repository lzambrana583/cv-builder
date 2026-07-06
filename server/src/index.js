import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

import {
  readCV,
  writeCV,
  defaultCV,
  listVersions,
  createVersion,
  deleteVersion,
  versionExists,
  isDefaultVersion,
  listBackups,
  restoreBackup,
} from "./cvStore.js";
import {
  listProfiles,
  getEntry,
  createProfile,
  updateEntry,
  deleteProfile,
  duplicateProfile,
  touchOpened,
  syncEntryFromCv,
  markExported,
  migrateLegacyIfNeeded,
} from "./profileStore.js";
import { assertSafeProfileId, uploadsDir, profileExists } from "./profilePaths.js";
import { buildPdf } from "./pdf.js";
import { chromeAvailable, printCvPdf } from "./pdfPrint.js";
import { photoUpload } from "./upload.js";

const PORT = process.env.CV_SERVER_PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const versionOf = (req) => req.query.version || undefined;

function sendError(res, err, fallbackMsg) {
  const notFound = /no existe/i.test(err.message);
  const bad = /inválido|inseguro|fuera del/i.test(err.message);
  const status = notFound ? 404 : bad ? 400 : 500;
  res.status(status).json({ error: err.message || fallbackMsg });
}

// --- Salud ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cv-builder-server", port: PORT });
});

// --- Servir fotos por perfil: /uploads/:profileId/:file ---
app.get("/uploads/:profileId/:file", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const file = path.basename(req.params.file); // evita traversal en el nombre
    const full = path.join(uploadsDir(id), file);
    if (!fs.existsSync(full)) return res.status(404).end();
    res.sendFile(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===================== Perfiles / Personas =====================

app.get("/api/profiles", (req, res) => {
  try {
    res.json(listProfiles(req.query.includeArchived === "true"));
  } catch (err) {
    console.error("GET /api/profiles", err.message);
    res.status(500).json({ error: "No se pudieron listar los perfiles." });
  }
});

// Crear perfil. body: { displayName, email?, cv?, source? }
app.post("/api/profiles", (req, res) => {
  try {
    const { displayName, email, cv, source } = req.body || {};
    const created = createProfile({ displayName, email, baseCv: cv, source });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/profiles", err.message);
    sendError(res, err, "No se pudo crear el perfil.");
  }
});

app.get("/api/profiles/:profileId", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const entry = getEntry(id);
    if (!entry) return res.status(404).json({ error: `El perfil "${id}" no existe.` });
    res.json(entry);
  } catch (err) {
    sendError(res, err, "No se pudo leer el perfil.");
  }
});

// Editar metadata del perfil (nombre visible, email, archivar).
app.put("/api/profiles/:profileId", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    res.json(updateEntry(id, req.body || {}));
  } catch (err) {
    console.error("PUT /api/profiles/:id", err.message);
    sendError(res, err, "No se pudo actualizar el perfil.");
  }
});

// Eliminar (?mode=delete) o archivar (?mode=archive) un perfil.
app.delete("/api/profiles/:profileId", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const archive = req.query.mode === "archive";
    res.json(deleteProfile(id, { archive }));
  } catch (err) {
    console.error("DELETE /api/profiles/:id", err.message);
    sendError(res, err, "No se pudo eliminar el perfil.");
  }
});

// Duplicar un perfil completo. body: { name? }
app.post("/api/profiles/:profileId/duplicate", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const created = duplicateProfile(id, req.body?.name);
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/profiles/:id/duplicate", err.message);
    sendError(res, err, "No se pudo duplicar el perfil.");
  }
});

// ===================== CV de un perfil =====================

app.get("/api/profiles/:profileId/cv", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const version = versionOf(req);
    const cv = readCV(id, version);
    if (isDefaultVersion(version)) touchOpened(id); // marcar como abierto
    res.json(cv);
  } catch (err) {
    console.error("GET /cv", err.message);
    sendError(res, err, "No se pudo leer el CV.");
  }
});

app.put("/api/profiles/:profileId/cv", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const data = req.body;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ error: "Cuerpo inválido: se espera un objeto CV." });
    }
    const saved = writeCV(id, data, versionOf(req));
    if (isDefaultVersion(versionOf(req))) syncEntryFromCv(id, saved);
    res.json(saved);
  } catch (err) {
    console.error("PUT /cv", err.message);
    sendError(res, err, "No se pudo guardar el CV.");
  }
});

// ===================== Versiones (por perfil) =====================

app.get("/api/profiles/:profileId/versions", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    res.json(listVersions(id));
  } catch (err) {
    sendError(res, err, "No se pudieron listar las versiones.");
  }
});

app.post("/api/profiles/:profileId/versions", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const { name, cv } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Falta el nombre de la versión." });
    }
    const base = cv && typeof cv === "object" && !Array.isArray(cv) ? cv : readCV(id);
    const created = createVersion(id, String(name).trim(), base);
    console.log(`📄 [${id}] Versión creada: "${created.name}"`);
    res.status(201).json(created);
  } catch (err) {
    const conflict = /Ya existe/i.test(err.message);
    res.status(conflict ? 409 : 400).json({ error: err.message });
  }
});

app.delete("/api/profiles/:profileId/versions/:versionId", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    deleteVersion(id, req.params.versionId);
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err, "No se pudo eliminar la versión.");
  }
});

// ===================== Backups (por perfil) =====================

app.get("/api/profiles/:profileId/backups", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    res.json(listBackups(id, versionOf(req)));
  } catch (err) {
    sendError(res, err, "No se pudieron listar los backups.");
  }
});

// Restaurar el más reciente.
app.post("/api/profiles/:profileId/restore", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const restored = restoreBackup(id, versionOf(req));
    if (!restored) return res.status(404).json({ error: "No hay backups disponibles." });
    res.json(restored);
  } catch (err) {
    sendError(res, err, "No se pudo restaurar el backup.");
  }
});

// Restaurar un backup concreto.
app.post("/api/profiles/:profileId/restore/:backupId", (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    const restored = restoreBackup(id, versionOf(req), req.params.backupId);
    if (!restored) return res.status(404).json({ error: "No hay backups disponibles." });
    res.json(restored);
  } catch (err) {
    sendError(res, err, "No se pudo restaurar el backup.");
  }
});

// ===================== Export PDF (por perfil) =====================

app.post("/api/profiles/:profileId/export/pdf", async (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    if (!profileExists(id)) return res.status(404).json({ error: `El perfil "${id}" no existe.` });
    const version = versionOf(req);
    if (!isDefaultVersion(version) && !versionExists(id, version)) {
      return res.status(404).json({ error: `La versión "${version}" no existe.` });
    }

    if (req.body && typeof req.body === "object" && !Array.isArray(req.body) && Object.keys(req.body).length) {
      writeCV(id, req.body, version);
    }

    const cv = readCV(id, version);
    const versionName = isDefaultVersion(version) ? "" : cv.versionName || version;

    if (chromeAvailable()) {
      const { buffer, filename } = await printCvPdf(cv, { profileId: id, version, versionName });
      markExported(id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(buffer);
    }

    console.warn("⚠️  Chrome no disponible: usando el generador pdfkit (diseño simple).");
    markExported(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="cv.pdf"');
    buildPdf(cv, res);
  } catch (err) {
    console.error("❌ export/pdf:", err.message);
    if (!res.headersSent) {
      const frontendDown = /No se pudo abrir/.test(err.message);
      res.status(frontendDown ? 503 : 500).json({ error: err.message });
    }
  }
});

// ===================== Subir foto (por perfil) =====================

app.post("/api/profiles/:profileId/upload/photo", photoUpload.single("photo"), (req, res) => {
  try {
    const id = assertSafeProfileId(req.params.profileId);
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo (campo 'photo')." });
    }
    const relPath = `/uploads/${id}/${req.file.filename}`;

    // Persistir la ruta en el CV de la versión activa.
    const version = versionOf(req);
    const cv = readCV(id, version);
    cv.personalInfo = cv.personalInfo || defaultCV().personalInfo;
    cv.personalInfo.photo = relPath;
    writeCV(id, cv, version);

    res.json({ path: relPath, filename: req.file.filename });
  } catch (err) {
    console.error("POST /upload/photo", err.message);
    sendError(res, err, "No se pudo subir la foto.");
  }
});

// --- Arranque: migrar legacy si hace falta, luego escuchar ---
try {
  migrateLegacyIfNeeded();
} catch (err) {
  console.error("⚠️  Error en la migración legacy:", err.message);
}

app.listen(PORT, () => {
  console.log(`✅ cv-builder-server escuchando en http://localhost:${PORT}`);
});
