// Cria o comentário no Django (FormData), com até 5 imagens em "midia". O post vai na URL.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const { fields, files } = await readUpload(event)
  const conteudo = (fields.text ?? '').trim()
  if (!conteudo) throw createError({ statusCode: 400, message: 'Escreva um comentário.' })
  const midia = files.midia ?? []
  checkUpload(midia, { max: 5, mb: 5, exts: IMG_EXT, label: 'o comentário' })
  const autor = currentUserId(event)
  try {
    const res = await commentsRequest(event, id, { method: 'POST', body: toDjangoForm({ autor, conteudo }, midia) })
    clearFeedCache()
    return res
  } catch (e: any) {
    console.error('[ERRO COMENTARIO DJANGO DATA]:', e?.data)
    fail(e, 'Não foi possível comentar.')
  }
})