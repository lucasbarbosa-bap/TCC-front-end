// Usa o login do Django e guarda a sessão em cookies que o navegador não consegue ler.

async function findId(event: any, name: string) {
  try {
    const [p, c] = await Promise.all([django(event, '/postagem/'), django(event, '/comentario/')])
    const all = [...list(p, 'Postagens'), ...list(c, 'Comentarios')]
    return all.find((x: any) => x.autor?.nome === name)?.autor?.id ?? null
  } catch { return null }
}

export default defineEventHandler(async (event) => {
  const { username, password, email} = await readBody(event)
  if (!username || !password) throw createError({ statusCode: 400, message: 'Preencha usuário e senha.' })
    

  let res: any
  try {
    res = await django(event, '/auth/register', { method: 'POST', body: { username, password, email } })
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    if ([400, 401, 403].includes(code)) throw createError({ statusCode: 401, message: 'Usuário ou senha inválidos.' })
    fail(e, 'O servidor não respondeu. Tente de novo em instantes.')
  }
  

  // Tenta os nomes mais comuns; ajuste aqui se o seu login devolver outros campos.
  const token = res?.access ?? res?.token ?? res?.key ?? res?.access_token
  let id = res?.id ?? res?.user?.id ?? res?.usuario?.id ?? res?.user_id ?? res?.autor?.id ?? null
  const name = String(res?.username ?? res?.user?.username ?? res?.nome ?? username)
  if (id == null) id = await findId(event, name)

  const opts = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: !import.meta.dev, maxAge: 60 * 60 * 24 * 7 }
  if (token) setCookie(event, 'token', token, opts)
  setCookie(event, 'uname', name, opts)
  if (id != null) setCookie(event, 'uid', String(id), opts)
  return { user: name, id }
 }

)


