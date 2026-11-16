export default defineEventHandler(async (event) => {
  const { text, tag } = await readBody(event)
  const t = String(text ?? '').trim()
  if (!t) throw createError({ statusCode: 400, message: 'Escreva algo para publicar.' })
  const autor = currentUserId(event)
  try {
    return await django(event, '/postagem/', {
      method: 'POST',
      body: { titulo: t.length > 60 ? t.slice(0, 57) + '…' : t, conteudo: joinTag(t, tag), autor }
    })
  } catch (e) { fail(e, 'Não foi possível publicar.') }
})
