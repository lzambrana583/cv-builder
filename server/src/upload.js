import fs from "fs";
import path from "path";
import multer from "multer";
import { uploadsDir, assertSafeProfileId } from "./profilePaths.js";

// Almacena la foto dentro de la carpeta uploads del perfil de la ruta
// (/api/profiles/:profileId/upload/photo). Valida el profileId.
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const id = assertSafeProfileId(req.params.profileId);
      const dir = uploadsDir(id);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `photo-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Solo se permiten imágenes."));
}

export const photoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
