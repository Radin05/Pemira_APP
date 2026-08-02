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

/**
 * Anti-kedip tema. Harus jalan SEBELUM paint pertama, jadi disuntik sebagai
 * skrip sinkron di <head> — bukan useEffect, yang baru jalan setelah paint dan
 * menyebabkan halaman berkedip putih sekejap saat reload di tema gelap.
 * Urutan: pilihan tersimpan user menang atas preferensi sistem.
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
