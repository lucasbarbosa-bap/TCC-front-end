import type { H3Event } from 'h3'

// No back-end novo os comentários são pedidos por post (o id do post vai na URL).
// Não sabemos o desenho exato da URL, então tentamos os mais comuns e lembramos qual funcionou.
// Para fixar um caminho, defina NUXT_COMMENTS_PATH (ex.: /comentario/{id}/).
const CANDIDATES = ['/comentario/{id}/', '/postagem/{id}/comentarios/', '/comentarios/{id}/', '/postagem/{id}/comentario/']
let chosen: string | null = null

export async function commentsRequest<T = any>(event: H3Event, id: number, opts: any = {}): Promise<T> {
  const forced = String(useRuntimeConfig(event).commentsPath || '').trim()
  const tries = forced ? [forced] : chosen ? [chosen] : CANDIDATES
  let last: any
  for (const tpl of tries) {
    try {
      const res = await django<T>(event, tpl.replace('{id}', String(id)), opts)
      chosen = tpl
      return res
    } catch (e: any) {
      const code = e?.statusCode ?? e?.response?.status
      // 404 com {"erro": ...} = a rota existe (o post é que não existe). 404 sem corpo = rota errada: tenta a próxima.
      if (code === 404 && !e?.data?.erro && tries.length > 1) { last = e; continue }
      throw e
    }
  }
  throw last
}
