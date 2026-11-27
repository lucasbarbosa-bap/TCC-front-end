// Lista quem segue o usuário (GET /api/usuarios/<id>/seguidores/).
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, message: 'Usuário inválido.' })
  let res: any
  try {
    res = await django(event, `/usuarios/${id}/seguidores/`)
  } catch (e) { fail(e, 'Não foi possível carregar os seguidores.') }
  return list(res, 'seguidores').map((u: any) => ({ id: u.id, user: String(u.username ?? ''), avatar: mediaUrl(event, u.avatar) }))
})
