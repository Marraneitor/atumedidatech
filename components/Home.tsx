'use client';

import { usePrefs } from '@/lib/prefs';
import { PROJECTS } from '@/lib/projects';
import { Icon, Reveal, WhatsAppIcon } from './ui';

/* Inicio: qué hacemos en una frase, trabajo real y un solo llamado a la acción. Poco texto a propósito. */
export default function Home() {
  const { t, lang, price, wa, f } = usePrefs();
  const s = t.site;
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section id="inicio" className="relative isolate overflow-hidden pt-44 pb-20 sm:pt-48 sm:pb-24 xl:pt-44">
        <div aria-hidden className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[80vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(56,189,248,.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h1 key={lang} className="max-w-4xl animate-fade-up font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.022em] text-balance sm:text-6xl lg:text-7xl">
            {s.hero.title}
          </h1>
          <p className="mt-6 max-w-[52ch] animate-fade-up text-lg leading-relaxed text-pretty text-muted [animation-delay:.1s] sm:text-xl">{s.hero.sub}</p>
          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:.2s] sm:flex-row">
            <a href={wa(t.wa.general)} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-ink px-7 text-base font-semibold text-bg transition hover:bg-white">
              <WhatsAppIcon className="size-5" />
              {s.hero.cta1}
            </a>
            <a href="#portafolio" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line px-7 text-base font-semibold text-ink transition hover:bg-white/[.06]">
              {s.hero.cta2}
              <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
          <ul className="mt-12 flex animate-fade-up flex-wrap gap-x-8 gap-y-2 text-sm text-dim [animation-delay:.3s]">
            {s.hero.facts.map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-accent" />
                {f(x, { price: price('landing') })}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trabajo reciente */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Head title={s.recent.title} href="#portafolio" link={s.recent.all} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="overflow-hidden rounded-2xl border border-line bg-bg-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/assets/img/projects/${p.id}.webp`}
                      alt={p.name}
                      width={960}
                      height={600}
                      loading="lazy"
                      className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold tracking-[-0.012em]">{p.name}</p>
                      <p className="mt-0.5 text-sm text-dim">{p.type[lang]}</p>
                    </div>
                    <Icon name="arrowUpRight" className="mt-1 size-4 shrink-0 text-dim transition-colors group-hover:text-accent" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Head title={s.what.title} href="#soluciones" link={s.what.all} />
          <ol className="mt-8 grid border-t border-line md:grid-cols-3">
            {s.what.items.map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 0.06} className="border-b border-line py-7 md:border-b-0 md:py-9 md:pr-8 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8">
                <span className="text-sm text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.012em]">{x.t}</h3>
                <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-pretty text-muted">{x.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-col gap-8 rounded-3xl border border-line bg-bg-2 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.022em] text-balance sm:text-4xl">{s.close.title}</h2>
              <p className="mt-3 max-w-[48ch] text-pretty text-muted">{s.close.sub}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <a href={wa(t.wa.general)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-wa px-6 font-semibold text-[#03200f] transition hover:brightness-110">
                <WhatsAppIcon className="size-[18px]" />
                {s.hero.cta1}
              </a>
              <a href="/citas" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6 font-semibold text-ink transition hover:bg-white/[.06]">
                <Icon name="calendar" className="size-[18px] text-accent" />
                {s.close.book}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function Head({ title, href, link, as: Tag = 'h2' }: { title: string; href?: string; link?: string; as?: 'h2' | 'h3' }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <Tag className="font-display text-2xl font-bold tracking-[-0.012em] sm:text-3xl">{title}</Tag>
      {href && link && (
        <a href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
          {link}
          <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      )}
    </div>
  );
}
