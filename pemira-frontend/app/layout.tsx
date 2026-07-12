import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/constant/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.orgName} · ${SITE.tagline}`,
    template: `%s · ${SITE.orgName}`,
  },
  description: `Kanal resmi pengawasan dan pelaporan pelanggaran pemilihan raya calon BEM dan BPM ${SITE.institutionShort}.`,
  icons: { icon: SITE.logo.src },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: beberapa ekstensi browser (Gemini, Grammarly,
    // Dark Reader, dsb.) menyuntik atribut ke <html>/<body> sebelum React hydrate.
    // Ini meredam mismatch atribut di root document tanpa menutupi mismatch nyata
    // pada komponen anak.
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
