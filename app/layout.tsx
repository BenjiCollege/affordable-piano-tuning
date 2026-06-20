import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s · Affordable Piano Tuning",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "piano tuning",
    "piano tuner San Antonio",
    "piano tuning San Antonio",
    "piano maintenance",
    "piano repair",
    "piano restoration",
    "piano voicing",
    "concert grand tuning",
    "Hill Country piano service",
    "registered piano technician",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Music",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E6" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
};

// LocalBusiness structured data — helps local/SEO for a service business.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  image: `${SITE.url}/opengraph-image`,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "$$",
  foundingDate: SITE.founded,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    addressCountry: "US",
  },
  areaServed: SITE.areaServed.map((name) => ({ "@type": "City", name })),
  knowsAbout: [
    "Piano tuning",
    "Pitch correction",
    "Piano maintenance",
    "Piano voicing",
    "Tone regulation",
    "Piano cleaning",
    "Piano detailing",
    "Piano repair",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: SITE.ratingValue,
    reviewCount: SITE.reviewCount,
    bestRating: 5,
  },
  sameAs: [
    SITE.social.youtube,
    SITE.social.tiktok,
    SITE.social.instagram,
    SITE.social.threads,
    SITE.reviewsUrl,
  ],
  slogan: "Expert piano tuning in San Antonio, Texas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Apply a previously-chosen theme before paint to avoid a flash.
            Default (no stored choice) stays light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('apt-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
