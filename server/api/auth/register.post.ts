export default defineEventHandler(async (event) => {
  const { username, password, email } = await readBody(event)
  if (!username || !password || !email) {
    throw createError({ statusCode: 400, message: 'Preencha todos os campos.' })
  }

  // Envia os dados direto para a rota do Django
  const res = await django(event, '/registar/', { 
    method: 'POST', 
    body: { username, password, email } 
  })
console.log('funcionou')
  return res

})
