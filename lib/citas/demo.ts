/* Datos de ejemplo para el MODO DEMOSTRACIÓN (sin base conectada). No se usan con Turso. */
import { db } from './db';
import { addDays, book, calendar, logActivity, nowMx } from './agenda';
import { ingest } from './chats';

export async function seedDemo() {
  const types = await db.all<{ id: number; duration: number }>('SELECT id,duration FROM atm_meeting_types ORDER BY sort');
  const days = (await calendar(30)).filter((d) => d.slots.length);
  const ej: [string, string, string, string, string, string, number, number, string, string][] = [
    ['Dra. Karla Méndez', '9221234567', 'Clínica Dental Sonríe', 'Consultorio o salud', 'Coatzacoalcos', 'CRM,Chatbot WhatsApp', 0, 1, 'meet', 'confirmada'],
    ['Luis Ortega', '9229876543', 'Tacos El Güero', 'Restaurante o comida', 'Minatitlán', 'Sistema POS,Menú QR', 3, 0, 'llamada', 'pendiente'],
    ['Mariana Ruiz', '5512345678', 'Estética Mariana', 'Servicios profesionales', 'CDMX', 'Página web,Comerciales en video', 2, 1, 'whatsapp', 'pendiente'],
    ['Héctor Salas', '9211112233', 'Hotel Los Pinos', 'Hotel o turismo', 'Acayucan', 'Página web', 0, 2, 'llamada', 'confirmada'],
  ];
  for (const [i, [name, phone, business, industry, city, interests, ti, di, medium, status]] of ej.entries()) {
    const day = days[di];
    const t = types[ti];
    if (!day || !t) continue;
    try {
      await book({ name, phone, business, industry, city, interests, type_id: t.id, date: day.date, time: day.slots[i % day.slots.length], medium, status, source: i % 2 ? 'whatsapp' : 'web' });
    } catch { /* horario ocupado */ }
  }
  // Una llamada pasada ya realizada y un prospecto ganado, para que el resumen tenga números.
  const ayer = addDays(nowMx().date, -2);
  const r = await db.run(
    "INSERT INTO atm_leads(name,phone,business,industry,city,interests,stage,value,source) VALUES('Dr. Ramón Cruz','9223334455','Denti Cruz','Consultorio o salud','Minatitlán','CRM,Página web','ganado',8500,'web')");
  await db.run("INSERT INTO atm_appointments(lead_id,type_id,date,time,duration,medium,status,source) VALUES(?,?,?,?,30,'meet','realizada','web')", r.id, types[1]?.id ?? null, ayer, '11:00');
  await logActivity(r.id, 'nota', 'Le encantó el chatbot. Cerró paquete CRM + página.');
  await db.run(
    "INSERT INTO atm_leads(name,phone,business,industry,city,interests,stage,value,source,next_follow) VALUES('Paola Vidal','9225556677','Little Boutique','Tienda o comercio','Veracruz','Página web,Tienda online','propuesta',4500,'referido',?)",
    addDays(nowMx().date, 1));
  for (let i = 0; i < 14; i++) {
    const n = 6 + ((i * 7) % 11);
    for (let k = 0; k < n; k++)
      await db.run("INSERT INTO atm_visits(session,path,device,created_at) VALUES(?,?,?,?)", `demo${i}-${k}`, k % 3 ? '/' : '/citas', k % 4 ? 'celular' : 'escritorio', `${addDays(nowMx().date, -i)} 12:00:00`);
  }
  const t = Date.now();
  const min = 60000;
  await ingest([
    {
      jid: '5215512345678@s.whatsapp.net', name: 'Dra. Fernanda Ríos', stage: 'demo', created_ts: t - 50 * min,
      data: { nombre: 'Dra. Fernanda Ríos', consultorio: 'Dental Ríos', ciudad: 'CDMX' },
      messages: [
        { from: 'cliente', text: 'Hola, vi su anuncio. Info por favor', ts: t - 50 * min },
        { from: 'bot', text: '¡Hola, doctora! Con gusto. Somos A Tu Medida Tech y el CRM Dental es un sistema que le instalamos listo para usar: página web, agenda de citas en línea y un asistente que atiende su WhatsApp 24/7.', ts: t - 49 * min },
        { from: 'bot', text: 'Para platicarle lo que más le sirva, ¿cuál es el nombre de su consultorio y en qué ciudad está?', ts: t - 49 * min + 2000 },
        { from: 'cliente', text: 'Dental Ríos, en CDMX. ¿Cuánto cuesta?', ts: t - 47 * min },
        { from: 'bot', text: 'El CRM Dental cuesta *$2,999 MXN* en un solo pago por la instalación y configuración completa. El hosting y mantenimiento cuestan *$499 MXN al año*.', ts: t - 46 * min },
        { from: 'sistema', text: '[acción: demo]', ts: t - 46 * min + 1000 },
        { from: 'cliente', text: '¿Me pueden llamar mañana en la tarde?', ts: t - 12 * min },
        { from: 'bot', text: 'Claro, doctora. Le aviso a un asesor para que le marque mañana en la tarde. ¿A qué hora le queda mejor?', ts: t - 11 * min },
      ],
    },
    {
      jid: '5219221234567@s.whatsapp.net', name: 'Luis Ortega', stage: 'asesor', created_ts: t - 26 * 60 * min,
      data: { nombre: 'Luis', negocio: 'Tacos El Güero', ciudad: 'Minatitlán' },
      messages: [
        { from: 'cliente', text: 'Buenas, ¿hacen sistemas de punto de venta para taquería?', ts: t - 26 * 60 * min },
        { from: 'bot', text: 'Sí, hacemos sistemas POS a la medida: caja, tickets, inventario y reportes desde tu celular. ¿Cuántas cajas manejas?', ts: t - 26 * 60 * min + 60000 },
        { from: 'cliente', text: 'Una nada más', ts: t - 25 * 60 * min },
        { from: 'humano', text: 'Hola Luis, soy Joel. Te marco en 10 minutos para platicarte.', ts: t - 24 * 60 * min },
      ],
    },
    {
      jid: '128838585254040@lid', name: '', stage: 'nuevo', created_ts: t - 3 * min,
      messages: [
        { from: 'cliente', text: 'Hola, quiero probar el asistente para mi consultorio', ts: t - 3 * min },
        { from: 'bot', text: '¡Hola! Con gusto le muestro cómo funciona. ¿Cómo se llama su consultorio?', ts: t - 2 * min },
      ],
    },
  ]);
}
