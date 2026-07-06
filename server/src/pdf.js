import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { uploadsDir } from "./profilePaths.js";

// Genera un PDF a partir del CV (nuevo esquema) y lo escribe en el stream.
// Diseño básico e intencionalmente simple (la maquetación final se hará luego).
export function buildPdf(cv, stream) {
  const lz = lzOf(cv.settings?.language === "en" ? "en" : "es");
  const settings = cv.settings || {};
  const accent = settings.accentColor || "#2563eb";
  const vis = cv.sectionsVisibility || {};
  const show = (key) => vis[key] !== false;

  const doc = new PDFDocument({
    size: (settings.pageSize || settings.paperSize) === "Letter" ? "LETTER" : "A4",
    margin: 50,
  });
  doc.pipe(stream);

  const pi = cv.personalInfo || {};
  const det = cv.details || {};
  const fullName = [pi.firstName, pi.lastName].filter(Boolean).join(" ") || "Sin nombre";

  // Foto (si existe en la carpeta uploads del perfil)
  if (pi.photo && cv.profileId) {
    const file = path.join(uploadsDir(cv.profileId), path.basename(pi.photo));
    if (fs.existsSync(file)) {
      try {
        doc.image(file, doc.page.width - 50 - 64, 45, { fit: [64, 64] });
      } catch {
        // Formato no soportado por pdfkit: seguimos sin foto.
      }
    }
  }

  // Encabezado
  doc.fontSize(22).fillColor("#111").text(fullName, { width: 420 });
  if (lz(cv.roleTitle)) doc.moveDown(0.2).fontSize(12).fillColor("#555").text(lz(cv.roleTitle), { width: 420 });

  const contact = [det.email, det.phone, det.location].filter(Boolean).join("  •  ");
  if (contact) doc.moveDown(0.3).fontSize(9).fillColor("#666").text(contact, { width: 420 });

  doc.moveDown(0.6);
  hr(doc);

  // Detalles
  if (show("details")) {
    const extra = [
      det.nationality ? `Nacionalidad: ${det.nationality}` : null,
      det.birthDate ? `Nacimiento: ${[det.birthDate, det.birthPlace].filter(Boolean).join(", ")}` : null,
    ].filter(Boolean);
    if (extra.length) {
      doc.fontSize(9).fillColor("#666").text(extra.join("   •   "));
      doc.moveDown(0.4);
    }
  }

  // Enlaces
  if (show("links") && arr(cv.links).length) {
    section(doc, "Enlaces", accent);
    doc.fontSize(10).fillColor("#333").text(
      arr(cv.links).map((l) => (l.label ? `${l.label}: ${l.url}` : l.url)).filter(Boolean).join("  •  ")
    );
    doc.moveDown(0.4);
  }

  // Perfil
  if (show("profile") && lz(cv.profile)) {
    section(doc, "Perfil", accent);
    doc.fontSize(10).fillColor("#333").text(lz(cv.profile), { align: "justify" });
    doc.moveDown(0.4);
  }

  // Experiencia laboral (omite experiencias y bullets marcados como ocultos)
  const jobs = arr(cv.employmentHistory).filter((e) => !e.hidden);
  if (show("employmentHistory") && jobs.length) {
    section(doc, "Experiencia laboral", accent);
    jobs.forEach((e) => {
      const head = [lz(e.role), lz(e.company)].filter(Boolean).join(" — ") + (lz(e.location) ? `, ${lz(e.location)}` : "");
      doc.fontSize(11).fillColor("#111").text(head);
      const d = dates(e);
      if (d) doc.fontSize(8.5).fillColor("#888").text(d);
      doc.moveDown(0.15);
      const hiddenB = arr(e.hiddenBullets);
      bulletList(doc, arr(e.bullets).filter((b, i) => !hiddenB.includes(i)).map(lz).filter(Boolean));
      if (arr(e.achievements).map(lz).filter(Boolean).length) {
        doc.fontSize(9.5).fillColor("#111").text("Logros:", { continued: false });
        bulletList(doc, arr(e.achievements).map(lz).filter(Boolean));
      }
      doc.moveDown(0.4);
    });
  }

  // Educación
  if (show("education") && arr(cv.education).length) {
    section(doc, "Educación", accent);
    arr(cv.education).forEach((ed) => {
      const head = [lz(ed.degree), lz(ed.institution)].filter(Boolean).join(" — ") + (lz(ed.location) ? `, ${lz(ed.location)}` : "");
      doc.fontSize(11).fillColor("#111").text(head);
      const d = dates(ed);
      if (d) doc.fontSize(8.5).fillColor("#888").text(d);
      doc.moveDown(0.35);
    });
  }

  // Cursos
  if (show("courses") && arr(cv.courses).length) {
    section(doc, "Cursos", accent);
    arr(cv.courses).forEach((c) => {
      const head = [lz(c.name), lz(c.institution)].filter(Boolean).join(" — ");
      const d = dates(c);
      doc.fontSize(10).fillColor("#333").text(head + (d ? `  (${d})` : ""));
      doc.moveDown(0.2);
    });
    doc.moveDown(0.2);
  }

  // Habilidades (con barras de nivel)
  if (show("skills") && arr(cv.skills).length) {
    section(doc, "Habilidades", accent);
    levelGrid(doc, arr(cv.skills).map((it) => ({ ...it, name: lz(it.name) })), accent);
  }

  // Idiomas (con barras de nivel)
  if (show("languages") && arr(cv.languages).length) {
    section(doc, "Idiomas", accent);
    levelGrid(doc, arr(cv.languages).map((it) => ({ ...it, name: lz(it.name) })), accent);
  }

  // Referencias
  if (show("references") && arr(cv.references).length) {
    section(doc, "Referencias", accent);
    arr(cv.references).forEach((r) => {
      doc.fontSize(10).fillColor("#111").text(r.name || "");
      const line = [lz(r.role), r.email, r.phone].filter(Boolean).join("  •  ");
      if (line) doc.fontSize(9).fillColor("#666").text(line);
      doc.moveDown(0.3);
    });
  }

  doc.end();
}

