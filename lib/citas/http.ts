import { NextResponse } from 'next/server';
import { UserError } from './agenda';
import { db, ready } from './db';

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export const fail = (msg: string, status = 400) => json({ error: msg }, status);

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export const str = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);

type Handler = (req: Request, parts: string[]) => Promise<Response>;

/** Envuelve un manejador: base lista, errores legibles y nunca un 500 sin mensaje. */
export function route(fn: Handler) {
  return async (req: Request, ctx: { params: Promise<{ ruta?: string[] }> }) => {
    try {
      await ready();
      const { ruta = [] } = await ctx.params;
      return await fn(req, ruta);
    } catch (e) {
      if (e instanceof UserError) return fail(e.message);
      console.error('[citas]', e);
      return fail('Algo falló de nuestro lado. Intenta de nuevo en un momento.', 500);
    }
  };
}

export const COOKIE = 'atm_panel';
export function tokenOf(req: Request) {
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return m?.[1] || '';
}
export async function isAuthed(req: Request) {
  const t = tokenOf(req);
  if (!t) return false;
  const s = await db.get<{ token: string }>(
    "SELECT token FROM atm_sessions WHERE token=? AND created_at > datetime('now','-6 hours','-30 days')", t);
  return !!s;
}
