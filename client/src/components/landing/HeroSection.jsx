import { motion } from "framer-motion";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";
import AnimatedResumeMockup from "./AnimatedResumeMockup.jsx";

// Hero a dos columnas: texto animado (slide up) + mockup del CV.
export default function HeroSection({ language, onStart, onTemplates }) {
  const t = useT();
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="lp-hero">
      <motion.div className="lp-hero-text" variants={stagger} initial="hidden" animate="show">
        <motion.span className="lp-eyebrow" variants={item}>{t("land.eyebrow")}</motion.span>
        <motion.h1 className="lp-hero-title" variants={item}>{t("land.hero.title")}</motion.h1>
        <motion.p className="lp-hero-sub" variants={item}>{t("land.hero.subtitle")}</motion.p>
        <motion.div className="lp-hero-actions" variants={item}>
          <motion.button
            type="button"
            className="lp-btn lp-btn--primary"
            onClick={onStart}
            aria-label={t("land.cta.primary")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {t("land.cta.primary")} <ArrowRight size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="lp-btn lp-btn--ghost"
            onClick={onTemplates}
            aria-label={t("land.cta.secondary")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LayoutTemplate size={17} /> {t("land.cta.secondary")}
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="lp-hero-visual">
        <AnimatedResumeMockup language={language} />
      </div>
    </section>
  );
}
