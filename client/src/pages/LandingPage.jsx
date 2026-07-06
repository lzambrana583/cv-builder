import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getT, normalizeLang } from "../i18n/translations.js";
import { LangProvider } from "../i18n/LangContext.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import FeatureCards from "../components/landing/FeatureCards.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import LandingCTA from "../components/landing/LandingCTA.jsx";

const UILANG_KEY = "cv-builder-uilang";

// Landing pública (ruta /). El editor vive en /app.
export default function LandingPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [lang, setLang] = useState(() => normalizeLang(localStorage.getItem(UILANG_KEY) || "es"));
  const [leaving, setLeaving] = useState(false);
  const t = getT(lang);

  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem(UILANG_KEY, l);
  };

  // Transición suave (fade out) antes de entrar al editor.
  const go = (to) => {
    if (reduce) { navigate(to); return; }
    setLeaving(true);
    setTimeout(() => navigate(to), 340);
  };
  const start = () => go("/app");
  const templates = () => go("/app");

  return (
    <LangProvider t={t}>
      <div className="lp">
        <header className="lp-nav">
          <a className="lp-brand" href="/" aria-label="CV Builder">
            <img className="lp-brand-logo" src="/favicon-192.png" alt="" />
            <span>CV Builder</span>
          </a>
          <div className="lp-nav-right">
            <div className="lp-lang" role="group" aria-label="Language">
              <button
                type="button"
                className={"lp-lang-btn" + (lang === "es" ? " active" : "")}
                onClick={() => setLanguage("es")}
                aria-pressed={lang === "es"}
              >
                ES
              </button>
              <button
                type="button"
                className={"lp-lang-btn" + (lang === "en" ? " active" : "")}
                onClick={() => setLanguage("en")}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
            <button type="button" className="lp-btn lp-btn--sm" onClick={start}>
              {t("land.nav.app")}
            </button>
          </div>
        </header>

        <motion.main
          className="lp-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <HeroSection language={lang} onStart={start} onTemplates={templates} />
          <FeatureCards />
          <HowItWorks />
          <LandingCTA onStart={start} />
          <footer className="lp-footer">CV Builder · {new Date().getFullYear()}</footer>
        </motion.main>

        {/* Overlay de transición al entrar en el editor */}
        <AnimatePresence>
          {leaving ? (
            <motion.div
              className="lp-leave"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </LangProvider>
  );
}
