// O back-end atual responde só "ok" (200) ou "inválido" (401) no login: não devolve id nem token.
// Por isso, depois de conferir a senha, descobrimos o id do usuário e guardamos a sessão em cookies.

// Pergunta ao back-end "quem é o usuário N?" (GET /usuarios/N/), de 10 em 10, até achar o nome.
async function findIdByScan(event: any, name: string): Promise<number | null> {
  const BATCH = 10
  for (let start = 1; start <= 300; start += BATCH) {
    const found = await Promise.all(Array.from({ length: BATCH }, async (_, i) => {
      const id = start + i
      try {
        const r: any = await django(event, `/usuarios/${id}/`, { timeout: 15000 })
        return { id, nome: String(r?.mensagem ?? '') }
      } catch { return { id, nome: '' } }
    }))
    const hit = found.find(x => x.nome === name)
    if (hit) return hit.id
    if (found.every(x => !x.nome)) return null   // lote inteiro vazio: não há mais usuários
  }
  return null
}

// Plano B: procura o nome entre os autores de posts e comentários.
async function findIdByContent(event: any, name: string): Promise<number | null> {
  try {
    const [p, c] = await Promise.all([django(event, '/postagem/'), django(event, '/comentario/')])
    const all = [...list(p, 'Postagens'), ...list(c, 'Comentarios')]
    return all.find((x: any) => x.autor?.nome === name)?.autor?.id ?? null
  } catch { return null }
}

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

  // Se o back-end passar a devolver id, username ou token, usamos; senão descobrimos o id.
  const token = res?.access ?? res?.token ?? res?.key ?? res?.access_token
  const user = String(res?.username ?? res?.user?.username ?? name)
  let id: number | null = res?.id ?? res?.user?.id ?? null
  if (id == null) id = (await findIdByScan(event, user)) ?? (await findIdByContent(event, user))
  if (id == null) {
    throw createError({ statusCode: 502, message: 'Login confirmado, mas não foi possível identificar sua conta no servidor. Tente de novo.' })
  }

  startSession(event, user, Number(id), token)
  return { user, id: Number(id) }
})
