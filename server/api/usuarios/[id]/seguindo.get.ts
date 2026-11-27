export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  try {
    const res = await $fetch(`https://seu-django.onrender.com/api/usuarios/${id}/seguindo/`)
    return res
  } catch (e) {
    fail(e, 'Erro ao carregar a lista de quem você segue.')
  }
})