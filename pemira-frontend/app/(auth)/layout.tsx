import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/constant/site";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-ivory px-6 py-12">
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
            <span className="text-2xl font-extrabold tracking-tight text-steel-ink sm:text-3xl">
              {SITE.orgName}
            </span>
            <span className="mt-2 text-xs font-semibold tracking-[0.22em] text-steel-deep uppercase sm:text-sm">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <div className="rounded-2xl border border-steel/20 bg-surface p-8 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
