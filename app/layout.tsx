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
  title: "Dynamic Krav Maga — מאור לוי",
  description: "קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה. שיעורים פרטיים, קבוצות וסדנאות.",
  keywords: ["קרב מגע", "krav maga", "מאור לוי", "אימון הגנה עצמית", "שיעורי קרב מגע"],
  openGraph: {
    title: "Dynamic Krav Maga — מאור לוי",
    description: "קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה.",
    type: "website",
    locale: "he_IL",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" className={`${heebo.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
