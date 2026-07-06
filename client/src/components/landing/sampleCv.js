// CV de ejemplo (bilingüe) para el mockup animado de la landing.
// No toca datos reales; vive solo en memoria del cliente.
export const sampleCv = {
  personalInfo: { firstName: "Ana", lastName: "García", photo: "" },
  roleTitle: { en: "Senior Product Designer", es: "Diseñadora de Producto Senior" },
  profile: {
    en: "Multidisciplinary designer with 8+ years crafting digital products end to end, from research to polished UI, for fintech and SaaS teams.",
    es: "Diseñadora multidisciplinar con más de 8 años creando productos digitales de principio a fin, de la investigación a la interfaz, para equipos fintech y SaaS.",
  },
  details: {
    email: "ana.garcia@example.com",
    phone: "+34 600 123 456",
    location: "Madrid, España",
    nationality: "",
    birthDate: "",
    birthPlace: "",
  },
  links: [],
  skills: [
    { name: { en: "Product Design", es: "Diseño de Producto" }, level: 95 },
    { name: { en: "Figma", es: "Figma" }, level: 95 },
    { name: { en: "Design Systems", es: "Sistemas de Diseño" }, level: 90 },
    { name: { en: "User Research", es: "Investigación de Usuarios" }, level: 80 },
    { name: { en: "Prototyping", es: "Prototipado" }, level: 85 },
  ],
  languages: [
    { name: { en: "Spanish", es: "Español" }, level: 100 },
    { name: { en: "English", es: "Inglés" }, level: 85 },
  ],
  employmentHistory: [
    {
      role: { en: "Senior Product Designer", es: "Diseñadora de Producto Senior" },
      company: { en: "Northwind", es: "Northwind" },
      location: { en: "", es: "" },
      startDate: "2021",
      endDate: "Present",
      bullets: [
        { en: "Led the design system used across 6 product teams.", es: "Lideró el sistema de diseño usado por 6 equipos de producto." },
        { en: "Shipped a checkout redesign that lifted conversion 18%.", es: "Rediseñó el checkout aumentando la conversión un 18%." },
      ],
      achievements: [],
    },
    {
      role: { en: "Product Designer", es: "Diseñadora de Producto" },
      company: { en: "Brightlab", es: "Brightlab" },
      location: { en: "", es: "" },
      startDate: "2018",
      endDate: "2021",
      bullets: [
        { en: "Designed mobile banking flows for 200k+ users.", es: "Diseñó flujos de banca móvil para más de 200k usuarios." },
      ],
      achievements: [],
    },
  ],
  education: [
    {
      degree: { en: "BA in Design", es: "Grado en Diseño" },
      institution: { en: "IED Madrid", es: "IED Madrid" },
      location: { en: "", es: "" },
      startDate: "2014",
      endDate: "2018",
    },
  ],
  courses: [],
  references: [],
  projects: [],
  settings: {
    template: "emerald-sidebar",
    language: "es",
    showPhoto: false,
  },
  sectionsVisibility: {
    profile: true, details: true, links: true, skills: true, languages: true,
    employmentHistory: true, education: true, courses: true, references: true, projects: true,
  },
};
