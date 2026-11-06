'use client';

import { useEffect, useRef } from 'react';

/*
  Fondo de agua: gotas que caen donde pasa el mouse y forman ondas.
  Simulación de ondas en una malla pequeña (1/CELL de la pantalla) que se escala con CSS.
  - Solo pinta mientras hay ondas; en reposo no consume nada.
  - Mouse: gotas al moverlo. Pantallas táctiles: gota al tocar.
  - Se apaga con prefers-reduced-motion y se pausa con la pestaña oculta.
*/
const CELL = 6; // px de pantalla por celda
const DAMP = 0.968; // cuánto dura la onda
const ACCENT = [56, 189, 248];

export default function WaterRipple() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cur = new Float32Array(0);
    let prev = new Float32Array(0);
    let img: ImageData | null = null;
    let raf = 0;
    let running = false;
    let quiet = 0;
    let lastDrop = 0;
    let lastX = -1;
    let lastY = -1;

    const resize = () => {
      w = Math.ceil(window.innerWidth / CELL) + 2;
      h = Math.ceil(window.innerHeight / CELL) + 2;
      canvas.width = w;
      canvas.height = h;
      // cada celda mide CELL px; el borde de 1 celda queda fuera de la pantalla
      canvas.style.width = `${w * CELL}px`;
      canvas.style.height = `${h * CELL}px`;
      cur = new Float32Array(w * h);
      prev = new Float32Array(w * h);
      img = ctx.createImageData(w, h);
    };

    const drop = (px: number, py: number, strength: number, radius: number) => {
      const cx = Math.round(px / CELL) + 1;
      const cy = Math.round(py / CELL) + 1;
      const r2 = radius * radius;
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const d2 = x * x + y * y;
          if (d2 > r2) continue;
          const xx = cx + x;
          const yy = cy + y;
          if (xx < 1 || yy < 1 || xx >= w - 1 || yy >= h - 1) continue;
          // gota con forma de campana: sin bordes duros
          cur[yy * w + xx] += strength * Math.cos((Math.sqrt(d2) / radius) * (Math.PI / 2));
        }
      }
      start();
    };

    const step = () => {
      // ecuación de onda clásica con dos búferes
      let energy = 0;
      for (let y = 1; y < h - 1; y++) {
        const row = y * w;
        for (let x = 1; x < w - 1; x++) {
          const i = row + x;
          const v = ((cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w]) / 2 - prev[i]) * DAMP;
          prev[i] = v;
          energy += v < 0 ? -v : v;
        }
      }
      const t = cur;
      cur = prev;
      prev = t;
      return energy;
    };

    const paint = () => {
      if (!img) return;
      const d = img.data;
      for (let y = 1; y < h - 1; y++) {
        const row = y * w;
        for (let x = 1; x < w - 1; x++) {
          const i = row + x;
          // pendiente de la superficie → luz reflejada (brillo) y sombra
          const sx = cur[i - 1] - cur[i + 1];
          const sy = cur[i - w] - cur[i + w];
          const light = sx * 0.6 + sy * 0.9; // luz desde arriba a la izquierda
          const o = i * 4;
          if (light > 0) {
            const a = Math.min(light * 2.6, 150);
            const hi = Math.min(light / 60, 1); // las crestas más fuertes tienden a blanco
            d[o] = ACCENT[0] + (255 - ACCENT[0]) * hi * 0.5;
            d[o + 1] = ACCENT[1] + (255 - ACCENT[1]) * hi * 0.5;
            d[o + 2] = ACCENT[2];
            d[o + 3] = a;
          } else {
            d[o] = 0;
            d[o + 1] = 4;
            d[o + 2] = 12;
            d[o + 3] = Math.min(-light * 0.8, 45);
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = () => {
      const e = step();
      paint();
      // se detiene sola cuando el agua queda quieta
      quiet = e < 0.5 ? quiet + 1 : 0;
      if (quiet > 20) {
        running = false;
        cur.fill(0);
        prev.fill(0);
        ctx.clearRect(0, 0, w, h);
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    function start() {
      if (running || document.hidden) return;
      running = true;
      quiet = 0;
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      if (now - lastDrop < 28 || dist < 10) return;
      lastDrop = now;
      lastX = e.clientX;
      lastY = e.clientY;
      // gota principal donde está el mouse y, a veces, una gotita cerca: lluvia
      drop(e.clientX, e.clientY, Math.min(50 + dist * 0.7, 130), 3);
      if (Math.random() < 0.35) {
        const ang = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 60;
        drop(e.clientX + Math.cos(ang) * r, e.clientY + Math.sin(ang) * r, 45, 2);
      }
    };

    const onDown = (e: PointerEvent) => {
      drop(e.clientX, e.clientY, 160, 5);
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (cur.some((v) => v !== 0)) start();
    };

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        running = false;
        resize();
      }, 150);
    };

    resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    const onReduce = () => {
      if (reduce.matches) {
        cancelAnimationFrame(raf);
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };
    reduce.addEventListener('change', onReduce);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      reduce.removeEventListener('change', onReduce);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed -z-10 motion-reduce:hidden"
      style={{ left: -CELL, top: -CELL }}
    />
  );
}
