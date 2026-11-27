// Inicia (ou recupera) uma conversa com outro usuário, pelo nome de usuário.
export default defineEventHandler(async (event) => {
  const { user } = await readBody(event)
  const destinatario = String(user ?? '').trim()
  if (!destinatario) throw createError({ statusCode: 400, message: 'Informe o nome de usuário.' })
  const autor = currentUserId(event)
  try {
    const res: any = await django(event, '/conversa/', { method: 'POST', body: { autor, destinatario } })
    return { id: res.id, user: destinatario }
  } catch (e) { fail(e, 'Não foi possível iniciar a conversa.') }
})
