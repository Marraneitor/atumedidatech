'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePrefs } from '@/lib/prefs';
import type { Dict } from '@/lib/i18n';
import { Icon } from './ui';

/* Navegación por pestañas: cada sección del sitio es un panel y se cambia de izquierda a derecha.
   Todos los paneles están en el HTML (para buscadores); los que no están activos llevan `hidden`. */

export const TABS = [
  { id: 'inicio', nav: 'home' },
  { id: 'portafolio', nav: 'work' },
  { id: 'soluciones', nav: 'services' },
  { id: 'paquetes', nav: 'packages' },
  { id: 'precios', nav: 'pricing' },
  { id: 'contacto', nav: 'contact' },
] as const satisfies readonly { id: string; nav: keyof Dict['nav'] }[];

export type TabId = (typeof TABS)[number]['id'];

type TabsCtx = { active: TabId; dir: 1 | -1; go: (id: TabId) => void };
const Ctx = createContext<TabsCtx | null>(null);

export function useTabs() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTabs fuera de TabsProvider');
  return v;
}

const indexOf = (id: string) => TABS.findIndex((t) => t.id === id);

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<TabId>('inicio');
  const [dir, setDir] = useState<1 | -1>(1);
  const activeRef = useRef<TabId>('inicio');

  const show = useCallback((id: TabId, target?: HTMLElement | null) => {
    const prev = activeRef.current;
    if (id !== prev) {
      setDir(indexOf(id) >= indexOf(prev) ? 1 : -1);
      activeRef.current = id;
      setActive(id);
    }
    // Espera a que el panel sea visible para mover la vista.
    requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>(`[data-tab="${id}"]`);
      const deep = target && panel && target !== panel && panel.firstElementChild !== target;
      if (deep) target.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  // Cualquier enlace #algo del sitio abre la pestaña que lo contiene.
  const fromHash = useCallback(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return show('inicio');
    const el = document.getElementById(id);
    const tab = el?.closest<HTMLElement>('[data-tab]')?.dataset.tab as TabId | undefined;
    if (tab) show(tab, el);
  }, [show]);

  useEffect(() => {
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [fromHash]);

  const go = useCallback(
    (id: TabId) => {
      if (location.hash !== `#${id}`) history.pushState(null, '', id === 'inicio' ? location.pathname + location.search : `#${id}`);
      show(id);
    },
    [show],
  );

  useEffect(() => {
    const onPop = () => fromHash();
    // Enlaces internos (#precios, #contacto…): cambian de pestaña sin saltar a un panel oculto.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const id = a?.getAttribute('href')?.slice(1);
      if (!a || !id || !document.getElementById(id)?.closest('[data-tab]')) return;
      e.preventDefault();
      if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
      fromHash();
    };
    window.addEventListener('popstate', onPop);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick);
    };
  }, [fromHash]);

  return <Ctx.Provider value={{ active, dir, go }}>{children}</Ctx.Provider>;
}

/** Barra de segmentos. En celular se desliza de lado y la pestaña activa siempre queda a la vista. */
export function TabBar({ className = '' }: { className?: string }) {
  const { t } = usePrefs();
  const { active, go } = useTabs();
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const box = list.current;
    if (el && box && box.scrollWidth > box.clientWidth) {
      box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    const i = indexOf(active);
    let n = -1;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = TABS.length - 1;
    if (n < 0) return;
    e.preventDefault();
    go(TABS[n].id);
    list.current?.querySelector<HTMLElement>(`[data-id="${TABS[n].id}"]`)?.focus();
  };

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={t.tabs.label}
      onKeyDown={onKey}
      className={`no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-white/[.03] p-1 ${className}`}
    >
      {TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-id={tab.id}
            id={`tab-${tab.id}`}
            aria-selected={on}
            aria-controls={`panel-${tab.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => go(tab.id)}
            className={`relative h-9 shrink-0 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 xl:px-4 ${
              on ? 'bg-white/[.1] text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.nav[tab.nav]}
            {on && <span aria-hidden className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

/** Un panel: visible solo si su pestaña está activa. Entra deslizándose desde el lado al que vas. */
export function TabPanel({ id, children, pad = true }: { id: TabId; children: React.ReactNode; pad?: boolean }) {
  const { active, dir } = useTabs();
  const on = active === id;
  return (
    <div
      id={`panel-${id}`}
      data-tab={id}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={!on}
      className={`${on ? (dir === 1 ? 'animate-tab-next' : 'animate-tab-prev') : ''} ${pad ? 'pt-20 xl:pt-8' : ''}`}
    >
      {children}
      <TabPager id={id} />
    </div>
  );
}

function TabPager({ id }: { id: TabId }) {
  const { t } = usePrefs();
  const { go } = useTabs();
  const i = indexOf(id);
  const prev = TABS[i - 1];
  const next = TABS[i + 1];
  return (
    <nav aria-label={t.tabs.label} className="mx-auto flex max-w-7xl gap-3 px-5 pb-16 sm:px-8">
      {prev && (
        <button type="button" onClick={() => go(prev.id)} className="surface group flex min-h-16 flex-1 items-center gap-3 rounded-2xl px-5 text-left transition hover:bg-white/[.06]">
          <Icon name="arrow" className="size-4 shrink-0 rotate-180 text-dim transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="min-w-0">
            <span className="block text-xs text-dim">{t.tabs.prev}</span>
            <span className="block truncate font-medium text-ink">{t.nav[prev.nav]}</span>
          </span>
        </button>
      )}
      {next && (
        <button type="button" onClick={() => go(next.id)} className="surface group ml-auto flex min-h-16 flex-1 items-center justify-end gap-3 rounded-2xl px-5 text-right transition hover:bg-white/[.06]">
          <span className="min-w-0">
            <span className="block text-xs text-dim">{t.tabs.next}</span>
            <span className="block truncate font-medium text-ink">{t.nav[next.nav]}</span>
          </span>
          <Icon name="arrow" className="size-4 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      )}
    </nav>
  );
}
