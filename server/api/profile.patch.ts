// Atualiza foto e/ou biografia (PATCH /api/usuarios/<id>/, FormData).
export default defineEventHandler(async (event) => {
  const { fields, files } = await readUpload(event)
  const avatar = files.avatar ?? []
  checkUpload(avatar, { max: 1, mb: 5, exts: IMG_EXT, label: 'a foto de perfil' })
  const bio = fields.biografia
  if (!avatar.length && bio === undefined) throw createError({ statusCode: 400, message: 'Nada para atualizar.' })

  const id = currentUserId(event)
  const body = toDjangoForm({}, avatar, 'avatar')
  if (bio !== undefined) body.append('biografia', bio)   // aceita texto vazio (apagar a biografia)
  try {
    await django(event, `/usuarios/${id}/`, { method: 'PATCH', body })
  } catch (e) { fail(e, 'Não foi possível salvar o perfil.') }
  clearFeedCache()   // os posts passam a mostrar a foto nova
  return { ok: true }
})
