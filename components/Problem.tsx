'use client';

import { usePrefs } from '@/lib/prefs';
import { Icon, Reveal, SectionHead } from './ui';

/* StoryBrand: el cliente es el héroe y aquí nombramos su problema (externo, interno y filosófico) */
const ICONS = ['megaphone', 'leak', 'unlink'] as const;

export default function Problem() {
  const { t } = usePrefs();
  const p = t.problem;
  return (
    <section id="problema" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

        <ol className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-5">
          {p.items.map((it, i) => (
            <Reveal as="li" key={it.t} delay={i * 0.06} className="surface flex flex-col rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/[.07] text-amber-200">
                  <Icon name={ICONS[i]} className="size-5" />
                </span>
                <span className="font-display text-sm font-semibold text-dim tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.012em] sm:text-2xl">{it.t}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{it.d}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-col gap-5 rounded-[28px] border border-accent/30 bg-accent/[.06] p-6 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="max-w-[60ch] text-lg leading-relaxed text-ink text-pretty">{p.close}</p>
            <a
              href="#soluciones"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-bg transition hover:bg-white"
            >
              {p.closeCta}
              <Icon name="arrow" className="size-4 rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
