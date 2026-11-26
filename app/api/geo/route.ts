/* País del visitante según su IP. Vercel lo manda en la cabecera x-vercel-ip-country.
   Se usa para elegir la divisa por defecto (lib/prefs.tsx). */
export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return Response.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
