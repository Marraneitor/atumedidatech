'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SITE, type Lang } from './config';
import { DICTS, fill, type Dict } from './i18n';

type Prefs = {
  lang: Lang;
  setLang: (l: Lang) => void;
  currency: string;
  setCurrency: (c: string) => void;
  t: Dict;
  f: typeof fill;
  price: (key: string) => string;
  wa: (text: string) => string;
};

const Ctx = createContext<Prefs | null>(null);

const store = {
  get(k: string) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string) {
    try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ }
  },
};

function prettyRound(n: number) {
  if (n <= 0) return n;
  const digits = n >= 1000 ? 3 : 2;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - digits + 1);
  return Math.round(n / p) * p;
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  const [currency, setCurState] = useState<string>(SITE.baseCurrency);
  const [rates, setRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(SITE.currencies).map(([k, v]) => [k, v.rate])),
  );

  // Idioma y divisa iniciales: ?lang= → guardado → navegador
  useEffect(() => {
    const codes = SITE.languages.map((l) => l.code);
    const q = new URLSearchParams(location.search).get('lang') as Lang | null;
    const saved = store.get('atm_lang') as Lang | null;
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase() as Lang;
    const l = [q, saved, nav].find((x): x is Lang => !!x && codes.includes(x)) ?? 'es';
    setLangState(l);

    const savedCur = store.get('atm_cur');
    if (savedCur && SITE.currencies[savedCur]) {
      setCurState(savedCur);
    } else {
      const region = (navigator.language || '').split('-')[1]?.toUpperCase();
      const byRegion = region && SITE.regionCurrency[region];
      if (byRegion) setCurState(byRegion);
      else if (l !== 'es') setCurState('USD');
    }

    fetch(SITE.liveRatesUrl)
      .then((r) => r.json())
      .then((d) => {
        if (d?.result !== 'success' || !d.rates) return;
        setRates((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(next)) if (typeof d.rates[k] === 'number') next[k] = d.rates[k];
          return next;
        });
      })
      .catch(() => { /* se usan las tasas de respaldo */ });
  }, []);

  useEffect(() => {
    document.documentElement.lang = { es: 'es-MX', en: 'en', pt: 'pt-BR' }[lang];
    document.title = DICTS[lang].meta.title;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    store.set('atm_lang', l);
  }, []);
  const setCurrency = useCallback((c: string) => {
    setCurState(c);
    store.set('atm_cur', c);
  }, []);

  const price = useCallback(
    (key: string) => {
      const base = SITE.prices[key] ?? 0;
      const cfg = SITE.currencies[currency] ?? SITE.currencies.MXN;
      const override = SITE.priceOverrides[key]?.[currency];
      const value = override ?? (currency === SITE.baseCurrency ? base : prettyRound(base * (rates[currency] ?? cfg.rate)));
      let s = new Intl.NumberFormat(cfg.locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
      }).format(value);
      if (s.includes('$')) s = `${s} ${currency}`;
      return s;
    },
    [currency, rates],
  );

  const wa = useCallback(
    (text: string) => `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(text)}`,
    [],
  );

  const value = useMemo<Prefs>(
    () => ({ lang, setLang, currency, setCurrency, t: DICTS[lang], f: fill, price, wa }),
    [lang, setLang, currency, setCurrency, price, wa],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs fuera de PrefsProvider');
  return v;
}
