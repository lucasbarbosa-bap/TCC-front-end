export default defineEventHandler((event) => {
  for (const k of ['token', 'uname', 'uid']) deleteCookie(event, k, { path: '/' })
  return { ok: true }
})
