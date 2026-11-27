// Curtir: nunca cria duas curtidas da mesma pessoa no mesmo post.
export default defineEventHandler(async (event) => {
  const post = Number(getRouterParam(event, 'id'))
  const autor = currentUserId(event)
  try {
    const all = list(await django(event, '/interacao/'), 'Interações')
    const jaCurtiu = all.some((n: any) => n.tipo === 'like' && Number(n.post_id) === post && Number(n.autor_id) === autor)
    if (!jaCurtiu) await django(event, '/interacao/', { method: 'POST', body: { autor, post, tipo: 'like' } })
    clearFeedCache()
    return { ok: true }
  } catch (e) { fail(e, 'Não foi possível curtir.') }
})
