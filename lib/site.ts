/**
 * Central site config — reused by metadata, robots, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain; the fallback is
 * used for local builds and previews.
 */
export const SITE = {
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://affordablepianotuning.com")
  ).replace(/\/$/, ""),
  name: "Affordable Piano Tuning",
  shortName: "APT",
  title: "Affordable Piano Tuning — Expert Piano Tuning in San Antonio, Texas",
  description:
    "Expert piano tuning, maintenance, and restoration for homes, churches, schools, studios, and the stages where music lives. Serving San Antonio and the Hill Country since 2025.",
  phone: "+19566140078",
  phoneDisplay: "(956) 614-0078",
  email: "tomasgalvan2000@gmail.com",
  city: "San Antonio",
  region: "TX",
  founded: "2025",
  reviewsUrl: "https://maps.app.goo.gl/Z94jnWKUkwqHu9Pq7",
  reviewCount: 2,
  ratingValue: 5,
  socialHandle: "tommytunessatx",
  social: {
    youtube: "https://www.youtube.com/@tommytunessatx",
    tiktok: "https://www.tiktok.com/@tommytunessatx",
    instagram: "https://www.instagram.com/tommytunessatx",
    threads: "https://www.threads.net/@tommytunessatx",
  },
  areaServed: [
    "San Antonio",
    "Alamo Heights",
    "Stone Oak",
    "Helotes",
    "Boerne",
    "New Braunfels",
    "Schertz",
    "Cibolo",
    "Austin",
  ],
} as const;
