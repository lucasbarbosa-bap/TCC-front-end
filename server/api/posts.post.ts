// Cria o post no Django (POST /api/postagem/ em FormData), com até 10 fotos ou vídeos em "midia".
export default defineEventHandler(async (event) => {
  const { fields, files } = await readUpload(event)
  const t = (fields.text ?? '').trim()
  if (!t) throw createError({ statusCode: 400, message: 'Escreva algo para publicar.' })
  const midia = files.midia ?? []
  checkUpload(midia, { max: 10, mb: 20, exts: [...IMG_EXT, ...VIDEO_EXT], label: 'o post' })
  const autor = currentUserId(event)
  try {
    return await django(event, '/postagem/', {
      method: 'POST',
      body: toDjangoForm({ titulo: t.length > 60 ? t.slice(0, 57) + '…' : t, conteudo: joinTag(t, fields.tag), autor }, midia)
    })
  } catch (e) { fail(e, 'Não foi possível publicar.') }
})
