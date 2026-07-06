import { Users } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";

// Selector compacto de persona activa en el header + acceso a la gestión.
export default function ProfileSwitcher({ profiles, activeId, onSelect, onManage }) {
  const t = useT();
  return (
    <span className="profsw">
      <span className="profsw-icon" aria-hidden="true"><Users size={15} /></span>
      <select
        className="profsw-select"
        value={activeId || ""}
        onChange={(e) => onSelect(e.target.value)}
        aria-label={t("pf.activePerson")}
        title={t("pf.activePerson")}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>{p.displayName}</option>
        ))}
      </select>
      <button type="button" className="profsw-manage" title={t("pf.manage")} onClick={onManage}>
        {t("pf.people")}
      </button>
    </span>
  );
}
