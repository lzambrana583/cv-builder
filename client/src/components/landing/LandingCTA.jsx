import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";

// Call to action final con fondo de acento y botón principal.
export default function LandingCTA({ onStart }) {
  const t = useT();
  return (
    <motion.section
      className="lp-final"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="lp-final-title">{t("land.final.title")}</h2>
      <p className="lp-final-sub">{t("land.final.subtitle")}</p>
      <motion.button
        type="button"
        className="lp-btn lp-btn--primary lp-btn--lg"
        onClick={onStart}
        aria-label={t("land.cta.primary")}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {t("land.cta.primary")} <ArrowRight size={18} />
      </motion.button>
    </motion.section>
  );
}
