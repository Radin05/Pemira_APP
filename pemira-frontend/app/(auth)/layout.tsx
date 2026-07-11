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
        <Link href="/" className="mb-10 flex items-center justify-center gap-5">
          <Image
            src={SITE.logo.src}
            alt={SITE.logo.alt}
            width={SITE.logo.width}
            height={SITE.logo.height}
            priority
            className="size-24 shrink-0 sm:size-28"
          />
          <span className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-ink-inverse sm:text-3xl">
              {SITE.orgName}
            </span>
            <span className="mt-2 text-xs font-semibold tracking-[0.22em] text-gold uppercase sm:text-sm">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">{children}</div>
      </div>
    </main>
  );
}
