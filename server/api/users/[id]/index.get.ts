// Perfil público de qualquer usuário (GET /api/usuarios/<id>/): foto, biografia e contadores.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, message: 'Usuário inválido.' })
  let res: any
  try {
    res = await django(event, `/usuarios/${id}/`)
  } catch (e) { fail(e, 'Não foi possível carregar o perfil.') }
  const u = res?.mensagem ?? {}
  return {
    id: u.id ?? id,
    user: String(u.username ?? ''),
    avatar: mediaUrl(event, u.avatar),
    bio: String(u.biografia ?? ''),
    following: Number(u.seguindo ?? 0),
    followers: Number(u.seguidores ?? 0)
  }
})
