import { createContext, useContext } from "react";
import { getT, DEFAULT_LANG } from "./translations.js";

// Contexto de idioma para los componentes del editor.
// Las plantillas del CV NO lo usan: leen cv.settings.language directamente
// para que /print y /preview funcionen de forma autónoma.
const LangContext = createContext(getT(DEFAULT_LANG));

export function LangProvider({ t, children }) {
  return <LangContext.Provider value={t}>{children}</LangContext.Provider>;
}

export function useT() {
  return useContext(LangContext);
}
