import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El backend corre en el puerto 4000. Hacemos proxy de /api y /uploads
// para no lidiar con CORS ni puertos absolutos desde el frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
