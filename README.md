# CV Builder

Constructor de CV local estilo [resume.io](https://resume.io), con **React + Vite** en el frontend y **Node.js + Express** en el backend. Todos los datos se guardan en un archivo JSON local (`data/cv.json`); no se usa base de datos.

> Estado: **base funcional**. El diseño final aún no está implementado.

## Estructura

```
cv-builder/
├─ client/        # Frontend React (Vite)
├─ server/        # Backend Express (nodemon)
├─ data/          # cv.json + backups automáticos
│  └─ backups/
├─ uploads/       # Fotos subidas por el usuario
├─ package.json   # Scripts de la raíz (concurrently)
└─ README.md
```

## Requisitos

- Node.js 18+ (probado con Node 24)
- npm 9+

## Instalación

Desde la raíz del proyecto, instala las dependencias de la raíz, el server y el client:

```bash
npm run install:all
```

Equivale a ejecutar `npm install` en la raíz, en `server/` y en `client/`.

## Ejecución en local

Levanta backend y frontend a la vez:

```bash
npm run dev
```

- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:4000

Vite hace *proxy* de `/api` y `/uploads` hacia el backend, así que no necesitas configurar CORS ni URLs absolutas.

### Ejecutar por separado

```bash
npm run dev:server   # solo Express (nodemon) en :4000
npm run dev:client   # solo Vite en :5173
```

## Producción (básico)

```bash
npm run build        # compila el frontend a client/dist
npm run start        # arranca el backend con node (sin nodemon)
```

## Scripts disponibles (raíz)

| Script              | Descripción                                             |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Backend + frontend con `concurrently`                   |
| `npm run dev:client`| Solo el frontend (Vite)                                 |
| `npm run dev:server`| Solo el backend (nodemon)                               |
| `npm run build`     | Build de producción del frontend                        |
| `npm run start`     | Arranca el backend con `node`                           |
| `npm run install:all` | Instala dependencias de raíz, server y client         |

## Rutas del frontend

| Ruta        | Descripción                          |
| ----------- | ------------------------------------ |
| `/`         | Editor + preview (pantalla principal)|
| `/preview`  | Solo vista previa                    |
| `/print`    | Versión limpia para impresión/PDF    |

## API del backend (`http://localhost:4000`)

| Método | Endpoint             | Descripción                                        |
| ------ | -------------------- | -------------------------------------------------- |
| GET    | `/api/cv`            | Lee el CV desde `data/cv.json`                     |
| PUT    | `/api/cv`            | Guarda el CV (crea backup automático antes)        |
| POST   | `/api/export/pdf`    | Genera un PDF del CV (pdfkit)                       |
| POST   | `/api/upload/photo`  | Sube una foto (campo `photo`) a `uploads/`         |
| GET    | `/api/health`        | Estado del servidor                                |

### Backups automáticos

Cada `PUT /api/cv` copia el `cv.json` actual a `data/backups/cv-<timestamp>.json` antes de sobrescribirlo.

## Exportación a PDF

`POST /api/export/pdf` imprime la ruta `/print` del frontend con Puppeteer (`puppeteer-core` + el **Chrome/Edge instalado**, sin descargar navegadores), por lo que el PDF es idéntico al preview de la plantilla activa (A4, `printBackground: true`, margen 0 — los colores del sidebar salen en el PDF).

Flujo:
1. Si llega un CV en el body, se guarda primero (con backup) para exportar el estado actual del editor.
2. Se genera el PDF navegando a `/print` y se guarda una copia en **`/exports`** con nombre `Nombre_Apellido_CV_YYYYMMDD_HHMM.pdf`.
3. El archivo se devuelve como descarga (el botón del editor lo baja con ese nombre).

Notas:
- Si el frontend no está corriendo, responde `503` con un mensaje claro; el navegador se cierra siempre, incluso con error.
- Variables opcionales: `CHROME_PATH` (ruta al ejecutable) y `CV_CLIENT_URL` (URL del frontend, por defecto `http://localhost:5173`).
- **Fallback:** si no hay Chrome/Edge, se usa un generador básico con `pdfkit`.

## Plantillas

Sistema dinámico de plantillas registry-driven:

- **Registry:** `client/src/templates/templateRegistry.js` — cada entrada tiene `id`, `name`, `category`, `description`, `component`, `supportsPhoto`, `supportsSkillBars`, `supportsSidebar`, `atsFriendly`.
- **Galería (Design):** tarjetas con **mini preview en vivo** (la plantilla real renderizada con tus datos, escalada), nombre, categoría, descripción y badges (ATS Friendly, Supports Photo, One/Two Columns, Best for Tech/Banking/Executive). Buscador por nombre, filtros (All + categorías + Banking), botón **Use Template** (el preview cambia al instante) y **Preview Template Fullscreen** para ver cualquier plantilla a tamaño completo antes de aplicarla. Grid responsive (1 columna en pantallas pequeñas). La activa se guarda en `settings.template`; si el id no existe, `ResumePreview` cae a `emerald-sidebar`.
- **Props estándar** de toda plantilla: `{ cv, language, settings, mode: "preview" | "print" }`.
- **Contenido compartido:** las plantillas solo definen layout/estilos. La lógica de contenido (localización, visibilidad, ocultos, fechas) vive en `client/src/components/resume/resumeModel.js`, y el markup en componentes compartidos: `ResumeRoot`, `ResumeSection`, `ResumeHeader`, `ResumeContactInfo`, `ResumeSkills`, `ResumeLanguages`, `ResumeExperience`, `ResumeEducation`, `ResumeCourses`, `ResumeReferences` (clases `rs-*` que cada plantilla estiliza bajo su scope).

**21 plantillas incluidas** (ver `templateRegistry.js` para los metadatos completos):

- **Modern:** Emerald Sidebar · Modern Blue Sidebar · Product Leader · Startup Modern · Fintech Premium
- **Executive:** Classic Executive · Banking Professional · Academic Professional · Consulting Brief · Elegant Gray · Senior Leadership
- **Creative:** Bold Header · Timeline Resume · Project Portfolio
- **Minimal:** Minimal Black · Compact One Page · Nordic Clean
- **ATS:** ATS Simple (ignora foto, sidebar y barras siempre)
- **Technical:** Tech Grid · Skills Focused · Developer Clean

Notas:
- **Project Portfolio** (y otras) soportan un array opcional `projects[]` en el JSON: `{ name: {en,es}, role: {en,es}, company: {en,es}, date, description: {en,es}, bullets: [{en,es}], technologies, url }`. Se edita desde el tab **Proyectos** del editor (bilingüe, con drag & drop y toggle de visibilidad).

## Orden dinámico de secciones

Cada plantilla define un **orden recomendado** (`recommendedSectionOrder` en `templateRegistry.js`) y el usuario puede personalizarlo:

- `settings.sectionOrder`: array de claves de sección (`profile`, `employmentHistory`, `education`, `courses`, `skills`, `languages`, `references`, `projects`). Vacío `[]` = usa el orden recomendado de la plantilla activa.
- El resolutor (`resolveSectionOrder` en `resumeModel.js`) aplica: **orden del usuario > recomendado de la plantilla > global**, ignora claves desconocidas y añade al final las que falten, de modo que **nunca se pierde una sección visible**.
- En **Design → Orden de secciones**: lista con drag & drop (y flechas ↑/↓), botón **Restablecer orden** (`sectionOrder = []`) y **Usar orden recomendado para esta plantilla**.
- Las plantillas de una columna respetan el orden completo; las de zonas (sidebar / dos columnas) lo respetan **dentro de cada zona** (`orderedSubset`), manteniendo su layout característico. El orden se refleja también en el PDF (se imprime la ruta `/print`).
- Todas respetan `settings.language`, `sectionsVisibility`, `showPhoto`, `showSkillBars`, `showReferences`, `compactMode` y el tamaño A4/Carta.

Para añadir una plantilla: crear el componente sobre los componentes compartidos + su CSS, y registrarla en el registry — el selector y el preview la recogen solos.

## Rutas

- **`/`** — Landing page pública (SaaS, animada con framer-motion). Idioma es/en (toggle + `localStorage cv-builder-uilang`, default español). El CTA "Comienza tu CV aquí" entra al editor con una transición suave.
- **`/app`** — Editor de CV (antes en `/`).
- **`/profiles`** — Gestión de personas · **`/preview`** — solo preview · **`/print`** — versión limpia para PDF (sin UI de app ni landing).

La landing vive en `pages/LandingPage.jsx` + `components/landing/` (`HeroSection`, `FeatureCards`, `AnimatedResumeMockup`, `HowItWorks`, `LandingCTA`) y `styles/landing.css`. El mockup renderiza un CV de ejemplo real ciclando entre plantillas. Respeta `prefers-reduced-motion`.

## Sistema de diseño (UI de la app)

- **Design tokens** en `client/src/tokens.css`: paleta (navy `#1e293b` + azul `#3b82f6` del branding), espaciado, radios, sombras, tipografía (Inter) y z-index. Modo claro y oscuro. Los documentos CV son inmunes a estos tokens y al modo oscuro (mantienen sus estilos en `templates/*.css`).
- **Iconos**: `lucide-react` en header, versionbar, selector de persona y toolbar del preview.
- **Preview con zoom**: `components/preview/ResumePreviewFrame.jsx` — hoja A4 con sombra, controles Fit/50/75/100 %, pantalla completa y abrir `/print`, con estado de carga al cambiar de plantilla.
- **Branding**: favicons de `components/Assets/` copiados a `client/public/` y enlazados en `index.html` (icon, apple-touch, theme-color).
- El modo oscuro (toggle en el header) se guarda en `localStorage` y **no** afecta a `/print` ni al PDF.

## Múltiples personas (perfiles)

La app gestiona CVs de varias personas, con datos completamente separados en disco:

```
data/
  profiles/
    index.json                      # lista de personas
    <profileId>/
      cv.json                       # CV por defecto (con profileId + metadata)
      versions/<id>.json            # versiones por puesto
      backups/*.json
      exports/*.pdf
      uploads/photo-*.jpg
```

- **`index.json`**: `[{ id, displayName, email, createdAt, updatedAt, active, lastOpenedAt }]`.
- Cada `cv.json` añade `metadata: { profileId, ownerName, createdAt, updatedAt, lastExportedAt, source }`.
- **Migración automática**: al arrancar, si existe `data/cv.json` legacy y no hay perfiles, se crea el primer perfil (`data/profiles/<slug-del-nombre>/`), se mueven versiones/backups/uploads, se reescriben rutas de foto, se crea `index.json` y el original se conserva como `data/cv.legacy.backup.json` (log claro en consola).
- **Seguridad**: el `profileId` se valida contra `^[a-z0-9][a-z0-9-]{0,63}$` y se comprueba que la ruta resuelta quede dentro de `data/profiles/` (sin path traversal). Uploads, exports y backups viven siempre dentro de la carpeta de cada persona.

### UI
- Selector de persona en el header (funciona en desktop y móvil) + botón **Personas**.
- Página **/profiles**: tarjetas con nombre, email, título actual, plantilla, idioma, última edición y nº de versiones, con botones **Open / Duplicate / Archive / Delete**. Buscador por nombre/email. Modal **Nueva persona** con: *Create from blank CV*, *Duplicate current profile*, *Import CV JSON as new profile*. Si no hay perfiles, pantalla para crear el primero.
- Cambiar de persona recarga editor y preview; Guardar y Exportar PDF operan solo sobre la persona activa; las versiones pertenecen a la persona activa.

### Endpoints (por perfil)
`GET/POST /api/profiles` · `GET/PUT/DELETE /api/profiles/:id` · `POST /api/profiles/:id/duplicate` · `GET/PUT /api/profiles/:id/cv` · `GET/POST/DELETE /api/profiles/:id/versions[/:vid]` · `GET /api/profiles/:id/backups` · `POST /api/profiles/:id/restore[/:backupId]` · `POST /api/profiles/:id/upload/photo` · `POST /api/profiles/:id/export/pdf` · `GET /uploads/:id/:file`. Todos aceptan `?version=<id>`.

El PDF incluye el nombre de la persona y (si aplica) la versión: `Leonardo_Zambrana_Product_Owner_CV_20260705.pdf`.

## Idioma del CV (es / en)

`settings.language` ("es" | "en", por versión) controla el idioma de **toda la interfaz y del CV**: labels del editor, botones, toasts, confirmaciones, validaciones y títulos de sección de las plantillas. Se cambia desde el tab **Diseño → Idioma del CV**. Las traducciones viven centralizadas en `client/src/i18n/translations.js` (nada de textos hardcodeados en plantillas ni editor). El contenido escrito por el usuario nunca se traduce automáticamente; si el contenido parece estar en el idioma contrario al configurado, el editor muestra una advertencia amarilla descartable.

## Contenido bilingüe (en / es)

Los campos de texto principales son bilingües: `{ "en": "...", "es": "..." }` (roleTitle, profile, y por ítem: puesto/empresa/ubicación/bullets/logros de experiencia, educación, cursos, cargo de referencias y nombres de skills/idiomas). Helpers centralizados en `client/src/i18n/localized.js`: `getLocalizedValue`, `setLocalizedValue`, `normalizeLocalizedField`, `normalizeCvLanguageFields`.

- El preview muestra solo el idioma activo (`settings.language`); si falta, cae al otro idioma como respaldo.
- En el editor, cada sección tiene un switch **EN/ES** para elegir qué idioma del contenido se edita; los campos sin versión en ese idioma se marcan en ámbar y muestran el otro idioma como placeholder.
- Un banner indica cuántos campos usan respaldo, con botones **Duplicate English to Spanish** / **Duplicar Español a Inglés** que copian el texto a los campos vacíos (sin traducir — para editarlo a mano).
- Compatibilidad: los strings del formato anterior se convierten automáticamente a `{ en: "valor anterior", es: "" }` al cargar, importar o restaurar backups.

## Versiones del CV

Cada versión es un documento CV completo en `data/versions/<id>.json` (campo `versionName`); la versión **default** es `data/cv.json`. Desde la barra de versiones del editor se puede:

- Cambiar de versión (selector) — el preview, el guardado, los backups y el export PDF operan sobre la versión activa
- **+ Nueva versión** — parte de la default
- **Duplicar versión actual** — copia el estado actual del editor (incluye cambios sin guardar)
- **Eliminar versión** — solo versiones no-default; se respalda antes en `data/backups/`

API: `GET /api/versions`, `POST /api/versions { name, cv? }`, `DELETE /api/versions/:id`, y `?version=<id>` opcional en `GET/PUT /api/cv`, `/api/cv/backups`, `/api/cv/restore`, `/api/export/pdf` y `/api/upload/photo`. El PDF exportado incluye la versión en el nombre: `Nombre_Apellido_CV_Product_Owner_YYYYMMDD_HHMM.pdf`.

## Notas

- El servidor usa `CV_SERVER_PORT` (no `PORT`) para su puerto; por defecto 4000.
- Las carpetas `uploads/` y `data/backups/` están en `.gitignore` (salvo su `.gitkeep`).
