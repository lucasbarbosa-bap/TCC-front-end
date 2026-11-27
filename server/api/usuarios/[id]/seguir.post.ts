export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  try {
    const res = await $fetch(`https://seu-django.onrender.com/api/usuarios/${id}/seguir/`, {
      method: 'POST',
      headers: {
        Cookie: event.node.req.headers.cookie || ''
      }
    })
    return res
  } catch (e) {
    fail(e, 'Erro ao realizar ação de seguir/deixar de seguir.')
  }
})