import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ResumePreview from "../ResumePreview.jsx";
import { sampleCv } from "./sampleCv.js";

// Hoja A4 con un CV real (de ejemplo) escalado, que cicla entre plantillas
// y flota suavemente. Respeta prefers-reduced-motion.
const CYCLE = ["emerald-sidebar", "fintech-premium", "minimal-black"];

export default function AnimatedResumeMockup({ language = "es" }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % CYCLE.length), 3200);
    return () => clearInterval(id);
  }, [reduce]);

  const cv = {
    ...sampleCv,
    settings: { ...sampleCv.settings, template: CYCLE[i], language },
  };

  return (
    <motion.div
      className="lp-mockup"
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <motion.div
        className="lp-mockup-float"
        animate={reduce ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="lp-mockup-sheet" aria-hidden="true">
          <motion.div
            key={CYCLE[i]}
            className="lp-mockup-scale"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResumePreview cv={cv} mode="preview" />
          </motion.div>
        </div>
        <div className="lp-mockup-dots">
          {CYCLE.map((id, idx) => (
            <span key={id} className={"lp-dot" + (idx === i ? " active" : "")} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
