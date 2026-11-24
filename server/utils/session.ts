import type { H3Event } from 'h3'

/** Guarda a sessão em cookies que o navegador não consegue ler (httpOnly). */
export function startSession(event: H3Event, user: string, id: number, token?: string) {
  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: !import.meta.dev, maxAge: 60 * 60 * 24 * 7 }
  if (token) setCookie(event, 'token', token, opts)
  setCookie(event, 'uname', user, opts)
  setCookie(event, 'uid', String(id), opts)
}
