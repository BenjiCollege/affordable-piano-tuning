/**
 * Central site config — reused by metadata, robots, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain; the fallback is
 * used for local builds and previews.
 */
export const SITE = {
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cadencepiano.com")
  ).replace(/\/$/, ""),
  name: "Cadence Piano Service",
  shortName: "Cadence",
  title: "Cadence Piano Service — Expert Piano Tuning in San Antonio, Texas",
  description:
    "Expert piano tuning, maintenance, and restoration for homes, churches, schools, studios, and the stages where music lives. Serving San Antonio and the Hill Country since 2009.",
  phone: "+12105550174",
  phoneDisplay: "(210) 555-0174",
  email: "hello@cadencepiano.com",
  city: "San Antonio",
  region: "TX",
  founded: "2009",
  areaServed: [
    "San Antonio",
    "Alamo Heights",
    "Stone Oak",
    "Helotes",
    "Boerne",
    "New Braunfels",
    "Schertz",
    "Cibolo",
  ],
} as const;
