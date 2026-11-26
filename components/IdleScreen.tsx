'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/* Protector de pantalla del sitio: si nadie mueve el mouse, toca, teclea ni hace scroll durante
   1 minuto, aparece el muro de proyectos de /pantalla. Cualquier movimiento lo quita. */
const Screen = dynamic(() => import('./pantalla/Screen'), { ssr: false });
const IDLE_MS = 60_000;
const EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;

export default function IdleScreen() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(t);
      t = setTimeout(() => setOn(true), IDLE_MS);
    };
    const wake = () => {
      setOn(false);
      arm();
    };
    const vis = () => (document.hidden ? clearTimeout(t) : arm());
    arm();
    EVENTS.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearTimeout(t);
      EVENTS.forEach((e) => window.removeEventListener(e, wake));
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return on ? <Screen overlay /> : null;
}
