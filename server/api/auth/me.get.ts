// Diz ao site se já existe uma sessão (não chama o Django, então é rápida).
export default defineEventHandler((event) => {
  const user = getCookie(event, 'uname')
  const id = getCookie(event, 'uid')
  if (!user) throw createError({ statusCode: 401, message: 'Sem sessão.' })
  return { user, id: id ? Number(id) : null }
})
