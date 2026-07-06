import { useT } from "../../i18n/LangContext.jsx";

// Conmutador del idioma del CONTENIDO que se está editando (EN / ES).
// Independiente de settings.language (que controla labels y preview).
export default function ContentLangSwitch({ value, onChange }) {
  const t = useT();
  return (
    <span className="clang">
      <span className="clang-label">{t("lz.editing")}</span>
      <button
        type="button"
        className={"clang-btn" + (value === "en" ? " active" : "")}
        title={t("lz.editEn")}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={"clang-btn" + (value === "es" ? " active" : "")}
        title={t("lz.editEs")}
        onClick={() => onChange("es")}
      >
        ES
      </button>
    </span>
  );
}
