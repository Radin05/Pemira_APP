import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/constant/site";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <Image
            src={SITE.logo.src}
            alt={SITE.logo.alt}
            width={SITE.logo.width}
            height={SITE.logo.height}
            priority
            className="size-12"
          />
          <span className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight text-ink-inverse">
              {SITE.orgName}
            </span>
            <span className="mt-1 text-[0.6rem] font-semibold tracking-[0.18em] text-gold uppercase">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">{children}</div>
      </div>
    </main>
  );
}
