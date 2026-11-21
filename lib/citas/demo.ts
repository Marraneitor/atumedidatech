/* Datos de ejemplo para el MODO DEMOSTRACIÓN (sin base conectada). No se usan con Turso. */
import { db } from './db';
import { addDays, book, calendar, logActivity, nowMx } from './agenda';

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
}
