/* Precios y paquetes vigentes, en un solo lugar, para el chatbot de WhatsApp (atumedida-bot).
   Sale de lib/config.ts (precios) y lib/i18n.ts (nombres y textos en español), así que se
   actualiza solo con cada cambio publicado del sitio. ?formato=texto da la versión para el prompt. */
import { onSale, priceMXN, promoOn, SITE } from '@/lib/config';
import { DICTS, fill } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const mxn = (n: number) => '$' + n.toLocaleString('es-MX') + ' MXN';
/* Precio vigente; si la clave está en promoción, añade el precio normal para que el bot lo mencione. */
const pr = (k: string) => mxn(priceMXN(k)) + (onSale(k) ? ` (antes ${mxn(SITE.prices[k])}, ${SITE.promo.pct}% de descuento de Fin de año)` : '');

function data() {
  const t = DICTS.es;
  const servicios = t.pricing.plans.map((p) => ({
    nombre: p.name,
    precio: p.key ? pr(p.key) : 'A cotizar',
    unidad: p.unit,
    extra: p.extraKey ? fill(p.extra, { price: pr(p.extraKey) }) : p.extra,
    descripcion: p.desc,
    incluye: p.f,
  }));
  const keys = [['start', 'start_month'], ['growth', 'growth_month'], ['full', 'full_month']];
  const paquetes = t.plus.bundles.map((b, i) => ({
    nombre: b.name,
    incluye: b.items,
    pago_inicial: pr(keys[i][0]),
    mensual: pr(keys[i][1]),
  }));
  const plus = {
    nombre: `${t.plus.name} (${t.plus.tagline})`,
    implementacion: `${pr('plus')} ${t.plus.setupUnit}`,
    mensual: `${pr('plus_month')} ${t.plus.monthUnit}`,
    resumen: t.plus.sub,
    incluye: t.plus.blocks.map((b) => `${b.t}: ${b.items.map((x) => x[0]).join(', ')}`),
    letras_pequenas: t.plus.fine,
  };
  const fin = new Date(`${SITE.promo.until}T12:00:00-06:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const promocion = promoOn()
    ? {
        nombre: 'Promoción de Fin de año',
        descuento: `${SITE.promo.pct}%`,
        vigencia: `hasta el ${fin}`,
        aplica: 'Chatbot de WhatsApp y todos los paquetes (Arranque digital, Crecimiento, Negocio completo y Paquete Plus), en el pago inicial y en la mensualidad.',
        no_aplica: 'página web, página con base de datos, redes sociales, reels, tarjetas NFC, cursos ni sistemas a la medida (van a precio normal).',
      }
    : null;
  return {
    actualizado: new Date().toISOString(),
    fuente: `${SITE.url}/#precios`,
    promocion,
    nota: t.pricing.note,
    preferencial: t.pricing.pref,
    servicios,
    paquetes,
    plus,
    preguntas: t.trust.faq,
    citas: `${SITE.url}/citas`,
    whatsapp: SITE.contact.waDisplay,
    telefono: SITE.contact.phoneDisplay,
  };
}

function texto(d: ReturnType<typeof data>) {
  const l: string[] = [];
  l.push(`# PRECIOS VIGENTES DE A TU MEDIDA TECH (fuente: ${d.fuente}, generado ${d.actualizado})`);
  l.push('Usa SOLO estos precios. Si algo no está aquí, se cotiza a la medida.', '');
  if (d.promocion) {
    const p = d.promocion;
    l.push(`## ${p.nombre.toUpperCase()} (VIGENTE ${p.vigencia.toUpperCase()})`);
    l.push(`- ${p.descuento} de descuento en: ${p.aplica}`);
    l.push(`- No aplica en: ${p.no_aplica}`);
    l.push('- Los precios de abajo YA tienen el descuento. Cuando hables del chatbot o de un paquete, menciona la promoción de Fin de año y el precio de antes, y que es por tiempo limitado, sin presionar.');
    l.push('- Si preguntan si la mensualidad con descuento es para siempre, di que lo confirma el asesor al cerrar.', '');
  }
  l.push('## Servicios');
  for (const s of d.servicios)
    l.push(`- ${s.nombre}: ${s.precio}${s.unidad ? ' ' + s.unidad : ''}${s.extra ? '. ' + s.extra : ''}. ${s.descripcion} Incluye: ${s.incluye.join('; ')}.`);
  l.push('', '## Paquetes para empezar (precios + IVA)');
  for (const p of d.paquetes) l.push(`- ${p.nombre}: ${p.pago_inicial} de pago inicial + ${p.mensual} al mes. Incluye: ${p.incluye.join(', ')}.`);
  l.push('', `## ${d.plus.nombre}`, `- Implementación: ${d.plus.implementacion}`, `- Operación: ${d.plus.mensual}`, `- ${d.plus.resumen}`);
  for (const i of d.plus.incluye) l.push(`- ${i}`);
  for (const f of d.plus.letras_pequenas) l.push(`- ${f}`);
  l.push('', '## Notas', `- ${d.nota}`, `- ${d.preferencial}`);
  l.push('', '## Preguntas frecuentes');
  for (const q of d.preguntas) l.push(`- ${q.q} ${q.a}`);
  l.push('', `Agendar llamada: ${d.citas} · WhatsApp ${d.whatsapp} · Teléfono ${d.telefono}`);
  return l.join('\n');
}

export function GET(req: Request) {
  const d = data();
  const headers = { 'Cache-Control': 'public, max-age=0, s-maxage=300', 'Access-Control-Allow-Origin': '*' };
  if (new URL(req.url).searchParams.get('formato') === 'texto')
    return new Response(texto(d), { headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
  return Response.json(d, { headers });
}
