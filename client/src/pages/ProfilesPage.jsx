import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  duplicateProfile,
} from "../api.js";
import { getT, normalizeLang } from "../i18n/translations.js";
import { LangProvider } from "../i18n/LangContext.jsx";
import { looksLikeCV } from "../utils/validate.js";
import { getTemplate } from "../templates/templateRegistry.js";
import Toasts from "../components/Toasts.jsx";

const PROFILE_KEY = "cv-builder-profile";

export default function ProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const importRef = useRef(null);

  const activeId = localStorage.getItem(PROFILE_KEY) || "";
  // Idioma de la UI: el de la persona activa si se conoce, si no español.
  const uiLangEntry = profiles.find((p) => p.id === activeId) || profiles[0];
  const t = getT(normalizeLang(uiLangEntry?.language));

  const toast = (text, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, text, type }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  };

  const refresh = () => listProfiles().then(setProfiles).catch((e) => toast(e.message, "error"));

  useEffect(() => {
    listProfiles()
      .then((list) => { setProfiles(list); setLoaded(true); })
      .catch((e) => { toast(e.message, "error"); setLoaded(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (id) => {
    localStorage.setItem(PROFILE_KEY, id);
    navigate("/app");
  };

  const onCreateBlank = async (name, email) => {
    try {
      const created = await createProfile({ displayName: name, email, source: "manual" });
      await refresh();
      toast(`${t("pf.created")}: ${created.displayName}`);
      open(created.id);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const onDuplicateCurrent = async () => {
    if (!activeId) { toast(t("pf.empty"), "error"); return; }
    try {
      const created = await duplicateProfile(activeId);
      await refresh();
      toast(`${t("pf.duplicatedP")}: ${created.displayName}`);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const onDuplicate = async (id) => {
    try {
      const created = await duplicateProfile(id);
      await refresh();
      toast(`${t("pf.duplicatedP")}: ${created.displayName}`);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const onImportJson = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!looksLikeCV(data)) throw new Error(t("val.importNotCV"));
        const name =
          [data.personalInfo?.firstName, data.personalInfo?.lastName].filter(Boolean).join(" ").trim() ||
          "Imported CV";
        const created = await createProfile({ displayName: name, cv: data, source: "import" });
        await refresh();
        setModal(false);
        toast(`${t("pf.created")}: ${created.displayName}`);
      } catch (err) {
        toast(err.message, "error");
      }
    };
    reader.readAsText(file);
  };

  const onRename = async (p) => {
    const name = window.prompt(t("pf.name"), p.displayName);
    if (!name || !name.trim()) return;
    try {
      await updateProfile(p.id, { displayName: name.trim() });
      await refresh();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const onArchive = async (id) => {
    if (!window.confirm(t("pf.confirmArchive"))) return;
    try {
      await deleteProfile(id, "archive");
      await refresh();
      toast(t("pf.archivedP"));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(t("pf.confirmDelete"))) return;
    try {
      await deleteProfile(id, "delete");
      if (id === activeId) localStorage.removeItem(PROFILE_KEY);
      await refresh();
      toast(t("pf.deletedP"));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const filtered = profiles.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (p.displayName || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q);
  });

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString(); } catch { return "—"; }
  };

  return (
    <LangProvider t={t}>
      <div className="app profiles-page">
        <header className="topbar">
          <strong>CV Builder — {t("pf.title")}</strong>
          <nav className="topbar-nav">
            {profiles.length ? (
              <button onClick={() => navigate("/app")}>{t("pf.backToEditor")}</button>
            ) : null}
            <button className="primary" onClick={() => setModal(true)}>{t("pf.newPerson")}</button>
          </nav>
        </header>

        <div className="profiles-body">
          {profiles.length > 3 ? (
            <input
              type="search"
              className="profiles-search"
              placeholder={t("pf.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          ) : null}

          {loaded && !profiles.length ? (
            <div className="profiles-empty">
              <p>{t("pf.empty")}</p>
              <button className="primary" onClick={() => setModal(true)}>{t("pf.createFirst")}</button>
            </div>
          ) : null}

          <div className="profiles-grid">
            {filtered.map((p) => (
              <ProfileCard
                key={p.id}
                p={p}
                active={p.id === activeId}
                t={t}
                fmtDate={fmtDate}
                onOpen={() => open(p.id)}
                onDuplicate={() => onDuplicate(p.id)}
                onArchive={() => onArchive(p.id)}
                onDelete={() => onDelete(p.id)}
                onRename={() => onRename(p)}
              />
            ))}
          </div>
        </div>

        {modal ? (
          <NewProfileModal
            t={t}
            hasActive={Boolean(activeId)}
            onBlank={onCreateBlank}
            onDuplicateCurrent={() => { onDuplicateCurrent(); setModal(false); }}
            onImport={() => importRef.current?.click()}
            onClose={() => setModal(false)}
          />
        ) : null}
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={onImportJson} />

        <Toasts toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((x) => x.id !== id))} />
      </div>
    </LangProvider>
  );
}

function ProfileCard({ p, active, t, fmtDate, onOpen, onDuplicate, onArchive, onDelete, onRename }) {
  const tpl = getTemplate(p.template);
  return (
    <div className={"profile-card" + (active ? " active" : "")}>
      <div className="profile-card-head">
        <span className="profile-card-name" onClick={onRename} title={t("pf.name")}>
          {p.displayName}{active ? " ●" : ""}
        </span>
        <span className="profile-card-versions">{t("pf.versionsN", { n: p.versionsCount })}</span>
      </div>
      {p.email ? <div className="profile-card-email">{p.email}</div> : null}
      <div className="profile-card-role">{p.roleTitle || t("pf.noRole")}</div>
      <div className="profile-card-meta">
        <span>{t("pf.tpl")}: {tpl?.name || p.template || "—"}</span>
        <span>{t("pf.lang")}: {(p.language || "—").toUpperCase()}</span>
      </div>
      <div className="profile-card-meta">
        <span>{t("pf.updated")}: {fmtDate(p.updatedAt)}</span>
      </div>
      <div className="profile-card-actions">
        <button className="primary" onClick={onOpen}>{t("pf.open")}</button>
        <button onClick={onDuplicate}>{t("pf.duplicate")}</button>
        <button onClick={onArchive}>{t("pf.archive")}</button>
        <button className="danger" onClick={onDelete}>{t("pf.delete")}</button>
      </div>
    </div>
  );
}

function NewProfileModal({ t, hasActive, onBlank, onDuplicateCurrent, onImport, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t("pf.newModalTitle")}</h3>
        <label className="fld">
          <span className="fld-label">{t("pf.name")}</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="fld">
          <span className="fld-label">{t("pf.email")}</span>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button className="primary" disabled={!name.trim()} onClick={() => onBlank(name.trim(), email.trim())}>
            {t("pf.fromBlank")}
          </button>
          {hasActive ? <button onClick={onDuplicateCurrent}>{t("pf.duplicateCurrent")}</button> : null}
          <button onClick={onImport}>{t("pf.importJson")}</button>
          <button onClick={onClose}>{t("pf.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
