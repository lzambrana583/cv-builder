// Cliente HTTP. Las rutas van por el proxy de Vite hacia :4000.
// Todo el contenido de CV vive bajo /api/profiles/:profileId/...
// El id de versión ("default" o undefined = cv.json del perfil) va en ?version=.

const vq = (version) =>
  version && version !== "default" ? `?version=${encodeURIComponent(version)}` : "";

const pid = (profileId) => encodeURIComponent(profileId);
const base = (profileId) => `/api/profiles/${pid(profileId)}`;

async function errorOf(res, fallback) {
  try {
    return (await res.json()).error || fallback;
  } catch {
    return fallback;
  }
}

// ===================== Perfiles / Personas =====================

export async function listProfiles(includeArchived = false) {
  const res = await fetch(`/api/profiles${includeArchived ? "?includeArchived=true" : ""}`);
  if (!res.ok) throw new Error(await errorOf(res, "No se pudieron listar los perfiles"));
  return res.json();
}

// Crea un perfil. displayName obligatorio; cv opcional (importar / desde blank).
export async function createProfile({ displayName, email, cv, source } = {}) {
  const res = await fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, email, cv, source }),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo crear el perfil"));
  return res.json();
}

export async function updateProfile(profileId, patch) {
  const res = await fetch(base(profileId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo actualizar el perfil"));
  return res.json();
}

// mode: "delete" (borra) | "archive" (conserva, active:false)
export async function deleteProfile(profileId, mode = "delete") {
  const res = await fetch(`${base(profileId)}?mode=${mode}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo eliminar el perfil"));
  return res.json();
}

export async function duplicateProfile(profileId, name) {
  const res = await fetch(`${base(profileId)}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo duplicar el perfil"));
  return res.json();
}

// ===================== CV del perfil =====================

export async function getCV(profileId, version) {
  const res = await fetch(`${base(profileId)}/cv${vq(version)}`);
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo cargar el CV"));
  return res.json();
}

export async function saveCV(profileId, cv, version) {
  const res = await fetch(`${base(profileId)}/cv${vq(version)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cv),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo guardar el CV"));
  return res.json();
}

export async function uploadPhoto(profileId, file, version) {
  const form = new FormData();
  form.append("photo", file);
  const res = await fetch(`${base(profileId)}/upload/photo${vq(version)}`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo subir la foto"));
  return res.json();
}

// ===================== Versiones =====================

export async function listVersions(profileId) {
  const res = await fetch(`${base(profileId)}/versions`);
  if (!res.ok) throw new Error("No se pudieron listar las versiones");
  return res.json();
}

export async function createVersion(profileId, name, cv) {
  const res = await fetch(`${base(profileId)}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cv ? { name, cv } : { name }),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo crear la versión"));
  return res.json();
}

export async function deleteVersion(profileId, id) {
  const res = await fetch(`${base(profileId)}/versions/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo eliminar la versión"));
  return res.json();
}

// ===================== Backups =====================

export async function listBackups(profileId, version) {
  const res = await fetch(`${base(profileId)}/backups${vq(version)}`);
  if (!res.ok) throw new Error("No se pudieron listar los backups");
  return res.json();
}

export async function restoreBackup(profileId, version) {
  const res = await fetch(`${base(profileId)}/restore${vq(version)}`, { method: "POST" });
  if (res.status === 404) throw new Error("No hay backups disponibles");
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo restaurar el backup"));
  return res.json();
}

// ===================== Export PDF =====================

export async function exportPdf(profileId, cv, version) {
  const res = await fetch(`${base(profileId)}/export/pdf${vq(version)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cv),
  });
  if (!res.ok) throw new Error(await errorOf(res, "No se pudo generar el PDF"));

  const cd = res.headers.get("Content-Disposition") || "";
  const match = cd.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : "cv.pdf";

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return filename;
}
