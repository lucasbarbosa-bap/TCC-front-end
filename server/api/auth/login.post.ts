export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const name = String(username ?? '').trim()
  if (!name || !password) throw createError({ statusCode: 400, message: 'Preencha usuário e senha.' })

  const cfg = useRuntimeConfig(event)
  let djangoRes: any
  try {
    // Usa $fetch.raw para pegar tanto os dados (_data) quanto os headers (set-cookie)
    const baseURL = String(cfg.djangoApi).replace(/\/+$/, '')
    djangoRes = await $fetch.raw(`${baseURL}/auth/login/`, { 
      method: 'POST', 
      body: { username: name, password }
    })
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    if ([400, 401, 403].includes(code)) throw createError({ statusCode: 401, message: 'Usuário ou senha inválidos.' })
    fail(e, 'O servidor não respondeu. Tente de novo em instantes.')
  }

  const res = djangoRes._data
  // Log no terminal do Nuxt para vermos exatamente o que o Django devolveu no login
  console.log('[LOGIN DJANGO]', res)

  if (res?.id == null) {
    throw createError({ statusCode: 502, message: 'O back-end não devolveu o id do usuário no login.' })
  }

  // 1. Se o Django devolveu um token no JSON, salva no cookie 'token'
  const token = res?.token || res?.access || res?.key
  if (token) {
    setCookie(event, 'token', String(token), { httpOnly: true, path: '/', sameSite: 'lax' })
  }

  // 2. Se o Django mandou cookie de sessão (sessionid), repassa para o navegador
  const setCookieHeader = djangoRes.headers.get('set-cookie')
  if (setCookieHeader) {
    appendResponseHeader(event, 'set-cookie', setCookieHeader)
  }

  const user = String(res?.username ?? name)
  startSession(event, user, Number(res.id))
  return { user, id: Number(res.id), avatar: mediaUrl(event, res?.avatar), bio: String(res?.biografia ?? '') }
})