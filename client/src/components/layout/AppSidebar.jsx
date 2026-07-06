import {
  User, AlignLeft, Briefcase, GraduationCap, Award, SlidersHorizontal,
  Languages as LangIcon, FolderGit2, Contact, Palette,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";

// Navegación lateral del editor. Cada item corresponde a un tab existente
// (mantiene la misma lógica de renderTab). Colapsable en desktop y en
// móvil se convierte en barra horizontal (vía CSS del contenedor).
const ITEMS = [
  { id: "personal", labelKey: "tab.personal", Icon: User },
  { id: "profile", labelKey: "tab.profile", Icon: AlignLeft },
  { id: "employment", labelKey: "tab.employment", Icon: Briefcase },
  { id: "education", labelKey: "tab.education", Icon: GraduationCap },
  { id: "courses", labelKey: "tab.courses", Icon: Award },
  { id: "skills", labelKey: "tab.skills", Icon: SlidersHorizontal },
  { id: "languages", labelKey: "tab.languages", Icon: LangIcon },
  { id: "projects", labelKey: "tab.projects", Icon: FolderGit2 },
  { id: "references", labelKey: "tab.references", Icon: Contact },
  { id: "design", labelKey: "tab.design", Icon: Palette },
];

export default function AppSidebar({ active, onSelect, collapsed, onToggleCollapse, badges = {} }) {
  const t = useT();
  return (
    <nav className={"appsb" + (collapsed ? " collapsed" : "")} aria-label="Editor sections">
      <button
        type="button"
        className="appsb-collapse"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand" : "Collapse"}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>

      <ul className="appsb-list">
        {ITEMS.map(({ id, labelKey, Icon }) => {
          const badge = badges[id];
          const label = t(labelKey);
          return (
            <li key={id}>
              <button
                type="button"
                className={"appsb-item" + (active === id ? " active" : "")}
                onClick={() => onSelect(id)}
                title={collapsed ? label : undefined}
                aria-current={active === id ? "page" : undefined}
              >
                <span className="appsb-ico"><Icon size={17} /></span>
                <span className="appsb-label">{label}</span>
                {badge ? (
                  <span className={"appsb-badge appsb-badge--" + badge.type} aria-hidden="true">
                    {badge.count ?? "!"}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
