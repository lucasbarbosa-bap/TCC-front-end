// Descurtir: apaga no banco a(s) curtida(s) do usuário logado neste post.
// Se ele tiver curtidas repetidas, apaga todas (limpa o que já ficou duplicado).
export default defineEventHandler(async (event) => {
  const post = Number(getRouterParam(event, 'id'))
  const me = currentUserId(event)

  let mine: any[]
  try {
    const all = list(await django(event, '/interacao/', { query: { autor: me, post } }), 'Interações')
    mine = all.filter((n: any) => n.tipo === 'like' && Number(n.post_id) === post && Number(n.autor_id) === me)
  } catch (e) { fail(e, 'Não foi possível remover a curtida.') }

  if (mine.some((n: any) => n.id == null)) {
    throw createError({ statusCode: 501, message: 'O back-end precisa devolver o "id" de cada interação para poder remover a curtida.' })
  }
  try {
    await Promise.all(mine.map((n: any) => django(event, `/interacao/${n.id}/`, { method: 'DELETE' })))
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    if (code === 404 || code === 405) {
      throw createError({ statusCode: 501, message: 'O back-end ainda não tem a rota DELETE /api/interacao/<id>/ para remover curtidas.' })
    }
    fail(e, 'Não foi possível remover a curtida.')
  }
  return { removidas: mine.length }
})
