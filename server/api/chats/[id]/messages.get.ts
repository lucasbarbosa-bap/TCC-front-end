export default defineEventHandler(async (event) => {
  const me = currentUserId(event)
  const id = Number(getRouterParam(event, 'id'))
  let data: any
  try {
    data = await django(event, '/mensagem/', { query: { conversa: id } })
  } catch (e) { fail(e, 'Não foi possível carregar as mensagens.') }

  return list(data, 'Mensagens')
    .filter((m: any) => String(m.conversa ?? id) === String(id))
    .sort((a: any, b: any) => +new Date(a.data_criacao) - +new Date(b.data_criacao))
    .map((m: any) => ({
      id: m.id,
      mine: String(m.autor?.id ?? m.autor_id) === String(me),
      text: m.conteudo ?? '',
      at: new Date(m.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    }))
})
