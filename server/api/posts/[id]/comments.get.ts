// Comentários de um post (o Django devolve por post).
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  let data: any
  try {
    data = await commentsRequest(event, id)
  } catch (e) { fail(e, 'Não foi possível carregar os comentários.') }
  return list(data, 'Comentarios').map((c: any) => ({
    id: c.id,
    n: c.autor?.nome ?? 'usuário removido',
    authorId: c.autor?.id ?? null,
    avatar: mediaUrl(event, c.autor?.avatar),
    t: c.conteudo ?? '',
    media: mediaList(event, c.midia),
    time: ago(c.data_criacao)
  }))
})
