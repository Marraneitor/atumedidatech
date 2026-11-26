'use client';

import { Fragment } from 'react';
import { usePrefs } from '@/lib/prefs';
import { PROJECTS, type Project } from '@/lib/projects';
import { Icon, Reveal, WhatsAppIcon } from './ui';

/* Inicio: qué hacemos en una frase, trabajo real y un solo llamado a la acción. Poco texto a propósito. */
export default function Home() {
  const { t, lang, price, wa, f } = usePrefs();
  const s = t.site;
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4);
  const words = s.hero.title.split(' ');

  return (
    <>
      <section id="inicio" className="relative isolate overflow-hidden pt-44 pb-16 sm:pt-48 sm:pb-20 xl:pt-40">
        <HeroBackdrop />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h1 key={lang} className="max-w-4xl font-display text-[2.6rem] leading-[1.06] font-extrabold tracking-[-0.022em] text-balance sm:text-6xl lg:text-[4.1rem] xl:text-7xl">
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="inline-block overflow-hidden pb-[.1em] align-bottom">
                    <span
                      className={`inline-block animate-rise motion-reduce:animate-fade-up ${i >= words.length - 2 ? 'text-gradient' : ''}`}
                      style={{ animationDelay: `${80 + i * 70}ms` }}
                    >
                      {w}
                    </span>
                  </span>
                  {i < words.length - 1 && ' '}
                </Fragment>
              ))}
            </h1>
            <p className="mt-6 max-w-[52ch] animate-fade-up text-lg leading-relaxed text-pretty text-muted [animation-delay:.45s] sm:text-xl">{s.hero.sub}</p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:.55s] sm:flex-row">
              <a href={wa(t.wa.general)} target="_blank" rel="noopener noreferrer" className="group relative inline-flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-ink px-7 text-base font-semibold text-bg transition hover:bg-white">
                <WhatsAppIcon className="size-5" />
                {s.hero.cta1}
              </a>
              <a href="#portafolio" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line bg-white/[.03] px-7 text-base font-semibold text-ink transition hover:bg-white/[.08]">
                {s.hero.cta2}
                <Icon name="arrow" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <ul className="mt-10 flex animate-fade-up flex-wrap gap-x-8 gap-y-2 text-sm text-dim [animation-delay:.65s]">
              {s.hero.facts.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-accent" />
                  {f(x, { price: price('landing') })}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <Showcase items={featured} />
          </div>
        </div>

        {/* Dominios de clientes: prueba de que los proyectos existen */}
        <div className="mx-auto mt-16 max-w-7xl animate-fade-up px-5 [animation-delay:.9s] sm:mt-20 sm:px-8">
          <p className="text-xs font-medium tracking-[.08em] text-dim uppercase">{s.hero.trust}</p>
          <div className="relative mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
              {[0, 1].flatMap((k) =>
                DOMAINS.map((d) => (
                  <li key={`${k}-${d}`} aria-hidden={k === 1 || undefined}>
                    <a href={`https://${d}`} target="_blank" rel="noopener noreferrer" tabIndex={k === 1 ? -1 : undefined} className="inline-flex items-center gap-2 font-display text-lg font-semibold whitespace-nowrap text-ink/70 transition-colors hover:text-accent sm:text-xl">
                      <span className="size-1.5 rounded-full bg-accent" />
                      {d}
                    </a>
                  </li>
                )),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Trabajo reciente */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Head title={s.recent.title} href="#portafolio" link={s.recent.all} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      <p className="mt-1 text-sm font-medium text-accent">{host(p.url)}</p>
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

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');
const DOMAINS = ['clinicaruahtijuana.com', 'instintos.com.mx', 'srsburger.com', 'beautymina.lat', 'gestia.rest', 'websightsanalytics.com'];

/* Fondo del inicio: luz de marca, retícula en perspectiva y un destello que cruza una sola vez. Solo transform y opacity. */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-[30%] left-[-10%] h-[70vh] w-[70vw] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,.22),transparent)] motion-reduce:animate-none" />
      <div className="absolute top-[10%] right-[-15%] h-[70vh] w-[60vw] animate-aurora-slow rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,.2),transparent)] motion-reduce:animate-none" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] [perspective:600px]">
        <div className="absolute inset-x-[-50%] bottom-[-20%] h-[160%] origin-bottom animate-grid [transform:rotateX(62deg)] bg-[linear-gradient(rgba(56,189,248,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.16)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_top,#000_10%,transparent_75%)] motion-reduce:animate-none" />
      </div>
      <div className="absolute inset-y-0 left-0 w-1/3 animate-beam bg-gradient-to-r from-transparent via-white/[.07] to-transparent motion-reduce:hidden" />
    </div>
  );
}

/* Capturas reales de los proyectos destacados, en abanico 3D: entran una por una y flotan. */
const FAN = [
  'left-[0%] top-[18%] z-10 [--r:-8deg]',
  'left-[22%] top-[0%] z-20 [--r:-3deg]',
  'left-[8%] top-[46%] z-30 [--r:2deg]',
  'left-[36%] top-[32%] z-40 [--r:6deg]',
];
function Showcase({ items }: { items: Project[] }) {
  return (
    <div className="relative mx-auto aspect-[10/8] w-full max-w-[620px] [perspective:1600px]">
      <div className="absolute inset-0 [transform:rotateX(10deg)_rotateY(-16deg)] [transform-style:preserve-3d]">
        {/* el primero de la lista queda al frente */}
        {items.slice(0, 4).reverse().map((p, i) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group absolute w-[64%] ${FAN[i]}`}
          >
            <div className="animate-deal motion-reduce:animate-fade-up" style={{ animationDelay: `${300 + i * 160}ms` }}>
              <div className="animate-float motion-reduce:animate-none" style={{ animationDelay: `${i * -1.7}s` }}>
                <div className="overflow-hidden rounded-xl border border-white/15 bg-bg-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8),0_0_0_1px_rgba(56,189,248,.08)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] [transform:rotate(var(--r))] group-hover:[transform:rotate(0deg)_translateY(-8px)_scale(1.04)]">
                  <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[.04] px-3 py-2">
                    <span className="size-2 rounded-full bg-white/20" />
                    <span className="size-2 rounded-full bg-white/20" />
                    <span className="size-2 rounded-full bg-white/20" />
                    <span className="ml-2 truncate rounded-full bg-white/[.06] px-2.5 py-0.5 text-[10px] text-dim sm:text-[11px]">{host(p.url)}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/img/projects/${p.id}.webp`} alt={p.name} width={960} height={600} className="block aspect-[16/10] w-full object-cover object-top" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
