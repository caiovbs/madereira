// Helpers compartilhados pelos scripts de seed e smoke test. Só usam a API HTTP.
export const API = process.env.API_URL ?? 'http://localhost:3000';

export async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body: json, data: json?.data };
}

export const get = (p) => call('GET', p);
export const post = (p, b) => call('POST', p, b);
export const patch = (p, b) => call('PATCH', p, b);

/** Falha alto se a chamada não deu certo. */
export async function must(promise, what) {
  const r = await promise;
  if (!r.ok) {
    throw new Error(`${what} falhou (${r.status}): ${JSON.stringify(r.body)}`);
  }
  return r.data;
}

/** Data local (não UTC) em AAAA-MM-DD, deslocada em dias. */
export function isoDay(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
