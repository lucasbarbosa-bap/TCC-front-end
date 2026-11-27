export default defineEventHandler(async (event) => {
  const conversa = Number(getRouterParam(event, 'id'))
  const { text } = await readBody(event)
  const conteudo = String(text ?? '').trim()
  if (!conteudo) throw createError({ statusCode: 400, message: 'Escreva uma mensagem.' })
  const autor = currentUserId(event)
  try {
    return await django(event, '/mensagem/', { method: 'POST', body: { autor, conversa, conteudo } })
  } catch (e) { fail(e, 'Não foi possível enviar a mensagem.') }
})
