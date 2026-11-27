// Seguir (POST /api/usuarios/<id>/seguir/). Exige o token JWT guardado no login.
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, message: 'Usuário inválido.' })
  currentUserId(event)   // 401 se não estiver logado
  if (!getCookie(event, 'token')) throw createError({ statusCode: 401, message: 'Sua sessão expirou. Entre de novo para seguir.' })
  try {
    await django(event, `/usuarios/${id}/seguir/`, { method: 'POST' })
  } catch (e: any) {
    // 400 = já segue (ou é você mesmo): para o site, o resultado final é o mesmo
    if ((e?.statusCode ?? e?.response?.status) === 400 && /já|ja|seguindo/i.test(String(e?.data?.mensagem ?? e?.data?.erro ?? ''))) return { ok: true }
    fail(e, 'Não foi possível seguir este usuário.')
  }
  return { ok: true }
})
