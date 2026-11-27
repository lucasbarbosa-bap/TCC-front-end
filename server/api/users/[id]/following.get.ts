// Lista quem o usuário segue (GET /api/usuarios/<id>/seguindo/).
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, message: 'Usuário inválido.' })
  let res: any
  try {
    res = await django(event, `/usuarios/${id}/seguindo/`)
  } catch (e) { fail(e, 'Não foi possível carregar quem o usuário segue.') }
  return list(res, 'seguindo').map((u: any) => ({ id: u.id, user: String(u.username ?? ''), avatar: mediaUrl(event, u.avatar) }))
})
