import type { Metadata } from "next";
import { Heebo, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "700", "800", "900"],
  variable: "--font-heebo",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dynamic-km.com"),
  title: "Dynamic Krav Maga — מאור לוי",
  description: "קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה. שיעורים פרטיים, קבוצות וסדנאות.",
  keywords: ["קרב מגע", "krav maga", "מאור לוי", "אימון הגנה עצמית", "שיעורי קרב מגע", "dynamic krav maga", "הגנה עצמית"],
  alternates: {
    canonical: "https://www.dynamic-km.com",
  },
  openGraph: {
    title: "Dynamic Krav Maga — מאור לוי",
    description: "קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה.",
    type: "website",
    locale: "he_IL",
    url: "https://www.dynamic-km.com",
    siteName: "Dynamic Krav Maga",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Dynamic Krav Maga — מאור לוי" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Dynamic Krav Maga",
    "description": "קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה.",
    "url": "https://www.dynamic-km.com",
    "image": "https://www.dynamic-km.com/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IL"
    },
    "founder": {
      "@type": "Person",
      "name": "מאור לוי"
    },
    "sameAs": [],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "שיעורי קרב מגע",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "שיעורים פרטיים" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "קבוצות אימון" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "סדנאות" } }
      ]
    }
  }

  return (
    <html lang="he" className={`${heebo.variable} ${barlowCondensed.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
