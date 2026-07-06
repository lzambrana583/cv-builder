import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCV,
  saveCV,
  uploadPhoto,
  exportPdf,
  listBackups,
  restoreBackup,
  listVersions,
  createVersion,
  deleteVersion,
  listProfiles,
  createProfile,
} from "../api.js";
import ProfileSwitcher from "../components/profiles/ProfileSwitcher.jsx";
import ResumePreviewFrame from "../components/preview/ResumePreviewFrame.jsx";
import AppSidebar from "../components/layout/AppSidebar.jsx";
import {
  Save, FileDown, Upload, Download, History, Eye, ExternalLink,
  Moon, Sun, Plus, Copy, Trash2, GitBranch,
} from "lucide-react";
import { validateCV, looksLikeCV } from "../utils/validate.js";
import { detectLanguageMismatches } from "../utils/langCheck.js";
import { getT, normalizeLang, DEFAULT_LANG } from "../i18n/translations.js";
import { LangProvider } from "../i18n/LangContext.jsx";
import {
  normalizeLocalizedField,
  normalizeCvLanguageFields,
  setLocalizedValue,
  usesFallback,
  duplicateLocalizedContent,
  countMissingLocalized,
} from "../i18n/localized.js";
import ContentLangSwitch from "../components/editor/ContentLangSwitch.jsx";
import ResumePreview from "../components/ResumePreview.jsx";
import Toasts from "../components/Toasts.jsx";
import TextInput from "../components/inputs/TextInput.jsx";
import TextArea from "../components/inputs/TextArea.jsx";
import SectionEditor from "../components/editor/SectionEditor.jsx";
import ListEditor from "../components/editor/ListEditor.jsx";
import SkillEditor from "../components/editor/SkillEditor.jsx";
import ExperienceEditor, { BulletsEditor } from "../components/editor/ExperienceEditor.jsx";
import DesignSettingsEditor from "../components/editor/DesignSettingsEditor.jsx";

const PROFILE_KEY = "cv-builder-profile";
const versionKey = (profile) => `cv-builder-version:${profile || ""}`;
const draftKey = (profile, version) => `cv-builder-draft:${profile || ""}:${version || "default"}`;

const TAB_IDS = [
  "personal",
  "profile",
  "employment",
  "education",
  "courses",
  "skills",
  "languages",
  "projects",
  "references",
  "design",
];

