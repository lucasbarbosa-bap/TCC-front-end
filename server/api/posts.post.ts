export default defineEventHandler(async (event) => {
  const { fields, files } = await readUpload(event)
  const t = (fields.text ?? '').trim()
  if (!t) throw createError({ statusCode: 400, message: 'Escreva a sua pergunta.' })
  
  const midia = files.midia ?? []
  checkUpload(midia, { max: 20, mb: 40, exts: [...IMG_EXT, ...VIDEO_EXT], label: 'o post' })
  
  const autor = currentUserId(event)
  try {
    const res = await django(event, '/postagem/', {
      method: 'POST',
      body: toDjangoForm({ 
        titulo: t.length > 60 ? t.slice(0, 57) + '…' : t, 
        conteudo: joinTag(t, fields.tag, fields.tipo), 
        autor 
      }, midia)
    })
    clearFeedCache()
    return res
  } catch (e: any) {
    // Isto vai imprimir o erro exato do Django no terminal do VS Code
    console.error('--- ERRO DETALHADO DO DJANGO ---', e?.data || e?.response?._data || e.message)
    fail(e, 'Não foi possível publicar.')
  }
})