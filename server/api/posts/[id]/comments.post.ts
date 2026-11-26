// Cria o comentário no Django (POST /api/comentario/ em FormData), com até 5 imagens em "midia".
export default defineEventHandler(async (event) => {
  const post_original = Number(getRouterParam(event, 'id'))
  const { fields, files } = await readUpload(event)
  const conteudo = (fields.text ?? '').trim()
  if (!conteudo) throw createError({ statusCode: 400, message: 'Escreva um comentário.' })
  const midia = files.midia ?? []
  checkUpload(midia, { max: 5, mb: 5, exts: IMG_EXT, label: 'o comentário' })
  const autor = currentUserId(event)
  try {
    return await django(event, '/comentario/', { method: 'POST', body: toDjangoForm({ autor, post_original, conteudo }, midia) })
  } catch (e) { fail(e, 'Não foi possível comentar.') }
})