export default function Editor() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState("");
  const [cv, setCv] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [tab, setTab] = useState("personal");
  const [statusKey, setStatusKey] = useState("st.loading");
  const [errors, setErrors] = useState([]);
  const [hasBackups, setHasBackups] = useState(false);
  const [versions, setVersions] = useState([{ id: "default", name: "Default", isDefault: true }]);
  const [version, setVersion] = useState("default");
  const [toasts, setToasts] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cv-builder-theme") === "dark");
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState("");
  const [contentLang, setContentLang] = useState(null); // null = seguir settings.language
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("cv-builder-sidebar") === "1");
  const importRef = useRef(null);
  const dirtyRef = useRef(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem("cv-builder-sidebar", next ? "1" : "0");
      return next;
    });
  };

  // Idioma del CV activo → traduce editor y preview a la vez.
  const lang = normalizeLang(cv?.settings?.language || DEFAULT_LANG);
  const t = getT(lang);

  // Recordar el idioma de la UI para la landing (/) y otras pantallas.
  useEffect(() => {
    if (cv?.settings?.language) localStorage.setItem("cv-builder-uilang", lang);
  }, [lang, cv]);

  // --- Toasts ---
  const toast = (text, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, text, type }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  };
  const dismissToast = (id) => setToasts((ts) => ts.filter((x) => x.id !== id));

  // Confirmación del navegador antes de salir con cambios sin guardar.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Escape cierra el preview a pantalla completa.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // Modo oscuro: solo el chrome de la app (los CV tienen colores fijos).
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.dataset.theme = "dark";
      localStorage.setItem("cv-builder-theme", "dark");
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.setItem("cv-builder-theme", "light");
    }
  };

  // Carga un CV (perfil + versión) + su borrador local si existe.
  const loadVersion = (prof, ver) => {
    setStatusKey("st.loading");
    setErrors([]);
    getCV(prof, ver)
      .then((raw) => {
        // Migración transparente al formato bilingüe ({ en, es }).
        const server = normalizeCvLanguageFields(raw);
        let draft = null;
        try { draft = JSON.parse(localStorage.getItem(draftKey(prof, ver))); } catch { /* borrador corrupto */ }
        setLastSaved(server);
        if (draft && looksLikeCV(draft) && JSON.stringify(normalizeCvLanguageFields(draft)) !== JSON.stringify(server)) {
          setCv(normalizeCvLanguageFields(draft));
          setStatusKey("st.draftRecovered");
        } else {
          setCv(server);
          setStatusKey("st.ready");
        }
      })
      .catch((e) => {
        if (ver !== "default") return switchVersion("default");
        setStatusKey("st.error");
        toast(e.message, "error");
      });
    listBackups(prof, ver).then((b) => setHasBackups(b.length > 0)).catch(() => {});
  };

  const refreshVersions = (prof) => listVersions(prof).then(setVersions).catch(() => {});

  const switchVersion = (ver) => {
    localStorage.setItem(versionKey(profile), ver);
    setVersion(ver);
    loadVersion(profile, ver);
  };

  // Cambiar de persona activa: carga su CV y sus versiones.
  const switchProfile = (prof) => {
    if (!prof || prof === profile) return;
    localStorage.setItem(PROFILE_KEY, prof);
    setProfile(prof);
    const ver = localStorage.getItem(versionKey(prof)) || "default";
    setVersion(ver);
    refreshVersions(prof);
    loadVersion(prof, ver);
  };

  // Carga inicial: resolver perfiles y perfil activo.
  useEffect(() => {
    listProfiles()
      .then((list) => {
        setProfiles(list);
        if (!list.length) {
          navigate("/profiles");
          return;
        }
        const stored = localStorage.getItem(PROFILE_KEY);
        const active = list.find((p) => p.id === stored) ? stored : list[0].id;
        localStorage.setItem(PROFILE_KEY, active);
        setProfile(active);
        const ver = localStorage.getItem(versionKey(active)) || "default";
        setVersion(ver);
        refreshVersions(active);
        loadVersion(active, ver);
      })
      .catch((e) => {
        setStatusKey("st.error");
        toast(e.message, "error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save local (por perfil+versión) mientras haya cambios sin guardar.
  useEffect(() => {
    if (!cv || !lastSaved || !profile) return;
    if (JSON.stringify(cv) !== JSON.stringify(lastSaved)) {
      localStorage.setItem(draftKey(profile, version), JSON.stringify(cv));
    }
  }, [cv, lastSaved, version, profile]);

  if (!cv) return <div className="app"><p style={{ padding: 24 }}>{t(statusKey)}</p></div>;

  const dirty = JSON.stringify(cv) !== JSON.stringify(lastSaved);
  dirtyRef.current = dirty;

  // Validación visual de campos requeridos (tras el primer intento de guardar).
  const pi0 = cv.personalInfo || {};
  const fieldErrors = showFieldErrors
    ? {
        name:
          !String(pi0.firstName || "").trim() && !String(pi0.lastName || "").trim()
            ? t("val.nameFieldRequired")
            : null,
        email:
          cv.details?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.details.email)
            ? t("val.emailFieldInvalid")
            : null,
      }
    : {};

  // Advertencia de coherencia de idioma (contenido vs settings.language).
  const warnKey = `${version}:${lang}`;
  const langWarnings = warnDismissed === warnKey ? [] : detectLanguageMismatches(cv, lang);

  // --- Contenido bilingüe ---
  // Idioma de contenido en edición (por defecto sigue al idioma del CV).
  const cLang = contentLang || lang;
  const lval = (v) => normalizeLocalizedField(v)[cLang];
  const lfb = (v) => (usesFallback(v, cLang) ? normalizeLocalizedField(v)[cLang === "en" ? "es" : "en"] : "");
  // Props estándar para un input bilingüe: valor del idioma activo,
  // fallback como placeholder y aviso visual si falta la traducción.
  const lprops = (value, onSet) => ({
    value: lval(value),
    placeholder: lfb(value) || undefined,
    warn: usesFallback(value, cLang),
    warnTitle: t("lz.missingHint"),
    onChange: (text) => onSet(setLocalizedValue(value, cLang, text)),
  });
  const langSwitch = <ContentLangSwitch value={cLang} onChange={setContentLang} />;

  // Campos que el preview resuelve por fallback (falta el idioma activo).
  const missingCount = countMissingLocalized(cv, lang);

  const onDuplicateContent = (from, to) => {
    const candidates = countMissingLocalized(cv, to);
    if (!candidates) {
      toast(t("lz.nothingToDuplicate"), "info");
      return;
    }
    setCv(duplicateLocalizedContent(cv, from, to));
    toast(t("lz.duplicated", { n: candidates }));
  };

  // Títulos de sección para el grid de visibilidad (Design).
  const sectionLabels = {
    profile: t("cv.profile"),
    details: t("cv.details"),
    links: t("cv.links"),
    skills: t("cv.skills"),
    languages: t("cv.languages"),
    employmentHistory: t("cv.employment"),
    education: t("cv.education"),
    courses: t("cv.courses"),
    projects: t("cv.projects"),
    references: t("cv.references"),
  };

  // --- Helpers de estado ---
  const set = (patch) => setCv({ ...cv, ...patch });
  const setObj = (key, patch) => set({ [key]: { ...(cv[key] || {}), ...patch } });
  const list = (key) => (Array.isArray(cv[key]) ? cv[key] : []);
  const addItem = (key, item) => set({ [key]: [...list(key), item] });
  const updateItem = (key, i, patch) =>
    set({ [key]: list(key).map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const removeItem = (key, i) => set({ [key]: list(key).filter((_, idx) => idx !== i) });
  const moveItem = (key, from, to) => {
    const l = [...list(key)];
    const [it] = l.splice(from, 1);
    l.splice(to, 0, it);
    set({ [key]: l });
  };
  const duplicateItem = (key, i) => {
    const l = [...list(key)];
    l.splice(i + 1, 0, JSON.parse(JSON.stringify(l[i])));
    set({ [key]: l });
  };
  const setVis = (key, value) => setObj("sectionsVisibility", { [key]: value });

  const pi = cv.personalInfo || {};
  const det = cv.details || {};
  const vis = cv.sectionsVisibility || {};

  // --- Acciones de la barra ---
  const onSave = async () => {
    const errs = validateCV(cv, t);
    setErrors(errs);
    setShowFieldErrors(true);
    if (errs.length) {
      setStatusKey("st.fixErrors");
      toast(t("ts.validationPending"), "error");
      return;
    }
    setStatusKey("st.saving");
    try {
      const saved = await saveCV(profile, cv, version);
      setCv(saved);
      setLastSaved(saved);
      localStorage.removeItem(draftKey(profile, version));
      setHasBackups(true);
      setShowFieldErrors(false);
      setStatusKey("st.saved");
      toast(t("ts.saved"));
      listProfiles().then(setProfiles).catch(() => {}); // refrescar nombre/fecha
    } catch (e) {
      setStatusKey("st.error");
      toast(t("ts.saveError") + ": " + e.message, "error");
    }
  };

  const onExportPdf = async () => {
    setStatusKey("st.generatingPdf");
    toast(t("ts.generatingPdf"), "info");
    try {
      const filename = await exportPdf(profile, cv, version);
      setStatusKey("st.pdfExported");
      toast(`${t("ts.pdfExported")}: ${filename}`);
    } catch (e) {
      setStatusKey("st.error");
      toast(t("ts.exportError") + ": " + e.message, "error");
    }
  };

  // --- Acciones de versiones ---
  const onNewVersion = async () => {
    const name = window.prompt(t("pr.newVersion"));
    if (!name || !name.trim()) return;
    try {
      const created = await createVersion(profile, name.trim());
      await refreshVersions(profile);
      switchVersion(created.id);
      toast(`${t("ts.versionCreated")}: "${created.name}"`);
    } catch (e) {
      toast(t("ts.versionError") + ": " + e.message, "error");
    }
  };

  const onDuplicateVersion = async () => {
    const current = versions.find((v) => v.id === version);
    const name = window.prompt(t("pr.copyName"), `${current?.name || "CV"} ${t("pr.copySuffix")}`);
    if (!name || !name.trim()) return;
    try {
      // Duplica el estado actual del editor (incluye cambios sin guardar).
      const created = await createVersion(profile, name.trim(), cv);
      await refreshVersions(profile);
      switchVersion(created.id);
      toast(`${t("ts.versionDuplicated")}: "${created.name}"`);
    } catch (e) {
      toast(t("ts.versionError") + ": " + e.message, "error");
    }
  };

  const onDeleteVersion = async () => {
    if (version === "default") return;
    if (!window.confirm(t("cf.deleteVersion"))) return;
    try {
      await deleteVersion(profile, version);
      localStorage.removeItem(draftKey(profile, version));
      await refreshVersions(profile);
      switchVersion("default");
      toast(t("ts.versionDeleted"));
    } catch (e) {
      toast(t("ts.versionError") + ": " + e.message, "error");
    }
  };

  const onImportJson = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permitir re-importar el mismo archivo
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!looksLikeCV(data)) throw new Error(t("val.importNotCV"));
        setCv(normalizeCvLanguageFields(data));
        setErrors([]);
        setStatusKey("st.jsonImported");
        toast(t("ts.jsonImported"), "info");
      } catch (err) {
        setStatusKey("st.error");
        toast(t("ts.importError") + ": " + err.message, "error");
      }
    };
    reader.readAsText(file);
  };

  const onExportJson = () => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatusKey("st.jsonExported");
    toast(t("ts.jsonExported"));
  };

  const onRestoreBackup = async () => {
    if (!window.confirm(t("cf.restore"))) return;
    setStatusKey("st.restoring");
    try {
      const restored = normalizeCvLanguageFields(await restoreBackup(profile, version));
      setCv(restored);
      setLastSaved(restored);
      localStorage.removeItem(draftKey(profile, version));
      setErrors([]);
      setStatusKey("st.restored");
      toast(t("ts.restored"));
    } catch (e) {
      setStatusKey("st.error");
      toast(t("ts.restoreError") + ": " + e.message, "error");
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusKey("st.uploadingPhoto");
    try {
      const { path } = await uploadPhoto(profile, file, version);
      setObj("personalInfo", { photo: path });
      setStatusKey("st.photoUploaded");
      toast(t("ts.photoUploaded"));
    } catch (err) {
      setStatusKey("st.error");
      toast(t("ts.photoError") + ": " + err.message, "error");
    }
  };

  // --- Contenido de cada tab ---
  const renderTab = () => {
    switch (tab) {
      case "personal":
        return (
          <>
            <SectionEditor title={t("sec.personalInfo")} actions={langSwitch}>
              <div className="photo-row">
                {pi.photo ? <img className="photo-thumb" src={pi.photo} alt={t("f.photo")} /> : <div className="photo-thumb photo-thumb--empty">{t("f.noPhoto")}</div>}
                <label className="fld">
                  <span className="fld-label">{t("f.photo")}</span>
                  <input type="file" accept="image/*" onChange={onPhoto} />
                </label>
              </div>
              <div className="row2">
                <TextInput label={t("f.firstName")} value={pi.firstName} error={fieldErrors.name} onChange={(v) => setObj("personalInfo", { firstName: v })} />
                <TextInput label={t("f.lastName")} value={pi.lastName} error={fieldErrors.name} onChange={(v) => setObj("personalInfo", { lastName: v })} />
              </div>
              <TextInput label={t("f.roleTitle")} {...lprops(cv.roleTitle, (nv) => set({ roleTitle: nv }))} />
            </SectionEditor>

            <SectionEditor title={t("cv.details")} visible={vis.details} onToggleVisible={(v) => setVis("details", v)}>
              <div className="row2">
                <TextInput label={t("f.email")} value={det.email} error={fieldErrors.email} onChange={(v) => setObj("details", { email: v })} />
                <TextInput label={t("f.phone")} value={det.phone} onChange={(v) => setObj("details", { phone: v })} />
              </div>
              <TextInput label={t("f.location")} value={det.location} onChange={(v) => setObj("details", { location: v })} />
              <div className="row2">
                <TextInput label={t("f.nationality")} value={det.nationality} onChange={(v) => setObj("details", { nationality: v })} />
                <TextInput label={t("f.birthDate")} value={det.birthDate} onChange={(v) => setObj("details", { birthDate: v })} />
              </div>
              <TextInput label={t("f.birthPlace")} value={det.birthPlace} onChange={(v) => setObj("details", { birthPlace: v })} />
            </SectionEditor>

            <SectionEditor title={t("cv.links")} visible={vis.links} onToggleVisible={(v) => setVis("links", v)}>
              <ListEditor
                items={list("links")}
                addLabel={t("btn.addLink")}
                emptyText={t("empty.links")}
                onAdd={() => addItem("links", { label: "", url: "" })}
                onRemove={(i) => removeItem("links", i)}
                renderItem={(l, i) => (
                  <div className="row2">
                    <TextInput label={t("f.label")} value={l.label} onChange={(v) => updateItem("links", i, { label: v })} />
                    <TextInput label={t("f.url")} value={l.url} placeholder={t("ph.url")} onChange={(v) => updateItem("links", i, { url: v })} />
                  </div>
                )}
              />
            </SectionEditor>
          </>
        );

      case "profile":
        return (
          <SectionEditor title={t("cv.profile")} visible={vis.profile} onToggleVisible={(v) => setVis("profile", v)} actions={langSwitch}>
            <TextArea
              label={t("f.profileSummary")}
              rows={10}
              value={lval(cv.profile)}
              onChange={(v) => set({ profile: setLocalizedValue(cv.profile, cLang, v) })}
              placeholder={lfb(cv.profile) || t("ph.profile")}
              warn={usesFallback(cv.profile, cLang)}
              warnTitle={t("lz.missingHint")}
            />
          </SectionEditor>
        );

      case "employment":
        return (
          <SectionEditor title={t("cv.employment")} visible={vis.employmentHistory} onToggleVisible={(v) => setVis("employmentHistory", v)} actions={langSwitch}>
            <ListEditor
              items={list("employmentHistory")}
              addLabel={t("btn.addExperience")}
              emptyText={t("empty.experience")}
              onAdd={() => addItem("employmentHistory", { role: { en: "", es: "" }, company: { en: "", es: "" }, location: { en: "", es: "" }, startDate: "", endDate: "", bullets: [], achievements: [], hidden: false })}
              onRemove={(i) => removeItem("employmentHistory", i)}
              onReorder={(from, to) => moveItem("employmentHistory", from, to)}
              itemClassName={(e) => (e.hidden ? "list-item--hidden" : "")}
              itemActions={(e, i) => (
                <>
                  <button
                    type="button"
                    className="icon-btn"
                    title={e.hidden ? t("a.showInCV") : t("a.hideFromCV")}
                    onClick={() => updateItem("employmentHistory", i, { hidden: !e.hidden })}
                  >
                    {e.hidden ? "🚫" : "👁"}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title={t("a.duplicateExp")}
                    onClick={() => duplicateItem("employmentHistory", i)}
                  >
                    ⧉
                  </button>
                </>
              )}
              renderItem={(e, i) => (
                <ExperienceEditor item={e} contentLang={cLang} onChange={(patch) => updateItem("employmentHistory", i, patch)} />
              )}
            />
          </SectionEditor>
        );

      case "education":
        return (
          <SectionEditor title={t("cv.education")} visible={vis.education} onToggleVisible={(v) => setVis("education", v)} actions={langSwitch}>
            <ListEditor
              items={list("education")}
              addLabel={t("btn.addEducation")}
              emptyText={t("empty.education")}
              onAdd={() => addItem("education", { degree: { en: "", es: "" }, institution: { en: "", es: "" }, location: { en: "", es: "" }, startDate: "", endDate: "" })}
              onRemove={(i) => removeItem("education", i)}
              onReorder={(from, to) => moveItem("education", from, to)}
              renderItem={(ed, i) => (
                <>
                  <TextInput label={t("f.degree")} {...lprops(ed.degree, (nv) => updateItem("education", i, { degree: nv }))} />
                  <div className="row2">
                    <TextInput label={t("f.institution")} {...lprops(ed.institution, (nv) => updateItem("education", i, { institution: nv }))} />
                    <TextInput label={t("f.location")} {...lprops(ed.location, (nv) => updateItem("education", i, { location: nv }))} />
                  </div>
                  <div className="row2">
                    <TextInput label={t("f.start")} value={ed.startDate} onChange={(v) => updateItem("education", i, { startDate: v })} />
                    <TextInput label={t("f.end")} value={ed.endDate} onChange={(v) => updateItem("education", i, { endDate: v })} />
                  </div>
                </>
              )}
            />
          </SectionEditor>
        );

      case "courses":
        return (
          <SectionEditor title={t("cv.courses")} visible={vis.courses} onToggleVisible={(v) => setVis("courses", v)} actions={langSwitch}>
            <ListEditor
              items={list("courses")}
              addLabel={t("btn.addCourse")}
              emptyText={t("empty.courses")}
              onAdd={() => addItem("courses", { name: { en: "", es: "" }, institution: { en: "", es: "" }, startDate: "", endDate: "" })}
              onRemove={(i) => removeItem("courses", i)}
              onReorder={(from, to) => moveItem("courses", from, to)}
              renderItem={(c, i) => (
                <>
                  <TextInput label={t("f.name")} {...lprops(c.name, (nv) => updateItem("courses", i, { name: nv }))} />
                  <div className="row2">
                    <TextInput label={t("f.institution")} {...lprops(c.institution, (nv) => updateItem("courses", i, { institution: nv }))} />
                    <div className="row2">
                      <TextInput label={t("f.start")} value={c.startDate} onChange={(v) => updateItem("courses", i, { startDate: v })} />
                      <TextInput label={t("f.end")} value={c.endDate} onChange={(v) => updateItem("courses", i, { endDate: v })} />
                    </div>
                  </div>
                </>
              )}
            />
          </SectionEditor>
        );

      case "skills":
        return (
          <SectionEditor title={t("cv.skills")} visible={vis.skills} onToggleVisible={(v) => setVis("skills", v)} actions={langSwitch}>
            <ListEditor
              items={list("skills")}
              addLabel={t("btn.addSkill")}
              emptyText={t("empty.skills")}
              onAdd={() => addItem("skills", { name: { en: "", es: "" }, level: 80 })}
              onRemove={(i) => removeItem("skills", i)}
              onReorder={(from, to) => moveItem("skills", from, to)}
              renderItem={(s, i) => (
                <SkillEditor item={{ name: lval(s.name), level: s.level }} namePlaceholder={lfb(s.name) || t("ph.skill")} onChange={(patch) => updateItem("skills", i, patch.name !== undefined ? { name: setLocalizedValue(s.name, cLang, patch.name) } : patch)} />
              )}
            />
          </SectionEditor>
        );

      case "languages":
        return (
          <SectionEditor title={t("cv.languages")} visible={vis.languages} onToggleVisible={(v) => setVis("languages", v)} actions={langSwitch}>
            <ListEditor
              items={list("languages")}
              addLabel={t("btn.addLanguage")}
              emptyText={t("empty.languages")}
              onAdd={() => addItem("languages", { name: { en: "", es: "" }, level: 80 })}
              onRemove={(i) => removeItem("languages", i)}
              onReorder={(from, to) => moveItem("languages", from, to)}
              renderItem={(l, i) => (
                <SkillEditor item={{ name: lval(l.name), level: l.level }} namePlaceholder={lfb(l.name) || t("ph.language")} onChange={(patch) => updateItem("languages", i, patch.name !== undefined ? { name: setLocalizedValue(l.name, cLang, patch.name) } : patch)} />
              )}
            />
          </SectionEditor>
        );

      case "projects":
        return (
          <SectionEditor title={t("cv.projects")} visible={vis.projects} onToggleVisible={(v) => setVis("projects", v)} actions={langSwitch}>
            <ListEditor
              items={list("projects")}
              addLabel={t("btn.addProject")}
              emptyText={t("empty.projects")}
              onAdd={() => addItem("projects", { name: { en: "", es: "" }, role: { en: "", es: "" }, company: { en: "", es: "" }, date: "", description: { en: "", es: "" }, bullets: [], technologies: "", url: "" })}
              onRemove={(i) => removeItem("projects", i)}
              onReorder={(from, to) => moveItem("projects", from, to)}
              renderItem={(p, i) => (
                <>
                  <TextInput label={t("f.name")} {...lprops(p.name, (nv) => updateItem("projects", i, { name: nv }))} />
                  <div className="row2">
                    <TextInput label={t("f.role")} {...lprops(p.role, (nv) => updateItem("projects", i, { role: nv }))} />
                    <TextInput label={t("f.company")} {...lprops(p.company, (nv) => updateItem("projects", i, { company: nv }))} />
                  </div>
                  <TextArea
                    label={t("f.description")}
                    rows={3}
                    value={lval(p.description)}
                    onChange={(v) => updateItem("projects", i, { description: setLocalizedValue(p.description, cLang, v) })}
                    placeholder={lfb(p.description) || undefined}
                    warn={usesFallback(p.description, cLang)}
                    warnTitle={t("lz.missingHint")}
                  />
                  <BulletsEditor
                    label={t("f.responsibilities")}
                    items={p.bullets}
                    contentLang={cLang}
                    onChange={({ items }) => updateItem("projects", i, { bullets: items })}
                    addLabel={t("btn.addBullet")}
                  />
                  <div className="row2">
                    <TextInput label={t("f.technologies")} value={p.technologies} placeholder={t("ph.technologies")} onChange={(v) => updateItem("projects", i, { technologies: v })} />
                    <TextInput label={t("f.start")} value={p.date} onChange={(v) => updateItem("projects", i, { date: v })} />
                  </div>
                  <TextInput label={t("f.url")} value={p.url} placeholder={t("ph.url")} onChange={(v) => updateItem("projects", i, { url: v })} />
                </>
              )}
            />
          </SectionEditor>
        );

      case "references":
        return (
          <SectionEditor title={t("cv.references")} visible={vis.references} onToggleVisible={(v) => setVis("references", v)} actions={langSwitch}>
            <ListEditor
              items={list("references")}
              addLabel={t("btn.addReference")}
              emptyText={t("empty.references")}
              onAdd={() => addItem("references", { name: "", role: { en: "", es: "" }, email: "", phone: "" })}
              onRemove={(i) => removeItem("references", i)}
              renderItem={(r, i) => (
                <>
                  <div className="row2">
                    <TextInput label={t("f.name")} value={r.name} onChange={(v) => updateItem("references", i, { name: v })} />
                    <TextInput label={t("f.position")} {...lprops(r.role, (nv) => updateItem("references", i, { role: nv }))} />
                  </div>
                  <div className="row2">
                    <TextInput label={t("f.email")} value={r.email} onChange={(v) => updateItem("references", i, { email: v })} />
                    <TextInput label={t("f.phone")} value={r.phone} onChange={(v) => updateItem("references", i, { phone: v })} />
                  </div>
                </>
              )}
            />
          </SectionEditor>
        );

      case "design":
        return (
          <SectionEditor title={t("sec.design")}>
            <DesignSettingsEditor
              cv={cv}
              settings={cv.settings}
              onSettingsChange={(patch) => setObj("settings", patch)}
              visibility={vis}
              onVisibilityChange={setVis}
              sectionLabels={sectionLabels}
            />
          </SectionEditor>
        );

      default:
        return null;
    }
  };

  // Enlaces a preview/print de la persona + versión activas.
  const q = (extra) => {
    const p = new URLSearchParams({ profile });
    if (version !== "default") p.set("version", version);
    return `${extra}?${p.toString()}`;
  };
  const previewHref = q("/preview");
  const printHref = q("/print");

  // Badges de la navegación lateral: error en Personal si faltan campos,
  // aviso en Design si hay mezcla de idiomas o traducciones faltantes.
  const sidebarBadges = {};
  if (showFieldErrors && (fieldErrors.name || fieldErrors.email)) {
    sidebarBadges.personal = { type: "error" };
  }
  if (langWarnings.length || missingCount > 0) {
    sidebarBadges.design = { type: "warn" };
  }

  return (
    <LangProvider t={t}>
      <div className="app">
        <header className="topbar">
          <strong>CV Builder</strong>
          <nav className="topbar-nav">
            <ProfileSwitcher
              profiles={profiles}
              activeId={profile}
              onSelect={switchProfile}
              onManage={() => navigate("/profiles")}
            />
            <button className="icon-btn" aria-label={darkMode ? t("a.lightMode") : t("a.darkMode")} title={darkMode ? t("a.lightMode") : t("a.darkMode")} onClick={toggleDarkMode}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to={previewHref}><Eye size={15} /> {t("btn.preview")}</Link>
            {/* /print en pestaña nueva */}
            <a href={printHref} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> {t("btn.print")}
            </a>
            <button onClick={() => importRef.current?.click()}><Upload size={15} /> {t("btn.importJson")}</button>
            <input ref={importRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={onImportJson} />
            <button onClick={onExportJson}><Download size={15} /> {t("btn.exportJson")}</button>
            {hasBackups ? <button onClick={onRestoreBackup}><History size={15} /> {t("btn.restoreBackup")}</button> : null}
            <button onClick={onExportPdf}><FileDown size={15} /> {t("btn.exportPdf")}</button>
            <button className="primary" onClick={onSave}><Save size={15} /> {t("btn.save")}</button>
            <span className={"status" + (dirty ? " status--dirty" : "")}>
              {dirty ? t("st.unsaved") : t(statusKey)}
            </span>
          </nav>
        </header>

        {/* ---- Barra de versiones ---- */}
        <div className="versionbar">
          <span className="versionbar-label"><GitBranch size={15} /> {t("v.label")}</span>
          <select value={version} onChange={(e) => switchVersion(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <button onClick={onNewVersion}><Plus size={15} /> {t("btn.newVersion")}</button>
          <button onClick={onDuplicateVersion}><Copy size={15} /> {t("btn.duplicateVersion")}</button>
          {version !== "default" ? (
            <button className="danger" onClick={onDeleteVersion}><Trash2 size={15} /> {t("btn.deleteVersion")}</button>
          ) : null}
        </div>

        {errors.length ? (
          <div className="errors-banner">
            <strong>{t("val.bannerTitle")}</strong>
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            <button className="errors-close" onClick={() => setErrors([])}>✕</button>
          </div>
        ) : null}

        {/* ---- Fallback de contenido bilingüe ---- */}
        {missingCount > 0 ? (
          <div className="warn-banner">
            <strong>{t("lz.bilingual")}:</strong>{" "}
            {t("lz.fallbackCount", { n: missingCount, lang: t(lang === "en" ? "lz.langEn" : "lz.langEs") })}
            <span className="lz-dup-btns">
              <button type="button" onClick={() => onDuplicateContent("en", "es")}>Duplicate English to Spanish</button>
              <button type="button" onClick={() => onDuplicateContent("es", "en")}>Duplicar Español a Inglés</button>
            </span>
          </div>
        ) : null}

        {/* ---- Advertencia de mezcla de idiomas ---- */}
        {langWarnings.length ? (
          <div className="warn-banner">
            <strong>{t("w.title")}</strong>
            <ul>
              {langWarnings.map((w, i) => (
                <li key={i}>
                  {t(lang === "en" ? "w.esInEn" : "w.enInEs", {
                    field: w.field,
                    words: w.words.join(", "),
                  })}
                </li>
              ))}
            </ul>
            <button className="errors-close" onClick={() => setWarnDismissed(warnKey)}>✕</button>
          </div>
        ) : null}

        <div className="shell">
          {/* ---- Navegación lateral ---- */}
          <AppSidebar
            active={tab}
            onSelect={setTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            badges={sidebarBadges}
          />

          <div className="split">
            {/* ---- Panel izquierdo: formulario de la sección activa ---- */}
            <div className="pane pane--editor">
              <div className="tab-body">{renderTab()}</div>
            </div>

            {/* ---- Panel derecho: preview en vivo con marco + zoom ---- */}
            <div className="pane pane--preview pane--preview-framed">
              <ResumePreviewFrame cv={cv} printHref={printHref} onFullscreen={() => setFullscreen(true)} />
            </div>
          </div>
        </div>

        {/* ---- Preview a pantalla completa ---- */}
        {fullscreen ? (
          <div className="fs-overlay" onClick={() => setFullscreen(false)}>
            <button className="fs-close" onClick={() => setFullscreen(false)}>{t("btn.close")}</button>
            <div onClick={(e) => e.stopPropagation()}>
              <ResumePreview cv={cv} />
            </div>
          </div>
        ) : null}

        <Toasts toasts={toasts} onDismiss={dismissToast} />
      </div>
    </LangProvider>
  );
}
