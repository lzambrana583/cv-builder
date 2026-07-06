import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { exportsDir } from "./profilePaths.js";

// Imprime la ruta /print del frontend a PDF con el Chrome instalado.
// El PDF es idéntico al preview y se guarda en la carpeta del perfil.

const CLIENT_URL = process.env.CV_CLIENT_URL || "http://localhost:5173";

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : null,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

export function chromeAvailable() {
  return Boolean(findChrome());
}

const clean = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const lz = (v) => {
  if (v && typeof v === "object") return v.en || v.es || "";
  return v || "";
};

// Nombre tipo Leonardo_Zambrana_Product_Owner_CV_20260703.pdf.
// Si hay una versión con nombre, usa ese nombre en vez del roleTitle.
function buildFilename(cv, versionName = "") {
  const pi = cv?.personalInfo || {};
  const first = clean(String(pi.firstName || "").trim().split(/\s+/)[0]) || "CV";
  const last = clean(String(pi.lastName || "").trim().split(/\s+/)[0]);
  const role = clean(versionName || lz(cv?.roleTitle)).slice(0, 40);
  const now = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const parts = [first, last, role, "CV", stamp].filter(Boolean);
  // Colapsar guiones bajos repetidos (p. ej. del "|" del roleTitle).
  return parts.join("_").replace(/_+/g, "_").replace(/^_|_$/g, "") + ".pdf";
}

// Genera el PDF, lo guarda en /data/profiles/<id>/exports y devuelve
// { buffer, filename, filePath }.
export async function printCvPdf(cv, { profileId, version, versionName } = {}) {
  const executablePath = findChrome();
  if (!executablePath) {
    throw new Error("No se encontró Chrome/Edge. Define la variable CHROME_PATH.");
  }

  const outDir = exportsDir(profileId);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`🖨️  Export PDF: lanzando Chrome (${path.basename(executablePath)})…`);
  const browser = await puppeteer.launch({ executablePath, headless: true });

  try {
    const page = await browser.newPage();

    const qs = new URLSearchParams({ profile: profileId });
    if (version && version !== "default") qs.set("version", version);
    const printUrl = `${CLIENT_URL}/print?${qs.toString()}`;
    console.log(`🖨️  Export PDF: navegando a ${printUrl}…`);
    try {
      await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30000 });
    } catch (err) {
      throw new Error(
        `No se pudo abrir ${printUrl} — ¿está corriendo el frontend? (npm run dev). Detalle: ${err.message}`
      );
    }

    await page.waitForSelector(".rs-resume", { timeout: 10000 });

    const pageSize = cv?.settings?.pageSize || cv?.settings?.paperSize || "A4";
    console.log(`🖨️  Export PDF: generando ${pageSize} con printBackground…`);
    const pdf = await page.pdf({
      format: pageSize === "Letter" ? "Letter" : "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    const buffer = Buffer.from(pdf);

    const filename = buildFilename(cv, versionName);
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Export PDF: guardado en ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);

    return { buffer, filename, filePath };
  } finally {
    await browser.close();
    console.log("🖨️  Export PDF: Chrome cerrado.");
  }
}
