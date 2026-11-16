export default defineEventHandler(async (event) => {
  const post_original = Number(getRouterParam(event, 'id'))
  const { text } = await readBody(event)
  const conteudo = String(text ?? '').trim()
  if (!conteudo) throw createError({ statusCode: 400, message: 'Escreva um comentário.' })
  const autor = currentUserId(event)
  try {
    return await django(event, '/comentario/', { method: 'POST', body: { autor, post_original, conteudo } })
  } catch (e) { fail(e, 'Não foi possível comentar.') }
})
