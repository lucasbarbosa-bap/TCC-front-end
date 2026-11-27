// Deixar de seguir (DELETE /api/usuarios/<id>/seguir/). Exige o token JWT.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, message: 'Usuário inválido.' })
  currentUserId(event)
  if (!getCookie(event, 'token')) throw createError({ statusCode: 401, message: 'Sua sessão expirou. Entre de novo.' })
  try {
    await django(event, `/usuarios/${id}/seguir/`, { method: 'DELETE' })
  } catch (e: any) {
    // 400 = já não seguia: tudo bem
    if ((e?.statusCode ?? e?.response?.status) === 400) return { ok: true }
    fail(e, 'Não foi possível deixar de seguir.')
  }
  return { ok: true }
})
