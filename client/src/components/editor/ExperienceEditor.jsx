import TextInput from "../inputs/TextInput.jsx";
import { useT } from "../../i18n/LangContext.jsx";
import {
  normalizeLocalizedField,
  setLocalizedValue,
  usesFallback,
  getLocalizedValue,
} from "../../i18n/localized.js";

// Formulario de una experiencia laboral: datos + bullets + logros.
// Los campos de texto son bilingües ({ en, es }); se edita el idioma
// indicado en contentLang. Los bullets pueden ocultarse individualmente
// (item.hiddenBullets: índices) sin borrarlos.
export default function ExperienceEditor({ item, onChange, contentLang = "es" }) {
  const t = useT();
  const other = contentLang === "en" ? "es" : "en";

  const val = (v) => normalizeLocalizedField(v)[contentLang];
  const fb = (v) => (usesFallback(v, contentLang) ? normalizeLocalizedField(v)[other] : "");
  const lset = (key) => (text) => onChange({ [key]: setLocalizedValue(item[key], contentLang, text) });
  const lprops = (key) => ({
    value: val(item[key]),
    placeholder: fb(item[key]) || undefined,
    warn: usesFallback(item[key], contentLang),
    warnTitle: t("lz.missingHint"),
    onChange: lset(key),
  });

  return (
    <div className="exp-ed">
      <TextInput label={t("f.role")} {...lprops("role")} />
      <div className="row2">
        <TextInput label={t("f.company")} {...lprops("company")} />
        <TextInput label={t("f.location")} {...lprops("location")} />
      </div>
      <div className="row2">
        <TextInput label={t("f.start")} value={item.startDate} placeholder={t("ph.start")} onChange={(v) => onChange({ startDate: v })} />
        <TextInput label={t("f.end")} value={item.endDate} placeholder={t("ph.end")} onChange={(v) => onChange({ endDate: v })} />
      </div>
      <BulletsEditor
        label={t("f.responsibilities")}
        items={item.bullets}
        hidden={item.hiddenBullets}
        hideable
        contentLang={contentLang}
        onChange={({ items, hidden }) => onChange({ bullets: items, hiddenBullets: hidden })}
        addLabel={t("btn.addBullet")}
      />
      <BulletsEditor
        label={t("f.achievements")}
        items={item.achievements}
        contentLang={contentLang}
        onChange={({ items }) => onChange({ achievements: items })}
        addLabel={t("btn.addAchievement")}
      />
    </div>
  );
}

// Lista de textos bilingües de una línea con añadir/editar/eliminar y,
// si hideable, un ojo para ocultar cada línea sin borrarla.
export function BulletsEditor({ label, items, hidden, hideable = false, contentLang, onChange, addLabel }) {
  const t = useT();
  const safe = Array.isArray(items) ? items : [];
  const hid = Array.isArray(hidden) ? hidden : [];
  const emit = (nextItems, nextHidden = hid) => onChange({ items: nextItems, hidden: nextHidden });

  const update = (i, text) =>
    emit(safe.map((b, idx) => (idx === i ? setLocalizedValue(b, contentLang, text) : b)));
  const remove = (i) =>
    emit(
      safe.filter((_, idx) => idx !== i),
      // Reajustar índices ocultos tras el borrado.
      hid.filter((h) => h !== i).map((h) => (h > i ? h - 1 : h))
    );
  const toggleHide = (i) =>
    emit(safe, hid.includes(i) ? hid.filter((h) => h !== i) : [...hid, i]);

  return (
    <div className="bullets-ed">
      <span className="fld-label">{label}</span>
      {safe.map((b, i) => {
        const isHidden = hideable && hid.includes(i);
        const missing = usesFallback(b, contentLang);
        return (
          <div className={"bullet-row" + (isHidden ? " bullet-row--hidden" : "")} key={i}>
            <input
              type="text"
              className={missing ? "lz-missing" : undefined}
              title={missing ? t("lz.missingHint") : undefined}
              value={normalizeLocalizedField(b)[contentLang]}
              placeholder={missing ? getLocalizedValue(b, contentLang) : undefined}
              onChange={(e) => update(i, e.target.value)}
            />
            {hideable ? (
              <button
                type="button"
                className="icon-btn"
                title={isHidden ? t("a.showInCV") : t("a.hideFromCV")}
                onClick={() => toggleHide(i)}
              >
                {isHidden ? "🚫" : "👁"}
              </button>
            ) : null}
            <button type="button" className="icon-danger" title={t("a.delete")} onClick={() => remove(i)}>✕</button>
          </div>
        );
      })}
      <button type="button" className="list-add-sm" onClick={() => emit([...safe, { en: "", es: "" }])}>
        {addLabel}
      </button>
    </div>
  );
}
