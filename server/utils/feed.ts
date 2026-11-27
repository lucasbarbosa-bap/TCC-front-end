import type { H3Event } from 'h3'

type Raw = { posts: any[]; inter: any[] }

// Guarda por alguns segundos o que o Django devolveu, para não consultar o back-end (e o banco)
// a cada visitante. Pedidos simultâneos dividem a mesma consulta.
const TTL = 15_000
let cache: { at: number; data: Raw } | null = null
let inflight: Promise<Raw> | null = null

export function clearFeedCache() { cache = null }

export async function feedRaw(event: H3Event): Promise<Raw> {
  if (cache && Date.now() - cache.at < TTL) return cache.data
  if (!inflight) {
    inflight = Promise.all([django(event, '/postagem/'), django(event, '/interacao/')])
      .then(([p, i]) => {
        const data: Raw = { posts: list(p, 'Postagens'), inter: list(i, 'Interações') }
        cache = { at: Date.now(), data }
        return data
      })
      .finally(() => { inflight = null })
  }
  try {
    return await inflight
  } catch (e) {
    if (cache) return cache.data   // back-end fora do ar ou dormindo: mostra o último feed conhecido
    throw e
  }
}
