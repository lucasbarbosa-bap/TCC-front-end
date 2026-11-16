import type { H3Event } from 'h3'

/** Chama o back-end Django. O Render gratuito pode demorar a acordar, por isso o limite longo. */
export function django<T = any>(event: H3Event, path: string, opts: any = {}) {
  const cfg = useRuntimeConfig(event)
  const token = getCookie(event, 'token')
  return $fetch<T>(path, {
    baseURL: cfg.djangoApi,
    timeout: 60000,
    retry: 0,
    ...opts,
    headers: { ...(token ? { Authorization: `${cfg.djangoAuthScheme} ${token}` } : {}), ...opts.headers }
  })
}

/** Converte um erro do Django em um erro do Nuxt com mensagem amigável. */
export function fail(e: any, fallback: string): never {
  const code = e?.statusCode ?? e?.response?.status
  const detail = e?.data?.detail || e?.data?.mensagem || e?.data?.message
  throw createError({
    statusCode: code >= 400 && code < 600 ? code : 502,
    message: typeof detail === 'string' && detail ? detail : fallback
  })
}

/** Id do usuário logado, vindo do cookie (o navegador não consegue alterar nem forjar). */
export function currentUserId(event: H3Event): number {
  const id = getCookie(event, 'uid')
  if (!id) throw createError({ statusCode: 401, message: 'Entre na sua conta para continuar.' })
  return Number(id)
}

/** O Django devolve listas dentro de uma chave ("Postagens", "Comentarios"...). */
export function list(data: any, key: string): any[] {
  if (Array.isArray(data)) return data
  return data?.[key] ?? data?.results ?? []
}

// O back-end ainda não tem campo de tag: guardamos a tag no fim do texto, como "#Python".
export function joinTag(text: string, tag?: string) {
  return tag ? `${text}\n\n#${String(tag).trim().replace(/\s+/g, '_')}` : text
}
export function splitTag(content: string) {
  const m = content.match(/\n\n#([^\s#]+)\s*$/)
  return m ? { text: content.slice(0, m.index), tag: m[1].replace(/_/g, ' ') } : { text: content, tag: 'Geral' }
}

export function ago(iso?: string) {
  if (!iso) return ''
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'agora'
  if (s < 3600) return `há ${Math.floor(s / 60)} min`
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`
  if (s < 172800) return 'ontem'
  return new Date(iso).toLocaleDateString('pt-BR')
}
