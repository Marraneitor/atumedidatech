# Sistema de diseño · A TU MEDIDA TECH

Reglas para cualquier cambio en el sitio. Los valores viven en `app/globals.css` (`@theme`) y en `components/ui.tsx`.

## Sensación
Técnica, confiable y cercana. Calidad de agencia con trato directo. Nunca "plantilla de IA".

## Color (por roles, regla 60·30·10)
| Rol | Token | Valor | Uso |
|---|---|---|---|
| Fondo (60%) | `bg` / `bg-2` | #05070d / #0a0e18 | Fondos de página y celdas |
| Superficie | `surface` | blanco 3% + borde `line` | Tarjetas |
| Texto | `ink` | #eef2f8 | Títulos y texto principal |
| Texto 2.º | `muted` | #a3b0c2 (8.6:1) | Párrafos secundarios |
| Notas | `dim` | #8b98ad (6.4:1) | Etiquetas, notas, pie |
| Acento (10%) | `accent` | #38bdf8 | Acciones, datos clave, foco |
| Marca profunda | `accent-2` | #3b82f6 | Solo dentro de degradados de marca |
| WhatsApp | `wa` | #25d366 | Solo para acciones de WhatsApp |

- Un solo acento, el azul del logo. **Prohibido el morado o violeta.**
- Todo texto pasa WCAG AA: 4.5:1 normal, 3:1 grande. Bordes de campos con `white/20` o más.

## Tipografía
- Dos familias: **Plus Jakarta Sans** (títulos, `font-display`) e **Inter** (texto y etiquetas).
- Títulos grandes: interlineado 1.04–1.1 y `tracking-[-0.03em]`. Etiquetas en mayúsculas: `tracking-[.08em]`.
- Párrafos de 65 caracteres como máximo (`max-w-[58ch]`/`65ch`) y `text-pretty`. Títulos con `text-balance`.

## Espaciado y retícula
- Escala de Tailwind en múltiplos de 4/8 px. Sin valores sueltos tipo 13 px.
- Textos alineados a la izquierda. El centrado solo para frases de una línea.
- Retícula de 12 columnas en escritorio (Servicios, Portafolio, Por qué).

## Profundidad
- Una estrategia: **fondo sutil + borde fino** (`surface`). Nada de sombras en tarjetas.
- El desenfoque (`glass-float`) es solo para lo que flota sobre contenido: el encabezado, el menú móvil y los avisos del inicio.

## Íconos e imágenes
- Íconos propios de un trazo (1.75, 24 px) en `components/ui.tsx`. Sin emojis. Logotipos de marca (WhatsApp, Facebook) rellenos.
- Las imágenes son **capturas reales** de proyectos: escritorio 960×600 en `public/assets/img/projects/` y celular 585×1266 en `public/assets/img/mobile/`. Siempre con `width`/`height`.

## Movimiento
- Solo con propósito: retroalimentación, continuidad, atención o carácter moderado.
- Curva de salida `cubic-bezier(.16,1,.3,1)`. Duraciones de `DUR`: 120, 220 y 380 ms, y 600 ms para apariciones al hacer scroll.
- Animar solo `transform` y `opacity`, nunca `filter: blur`.
- El titular del inicio entra con CSS (`animate-rise`), no con JS, para que el LCP no espere a la hidratación.
- `prefers-reduced-motion`: sin desplazamientos ni parallax, solo fundidos.

## Evitar siempre
- Degradados morado/azul, emojis como íconos, tarjetas idénticas de ícono + título + párrafo.
- Textos de marketing vacío: "potencia", "revoluciona", "siguiente nivel", "transforma tu presencia".
- Más de dos familias tipográficas. Párrafos centrados de más de dos líneas.

## Verificar antes de publicar
1. Capturas a 390 y 1440 px, sin scroll horizontal.
2. Lighthouse móvil: rendimiento y accesibilidad de 90 o más.
3. Teclado: todo alcanzable con Tab y con el foco visible.
4. Publicar con la skill `deploy-web` (push a `main`, con lo que Vercel despliega solo).
