'use client';

import { useEffect } from 'react';

/* Cuenta una visita por página y sesión para el resumen del panel. Sin cookies ni datos personales. */
export default function VisitBeacon() {
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/panel') || path.startsWith('/pantalla')) return;
    let session = '';
    try {
      session = sessionStorage.getItem('atm_s') || '';
      if (!session) {
        session = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('atm_s', session);
      }
      const key = 'atm_v' + path;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      session = 'x' + Math.random().toString(36).slice(2);
    }
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '';
    fetch('/api/citas/visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, path, referrer: ref }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
