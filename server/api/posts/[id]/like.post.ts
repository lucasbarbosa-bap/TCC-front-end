export default defineEventHandler(async (event) => {
  const post = Number(getRouterParam(event, 'id'))
  const autor = currentUserId(event)
  try {
    return await django(event, '/interacao/', { method: 'POST', body: { autor, post, tipo: 'like' } })
  } catch (e) { fail(e, 'Não foi possível curtir.') }
})
