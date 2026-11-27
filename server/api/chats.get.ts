// Lista as conversas do usuário logado. Contrato esperado do Django: veja CHAT-BACKEND.md
export default defineEventHandler(async (event) => {
  const me = currentUserId(event)
  let data: any
  try {
    data = await django(event, '/conversa/', { query: { usuario: me } })
  } catch (e) { fail(e, 'Não foi possível carregar as conversas.') }

  return list(data, 'Conversas')
    .filter((c: any) => !c.participantes || c.participantes.some((p: any) => p.id === me))
    .map((c: any) => {
      const other = (c.participantes ?? []).find((p: any) => p.id !== me) ?? c.participantes?.[0]
      return { id: c.id, user: other?.nome ?? 'usuário' }
    })
})
