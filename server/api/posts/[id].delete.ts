// Exclui um post. O servidor confere que o post é de quem está logado antes de apagar.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const me = currentUserId(event)
  let post: any
  try {
    post = (await django(event, `/postagem/${id}/`))?.Post
  } catch (e) { fail(e, 'Não foi possível encontrar o post.') }
  if (post?.autor?.id !== me) throw createError({ statusCode: 403, message: 'Você só pode excluir os seus próprios posts.' })
  try {
    await django(event, `/postagem/${id}/`, { method: 'DELETE' })
  } catch (e) { fail(e, 'Não foi possível excluir o post.') }
  clearFeedCache()
  return { ok: true }
})
