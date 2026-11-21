# Agenda de llamadas y panel de ventas

Basado en el CRM dental, adaptado a llamadas de venta de A TU MEDIDA TECH.

- **`/citas`**: página pública. El prospecto elige tema, día, hora y medio (llamada, WhatsApp, Meet…), deja sus datos y recibe botones para confirmar por WhatsApp y agregar la cita a su calendario. Con `?tema=demo` abre directo un tema cuyo nombre contenga "demo".
- **`/panel`**: panel privado (no aparece en Google).
  - **Resumen**: llamadas de hoy y de la semana, por confirmar, prospectos nuevos, ventas cerradas, asistencia, dinero en negociación, visitantes del sitio y conversión de `/citas`.
  - **Agenda**: llamadas por día, cambio de estado (por confirmar, confirmada, realizada, no asistió, cancelada), reprogramar, enlace de Meet, notas y botón para confirmar por WhatsApp con el mensaje ya escrito.
  - **Prospectos**: embudo (nuevo → contactado → llamada agendada → propuesta → ganado/perdido), valor estimado, fecha de seguimiento, historial de notas y exportación a Excel (CSV).
  - **Conversaciones**: los chats que va contestando el chatbot de WhatsApp (atumedida-bot), con lo que escribe el cliente, lo que contesta el bot y lo que contestas tú. Desde ahí abres el chat en WhatsApp o pasas el contacto a Prospectos. Es de solo lectura: el bot sigue corriendo en la PC o la Mac.
  - **Horarios y ajustes**: horario por día con descanso, días bloqueados, intervalo, anticipación mínima, días hacia adelante, enlace fijo de Meet, temas de llamada y contraseña.

Código: `app/citas`, `app/panel`, `app/api/citas`, `app/api/panel`, `components/citas`, `components/panel`, `lib/citas`. Las tablas llevan prefijo `atm_`.

## Activarlo en Vercel (una sola vez)

Sin estas variables el sitio funciona en **modo demostración**: datos de ejemplo que se borran solos, contraseña `demo` y un aviso en `/citas` de que las citas aún no se guardan.

1. **Base de datos (Turso)**. En Vercel → proyecto `atumedidatech` → Storage → Connect Database → Turso → crea una base nueva (por ejemplo `atumedidatech-citas`). Vercel agrega solo `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
   - Si prefieres otra base que ya tengas, usa `CITAS_DB_URL` y `CITAS_DB_TOKEN` (tienen prioridad sobre las de Turso).
2. **Contraseña del panel**. Settings → Environment Variables → `PANEL_PASSWORD` con la contraseña que quieras (8 o más caracteres). Solo se usa la primera vez; después se cambia desde el panel.
3. **Conversaciones del bot**. `BOT_SYNC_KEY` con una clave larga al azar (24 o más caracteres).
4. Redeploy. Las tablas y los temas de llamada se crean solos en la primera visita.

## Conectar el chatbot de WhatsApp

En la carpeta del bot (`atumedida-bot`):

1. Copia `extras/bot/sync-panel.js` de este repositorio a `src/` y agrega en `src/index.js`, después de `iniciarPanel();`:
   ```js
   import('./sync-panel.js').then((m) => m.iniciarSyncPanel()).catch((e) => console.error('[panel]', e.message));
   ```
2. En `.env`:
   ```
   PANEL_SYNC_URL=https://atumedidatech.online
   PANEL_SYNC_KEY=<la misma BOT_SYNC_KEY de Vercel>
   ```
3. Reinicia el bot. Al arrancar manda todas las conversaciones y después cada mensaje nuevo a los pocos segundos. Si el panel no responde, el bot sigue contestando igual y reintenta cada minuto.

## Pruebas locales

```
npm run dev            # modo demostración, contraseña "demo"
```

Las horas se calculan en hora del centro de México aunque el servidor esté en UTC.
