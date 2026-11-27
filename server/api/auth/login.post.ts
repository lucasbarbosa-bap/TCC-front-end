// Login no Django (POST /api/auth/login/, JSON). O back-end devolve id, username, avatar e biografia.
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const name = String(username ?? '').trim()
  if (!name || !password) throw createError({ statusCode: 400, message: 'Preencha usuário e senha.' })

  let res: any
  try {
    res = await django(event, '/auth/login/', { method: 'POST', body: { username: name, password } })
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    if ([400, 401, 403].includes(code)) throw createError({ statusCode: 401, message: 'Usuário ou senha inválidos.' })
    fail(e, 'O servidor não respondeu. Tente de novo em instantes.')
  }

  if (res?.id == null) {
    throw createError({ statusCode: 502, message: 'O back-end não devolveu o id do usuário no login.' })
  }
  const user = String(res?.username ?? name)
  startSession(event, user, Number(res.id))
  return { user, id: Number(res.id), avatar: mediaUrl(event, res?.avatar), bio: String(res?.biografia ?? '') }
})