// --- Helpers ---

function section(doc, title, accent) {
  ensureSpace(doc, 40);
  doc.moveDown(0.3).fontSize(13).fillColor(accent).text(title.toUpperCase());
  doc.moveDown(0.2);
}

function hr(doc) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.moveDown(0.5);
}

function bulletList(doc, items) {
  items.filter(Boolean).forEach((b) => {
    doc.fontSize(9.5).fillColor("#333").text(`•  ${b}`, { indent: 8 });
  });
}

// Dibuja pares nombre + barra de nivel en dos columnas.
function levelGrid(doc, items, accent) {
  const left = doc.page.margins.left;
  const usable = doc.page.width - left - doc.page.margins.right;
  const colW = usable / 2;
  const barW = 70;
  const rowH = 16;

  items
    .filter((it) => it && it.name)
    .forEach((it, i) => {
      const col = i % 2;
      if (col === 0) ensureSpace(doc, rowH);
      const x = left + col * colW;
      const y = doc.y;
      const pct = Math.max(0, Math.min(100, Number(it.level) || 0)) / 100;

      doc.fontSize(9.5).fillColor("#333").text(it.name, x, y, {
        width: colW - barW - 16,
        lineBreak: false,
        ellipsis: true,
      });
      const barX = x + colW - barW - 8;
      const barY = y + 3;
      doc.rect(barX, barY, barW, 5).fill("#e5e7eb");
      if (pct > 0) doc.rect(barX, barY, barW * pct, 5).fill(accent);

      // Avanzar de fila solo tras la segunda columna (o el último elemento).
      doc.y = col === 1 ? y + rowH : y;
      if (col === 0) doc.y = y; // seguimos en la misma fila para la col. derecha
    });

  // Si terminó en columna izquierda, bajar la fila pendiente.
  const visible = items.filter((it) => it && it.name).length;
  if (visible % 2 === 1) doc.y += rowH;
  doc.x = left;
  doc.moveDown(0.4);
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function dates(item) {
  return [item.startDate, item.endDate].filter(Boolean).join(" – ");
}

function arr(v) {
  return Array.isArray(v) ? v : [];
}

// Campos bilingües { en, es }: texto del idioma activo con fallback.
function lzOf(lang) {
  return (v) => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    const primary = v[lang];
    if (primary != null && String(primary).trim()) return primary;
    return v[lang === "en" ? "es" : "en"] || "";
  };
}
