// Perfil de quem está logado: foto, biografia e números (GET /api/usuarios/<id>/).
export default defineEventHandler(async (event) => {
  const id = currentUserId(event)
  let res: any
  try {
    res = await django(event, `/usuarios/${id}/`)
  } catch (e) { fail(e, 'Não foi possível carregar o perfil.') }
  const u = res?.mensagem ?? {}
  return {
    id: u.id ?? id,
    user: u.username ?? getCookie(event, 'username') ?? '',
    avatar: mediaUrl(event, u.avatar),
    bio: String(u.biografia ?? ''),
    following: Number(u.seguindo ?? 0),
    followers: Number(u.seguidores ?? 0)
  }
})
