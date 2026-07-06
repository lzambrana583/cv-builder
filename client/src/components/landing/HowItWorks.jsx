import { motion } from "framer-motion";
import { PencilLine, LayoutTemplate, FileDown } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";

// Tres pasos con conector visual y animación stagger.
const STEPS = [
  { n: 1, Icon: PencilLine },
  { n: 2, Icon: LayoutTemplate },
  { n: 3, Icon: FileDown },
];

export default function HowItWorks() {
  const t = useT();
  const wrap = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const step = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="lp-section">
      <h2 className="lp-section-title">{t("land.how.title")}</h2>
      <motion.ol
        className="lp-steps"
        variants={wrap}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {STEPS.map(({ n, Icon }) => (
          <motion.li className="lp-step" key={n} variants={step}>
            <span className="lp-step-num">{n}</span>
            <span className="lp-step-ico"><Icon size={24} /></span>
            <h3 className="lp-step-title">{t(`land.how.${n}.t`)}</h3>
            <p className="lp-step-desc">{t(`land.how.${n}.d`)}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
