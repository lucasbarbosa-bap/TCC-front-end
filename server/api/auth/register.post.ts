// Cria a conta no Django (POST /api/registar/, FormData, com foto opcional) e já deixa a pessoa logada.
export default defineEventHandler(async (event) => {
  const { fields, files } = await readUpload(event)
  const user = (fields.username ?? '').trim()
  const mail = (fields.email ?? '').trim()
  const password = fields.password ?? ''
  if (!user || !password) throw createError({ statusCode: 400, message: 'Preencha usuário e senha.' })

  const avatar = files.avatar ?? []
  checkUpload(avatar, { max: 1, mb: 5, exts: IMG_EXT, label: 'a foto de perfil' })

  let res: any
  try {
    res = await django(event, '/registar/', {
      method: 'POST',
      body: toDjangoForm({ username: user, email: mail, password }, avatar, 'avatar')
    })
  } catch (e: any) {
    const code = e?.statusCode ?? e?.response?.status
    const erro = e?.data?.erro || e?.data?.mensagem
    if (code === 400 && typeof erro === 'string') {
      throw createError({ statusCode: 400, message: /ja existe/i.test(erro) ? 'Este nome de usuário já está em uso.' : erro })
    }
    fail(e, 'Não foi possível criar a conta. Tente de novo em instantes.')
  }

  if (res?.id == null) {
    throw createError({ statusCode: 502, message: 'Conta criada, mas o servidor não devolveu o id. Entre com seu usuário e senha.' })
  }
  // o cadastro não devolve o token: fazemos o login em seguida para ter o JWT (necessário para seguir)
  let token: string | undefined
  try {
    const l = await django(event, '/auth/login/', { method: 'POST', body: { username: user, password } })
    if (l?.token) token = String(l.token)
  } catch { /* sem token: a pessoa entra mesmo assim e o token vem no próximo login */ }
  startSession(event, user, Number(res.id), token)

  // o cadastro não devolve a URL da foto: buscamos no perfil
  let url = ''
  if (avatar.length) {
    try { url = mediaUrl(event, (await django(event, `/usuarios/${res.id}/`))?.mensagem?.avatar) } catch { /* a foto aparece no próximo login */ }
  }
  return { user, id: Number(res.id), avatar: url, bio: '' }
})
