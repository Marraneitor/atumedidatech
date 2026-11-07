'use client';

import { usePrefs } from '@/lib/prefs';
import { Icon, MagneticButton, Reveal, SectionHead, WhatsAppIcon } from './ui';

/* Plan de 3 pasos (StoryBrand): quita la parálisis por decisión */
const ICONS = ['search', 'code', 'rocket'] as const;

export default function Steps() {
  const { t, wa } = usePrefs();
  const s = t.steps;
  return (
    <section id="pasos" className="relative border-y border-line bg-bg-2/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

        <div className="relative mt-12 sm:mt-16">
          {/* Línea que une los pasos en escritorio */}
          <span aria-hidden className="pointer-events-none absolute top-[52px] right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 md:block" />
        <ol className="relative grid gap-4 md:grid-cols-3 md:gap-5">
          {s.items.map((it, i) => (
            <Reveal as="li" key={it.t} delay={i * 0.08} className="relative flex flex-col rounded-[28px] border border-line bg-bg p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-accent font-display text-lg font-extrabold text-[#03111c] tabular-nums">
                  {i + 1}
                </span>
                <Icon name={ICONS[i]} className="size-5 text-dim" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.012em] sm:text-2xl">{it.t}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{it.d}</p>
            </Reveal>
          ))}
        </ol>
        </div>

        <Reveal delay={0.1} className="mt-10 flex">
          <MagneticButton href={wa(t.wa.general)} external className="w-full sm:w-auto sm:min-h-14 sm:px-8 sm:text-base">
            <WhatsAppIcon className="size-[18px]" />
            {s.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
