// Descurtir: apaga no banco a(s) curtida(s) do usuário logado neste post.
// O back-end ainda precisa oferecer um jeito de apagar (veja LEIA-ME): por id (DELETE /interacao/<id>/,
// com o "id" no GET) ou por dados (DELETE /interacao/ com autor, post e tipo no corpo).
export default defineEventHandler(async (event) => {
  const post = Number(getRouterParam(event, 'id'))
  const me = currentUserId(event)

  let mine: any[]
  try {
    const all = list(await django(event, '/interacao/'), 'Interações')
    mine = all.filter((n: any) => n.tipo === 'like' && Number(n.post_id) === post && Number(n.autor_id) === me)
  } catch (e) { fail(e, 'Não foi possível remover a curtida.') }
  if (!mine.length) return { removidas: 0 }

  try {
    if (mine.every((n: any) => n.id != null)) {
      await Promise.all(mine.map((n: any) => django(event, `/interacao/${n.id}/`, { method: 'DELETE' })))
    } else {
      await django(event, '/interacao/', { method: 'DELETE', body: { autor: me, post, tipo: 'like' } })
    }
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    if (code === 404 || code === 405) {
      throw createError({ statusCode: 501, message: 'O back-end ainda não permite remover curtidas (falta a rota DELETE de interação).' })
    }
    fail(e, 'Não foi possível remover a curtida.')
  }
  clearFeedCache()
  return { removidas: mine.length }
})
