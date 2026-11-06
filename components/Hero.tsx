'use client';

import { Fragment } from 'react';
import { usePrefs } from '@/lib/prefs';
import { Icon, MagneticButton, WhatsAppIcon } from './ui';


/* Entrada del titular con CSS (no espera a JavaScript: el texto pinta en cuanto llega el HTML) */
function Words({ text, gradient = false, offset = 0 }: { text: string; gradient?: boolean; offset?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-top">
            <span
              className={`inline-block animate-rise ${gradient ? 'text-gradient pr-[0.04em]' : ''}`}
              style={{ animationDelay: `${0.05 + (offset + i) * 0.05}s` }}
            >
              {w}
            </span>
          </span>{' '}
        </Fragment>
      ))}
    </>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-[35%] left-[-10%] h-[90vh] w-[90vw] animate-aurora bg-[radial-gradient(closest-side,rgba(56,189,248,.22),transparent)]" />
      <div className="absolute top-[5%] right-[-20%] h-[80vh] w-[70vw] animate-aurora-slow bg-[radial-gradient(closest-side,rgba(59,130,246,.2),transparent)]" />
      {/* Malla en perspectiva, estática */}
      <div className="absolute inset-x-[-50%] top-[22%] h-[55%] [perspective:700px]">
        <div className="bg-grid absolute inset-0 origin-bottom [mask-image:linear-gradient(to_top,#000_10%,transparent_80%)] [transform:rotateX(62deg)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}

export default function Hero() {
  const { t, lang, price, wa } = usePrefs();
  const words1 = t.hero.t1.split(' ').length;

  return (
    <section id="inicio" className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <Background />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <span className="surface inline-flex animate-fade-up items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-[13px] text-muted">
          <span className="size-2 rounded-full bg-wa shadow-[0_0_0_4px_rgba(37,211,102,.15)]" />
          {t.hero.badge}
        </span>

        <h1
          key={lang}
          aria-label={`${t.hero.t1} ${t.hero.t2}`}
          className="mt-7 max-w-6xl font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.022em] text-balance sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem]"
        >
          <Words text={t.hero.t1} />
          <br />
          <Words text={t.hero.t2} gradient offset={words1} />
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <p className="max-w-[58ch] animate-fade-up text-lg leading-relaxed text-muted text-pretty [animation-delay:.25s] sm:text-xl">
              {t.hero.sub}
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:.35s] sm:flex-row sm:items-center">
              <MagneticButton href={wa(t.wa.general)} external className="sm:min-h-14 sm:px-8 sm:text-base">
                <WhatsAppIcon className="size-[18px]" />
                {t.hero.cta1}
              </MagneticButton>
              <MagneticButton href="#portafolio" variant="ghost" className="sm:min-h-14 sm:px-8 sm:text-base">
                {t.hero.cta2}
                <Icon name="arrow" className="size-4 rotate-90" />
              </MagneticButton>
            </div>
          </div>

          <dl className="grid animate-fade-up grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-left [animation-delay:.45s] lg:w-[440px]">
            {[
              { v: price('landing'), l: t.hero.priceL },
              { v: '200+', l: t.hero.projL },
              { v: '< 24 h', l: t.hero.replyL },
            ].map((x) => (
              <div key={x.l} className="flex flex-col gap-1 bg-bg-2 p-3 sm:p-4">
                <dt className="text-xs leading-snug text-dim">{x.l}</dt>
                <dd className="order-first font-display text-base font-bold whitespace-nowrap tabular-nums sm:text-xl">{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

    </section>
  );
}
