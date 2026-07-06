import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize2, ExternalLink } from "lucide-react";
import { useT } from "../../i18n/LangContext.jsx";
import ResumePreview from "../ResumePreview.jsx";

const A4_WIDTH = 794; // 210mm @ 96dpi

// Marco de preview: toolbar (zoom 50/75/100/fit, pantalla completa, abrir
// print) + hoja escalada con sombra. Muestra loading al cambiar de plantilla.
export default function ResumePreviewFrame({ cv, printHref, onFullscreen }) {
  const t = useT();
  const [zoom, setZoom] = useState("fit"); // "fit" | 0.5 | 0.75 | 1
  const [fitScale, setFitScale] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const areaRef = useRef(null);
  const template = cv?.settings?.template;

  // Recalcular escala "fit" según el ancho disponible.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 32; // padding
      setFitScale(Math.max(0.25, Math.min(1, w / A4_WIDTH)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Loading breve al cambiar de plantilla.
  useEffect(() => {
    if (!template) return;
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(id);
  }, [template]);

  const scale = zoom === "fit" ? fitScale : zoom;
  const zoomBtn = (val, label) => (
    <button
      type="button"
      className={"pvf-zoom" + (zoom === val ? " active" : "")}
      onClick={() => setZoom(val)}
      aria-pressed={zoom === val}
    >
      {label}
    </button>
  );

  return (
    <div className="pvf">
      <div className="pvf-toolbar">
        <div className="pvf-zooms" role="group" aria-label="zoom">
          {zoomBtn("fit", t("pv.fit"))}
          {zoomBtn(0.5, "50%")}
          {zoomBtn(0.75, "75%")}
          {zoomBtn(1, "100%")}
        </div>
        <span className="pvf-spacer" />
        {printHref ? (
          <a className="pvf-tool" href={printHref} target="_blank" rel="noreferrer" title={t("pv.openPrint")}>
            <ExternalLink size={15} />
          </a>
        ) : null}
        <button className="pvf-tool" onClick={onFullscreen} aria-label={t("a.fullscreenPreview")} title={t("a.fullscreenPreview")}>
          <Maximize2 size={15} />
        </button>
      </div>

      <div className="pvf-area" ref={areaRef}>
        {loading ? <div className="pvf-loading">{t("pv.loading")}</div> : null}
        <div className="pvf-scale" style={{ transform: `scale(${scale})`, width: A4_WIDTH }}>
          <ResumePreview cv={cv} />
        </div>
      </div>
    </div>
  );
}
