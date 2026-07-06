import { motion } from "framer-motion";
import { LayoutTemplate, FileDown, Users, Languages, ShieldCheck, Zap } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";

// Cards de beneficios con animación stagger al entrar en viewport.
const FEATURES = [
  { key: "templates", Icon: LayoutTemplate },
  { key: "pdf", Icon: FileDown },
  { key: "people", Icon: Users },
  { key: "bilingual", Icon: Languages },
  { key: "ats", Icon: ShieldCheck },
  { key: "realtime", Icon: Zap },
];

export default function FeatureCards() {
  const t = useT();
  const grid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const card = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="lp-section">
      <h2 className="lp-section-title">{t("land.benefits.title")}</h2>
      <motion.div
        className="lp-features"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {FEATURES.map(({ key, Icon }) => (
          <motion.article className="lp-feature" key={key} variants={card} whileHover={{ y: -4 }}>
            <span className="lp-feature-ico"><Icon size={22} /></span>
            <h3 className="lp-feature-title">{t(`land.b.${key}.t`)}</h3>
            <p className="lp-feature-desc">{t(`land.b.${key}.d`)}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
