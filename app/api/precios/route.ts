/* Precios y paquetes vigentes, en un solo lugar, para el chatbot de WhatsApp (atumedida-bot).
   Sale de lib/config.ts (precios) y lib/i18n.ts (nombres y textos en español), así que se
   actualiza solo con cada cambio publicado del sitio. ?formato=texto da la versión para el prompt. */
import { SITE } from '@/lib/config';
import { DICTS, fill } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const mxn = (n: number) => '$' + n.toLocaleString('es-MX') + ' MXN';
const P = SITE.prices;

function data() {
  const t = DICTS.es;
  const servicios = t.pricing.plans.map((p) => ({
    nombre: p.name,
    precio: p.key ? mxn(P[p.key]) : 'A cotizar',
    unidad: p.unit,
    extra: p.extraKey ? fill(p.extra, { price: mxn(P[p.extraKey]) }) : p.extra,
    descripcion: p.desc,
    incluye: p.f,
  }));
  const keys = [['start', 'start_month'], ['growth', 'growth_month'], ['full', 'full_month']];
  const paquetes = t.plus.bundles.map((b, i) => ({
    nombre: b.name,
    incluye: b.items,
    pago_inicial: mxn(P[keys[i][0]]),
    mensual: mxn(P[keys[i][1]]),
  }));
  const plus = {
    nombre: `${t.plus.name} (${t.plus.tagline})`,
    implementacion: `${mxn(P.plus)} ${t.plus.setupUnit}`,
    mensual: `${mxn(P.plus_month)} ${t.plus.monthUnit}`,
    resumen: t.plus.sub,
    incluye: t.plus.blocks.map((b) => `${b.t}: ${b.items.map((x) => x[0]).join(', ')}`),
    letras_pequenas: t.plus.fine,
  };
  return {
    actualizado: new Date().toISOString(),
    fuente: `${SITE.url}/#precios`,
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
