import Image from "next/image";
import Link from "next/link";
import { Camera, Clock, Mail, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/constant/site";

const NAVIGATION_LINKS = [
  { label: "Info Pemira", href: "/info" },
  { label: "Lapor Pelanggaran", href: "/lapor" },
  { label: "Status Laporan", href: "/status" },
];

const REGULATION_LINKS = [
  { label: "Aturan Main", href: "/aturan" },
  { label: "Transparansi", href: "/publikasi" },
  { label: "Tentang KP", href: "/tentang" },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-canvas-line pb-2 text-xs font-bold tracking-[0.2em] text-steel-deep uppercase">
      {children}
    </h2>
  );
}

function FooterLinkList({ links }: { links: typeof NAVIGATION_LINKS }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm text-ink-muted transition-colors hover:text-steel-deep"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  // Tahun dihitung saat render di server. Tidak dipakai di klien, jadi tidak ada
  // risiko hydration mismatch saat pergantian tahun tengah sesi.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-canvas-line bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src={SITE.logo.src}
                alt={SITE.logo.alt}
                width={SITE.logo.width}
                height={SITE.logo.height}
                className="size-14 shrink-0"
              />
              <span className="flex flex-col leading-none">
                <span className="text-base font-extrabold tracking-tight text-steel-ink uppercase">
                  {SITE.orgName}
                </span>
                <span className="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] text-steel-deep uppercase">
                  {SITE.tagline}
                </span>
              </span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              Mengawal pemilihan raya calon BEM dan BPM {SITE.institutionShort} agar
              berjalan jujur, terdokumentasi, dan berkepastian hukum.
            </p>
          </div>

          <div>
            <FooterHeading>Navigasi</FooterHeading>
            <FooterLinkList links={NAVIGATION_LINKS} />
          </div>

          <div>
            <FooterHeading>Regulasi</FooterHeading>
            <FooterLinkList links={REGULATION_LINKS} />
          </div>

          <div>
            <FooterHeading>Kontak</FooterHeading>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-sm break-all text-ink-muted transition-colors hover:text-steel-deep"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                <a
                  href={SITE.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm break-all text-ink-muted transition-colors hover:text-steel-deep"
                >
                  {SITE.instagram.handle}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                <div>
                  <p className="text-sm text-ink-muted">
                    Operasional {SITE.operationalHours}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{SITE.responseTime}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-canvas-line pt-8 md:flex-row md:justify-between">
          <p className="text-xs tracking-wide text-ink-muted">
            © {year} {SITE.orgName} · {SITE.institution}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/privasi"
              className="text-xs text-ink-muted transition-colors hover:text-steel-deep"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/ketentuan"
              className="text-xs text-ink-muted transition-colors hover:text-steel-deep"
            >
              Ketentuan Layanan
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5">
              <ShieldCheck className="size-3.5 text-success" aria-hidden />
              <span className="text-[0.65rem] font-semibold tracking-widest text-success uppercase">
                Sistem Aktif
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
