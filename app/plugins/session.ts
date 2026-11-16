// Ao abrir o site, descobre se a pessoa já estava logada (cookie), antes de desenhar a tela.
export default defineNuxtPlugin({
  name: 'session',
  dependsOn: ['pinia'],
  async setup() {
    const auth = useAuthStore()
    await callOnce('session', async () => {
      const me = await useRequestFetch()<{ user: string; id: number | null }>('/api/auth/me').catch(() => null)
      if (me) auth.setSession(me.user, me.id)
    })
  }
})
