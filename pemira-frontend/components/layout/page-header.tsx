type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

/** Header seragam untuk semua halaman publik selain beranda. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold text-ink-inverse sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-inverse/70">
          {description}
        </p>
      </div>
    </section>
  );
}
