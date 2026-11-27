import type { H3Event } from 'h3'
import { isError } from 'h3'

/** Garante uma URL válida: com https:// e sem barra no final. Avisa se a variável não foi definida. */
function baseUrl(raw: unknown): string {
  let u = String(raw ?? '').trim()
  if (!u) {
    throw createError({
      statusCode: 500,
      message: 'Back-end não configurado: defina a variável NUXT_DJANGO_API no arquivo .env (ex.: https://seu-servico.onrender.com/api).'
    })
  }
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  return u.replace(/\/+$/, '')
}

/** Chama o back-end Django. O Render gratuito pode demorar a acordar, por isso o limite longo. */
export async function django<T = any>(event: H3Event, path: string, opts: any = {}) {
  const cfg = useRuntimeConfig(event)
  const token = getCookie(event, 'token')
  return $fetch<T>(path, {
    baseURL: baseUrl(cfg.djangoApi),
    timeout: 60000,
    retry: 0,
    ...opts,
    headers: { ...(token ? { Authorization: `${cfg.djangoAuthScheme} ${token}` } : {}), ...opts.headers }
  })
}

/** Converte um erro do Django em um erro do Nuxt com mensagem amigável (e registra o motivo no terminal). */
export function fail(e: any, fallback: string): never {
  if (isError(e)) throw e   // erros nossos (ex.: back-end não configurado) passam direto
  const code = e?.statusCode ?? e?.response?.status
  console.error('[django]', code ?? 'sem resposta', e?.cause?.code ?? e?.name ?? '', e?.message ?? e)
  const detail = e?.data?.detail || e?.data?.mensagem || e?.data?.message || e?.data?.erro
  if (typeof detail === 'string' && detail) {
    throw createError({ statusCode: code >= 400 && code < 600 ? code : 502, message: detail })
  }
  if (!code || [502, 503, 504].includes(code)) {
    throw createError({ statusCode: 503, message: 'O servidor está acordando ou indisponível. Aguarde cerca de 1 minuto e tente de novo.' })
  }
  throw createError({ statusCode: code, message: fallback })
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

// O back-end não tem campos de matéria e de tipo do post: guardamos os dois no fim do texto, como "#Matemática #Pergunta".
export function joinTag(text: string, tag?: string, tipo?: string) {
  const h = (v?: string) => (v ? '#' + String(v).trim().replace(/\s+/g, '_') : '')
  const trailer = [h(tag), h(tipo)].filter(Boolean).join(' ')
  return trailer ? `${text}\n\n${trailer}` : text
}
// Atenção: ao viajar em FormData (multipart) as quebras de linha viram \r\n, por isso o \r? aqui.
export function splitTag(content: string) {
  const m = content.match(/\r?\n\r?\n#([^\s#]+)(?:[ \t]+#([^\s#]+))?\s*$/)
  return m
    ? { text: content.slice(0, m.index), tag: m[1].replace(/_/g, ' '), tipo: (m[2] ?? '').replace(/_/g, ' ') }
    : { text: content, tag: 'Geral', tipo: '' }
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
