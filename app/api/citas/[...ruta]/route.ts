/* API pública de la página de citas (/citas). */
import { book, calendar, digits, prettyDate, MEDIUM_LABEL, UserError } from '@/lib/citas/agenda';
import { db, DEMO, getConfig } from '@/lib/citas/db';
import { body, fail, json, route, str } from '@/lib/citas/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Type = { id: number; name: string; description: string; duration: number; mediums: string };

export const GET = route(async (req, [r]) => {
  const url = new URL(req.url);
  if (r === 'info') {
    const cfg = await getConfig();
    const types = await db.all<Type>('SELECT id,name,description,duration,mediums FROM atm_meeting_types WHERE active=1 ORDER BY sort,id');
    return json({
      demo: DEMO,
      owner: cfg.owner,
      welcome: cfg.welcome,
      timezone: cfg.timezone,
      whatsapp: cfg.whatsapp,
      mediums: MEDIUM_LABEL,
      types: types.map((t) => ({ ...t, mediums: t.mediums.split(',').map((m) => m.trim()).filter(Boolean) })),
    });
  }
  if (r === 'dias') {
    const t = await db.get<Type>('SELECT * FROM atm_meeting_types WHERE id=? AND active=1', Number(url.searchParams.get('tipo')));
    if (!t) return fail('Elige el tema de la llamada.');
    return json({ days: await calendar(t.duration) });
  }
  return fail('No encontrado', 404);
});

export const POST = route(async (req, [r]) => {
  const b = await body(req);
  if (r === 'reservar') {
    if (str(b.website)) return json({ ok: true }); // trampa para bots
    const name = str(b.name, 80);
    const phone = digits(b.phone).slice(0, 15);
    const email = str(b.email, 120);
    if (name.length < 2) throw new UserError('Escribe tu nombre para saber con quién hablamos.');
    if (phone.length < 10) throw new UserError('Revisa tu WhatsApp: necesita 10 dígitos, con lada.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError('Revisa tu correo o déjalo vacío.');
    const interests = Array.isArray(b.interests) ? b.interests.map((x) => str(x, 40)).filter(Boolean).slice(0, 8).join(',') : '';
    const a = await book({
      name, phone, email, interests,
      business: str(b.business, 100), industry: str(b.industry, 60), city: str(b.city, 60),
      type_id: Number(b.type_id), date: str(b.date, 10), time: str(b.time, 5), medium: str(b.medium, 20),
      topic: str(b.topic, 600), source: 'web',
    });
    if (!a) throw new Error('No se guardó la cita');
    return json({
      ok: true,
      appointment: {
        id: a.id, date: a.date, label: prettyDate(a.date), time: a.time, duration: a.duration,
        medium: a.medium, medium_label: MEDIUM_LABEL[a.medium] || a.medium, type_name: a.type_name, name: a.lead_name,
      },
    });
  }
  if (r === 'visita') {
    const ua = req.headers.get('user-agent') || '';
    if (/bot|crawl|spider|lighthouse|headless/i.test(ua)) return json({ ok: true });
    await db.run(
      'INSERT INTO atm_visits(session,path,referrer,device) VALUES(?,?,?,?)',
      str(b.session, 40), str(b.path, 120) || '/', str(b.referrer, 200), /mobi|android|iphone/i.test(ua) ? 'celular' : 'escritorio',
    );
    return json({ ok: true });
  }
  return fail('No encontrado', 404);
});
