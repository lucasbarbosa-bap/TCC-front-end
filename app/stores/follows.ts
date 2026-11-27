import { defineStore } from 'pinia'

// Quem o usuário logado segue (ids). Vem do Django: GET /usuarios/<meu id>/seguindo/
export const useFollowsStore = defineStore('follows', {
  state: () => ({
    ids: [] as number[],
    loaded: false,
    busy: [] as number[]
  }),
  getters: {
    isFollowing: s => (id: number | null | undefined) => id != null && s.ids.includes(id)
  },
  actions: {
    async load() {
      const auth = useAuthStore()
      if (!auth.logged || auth.id == null) { this.reset(); return }
      try {
        const list = await $fetch<{ id: number }[]>(`/api/users/${auth.id}/following`)
        this.ids = list.map(u => Number(u.id))
        this.loaded = true
      } catch { /* a lista é opcional: os botões só aparecem como "Seguir" */ }
    },
    reset() { this.ids = []; this.loaded = false; this.busy = [] },

    // Seguir / deixar de seguir, com atualização imediata na tela (desfaz se o servidor recusar).
    async toggle(id: number | null | undefined) {
      const auth = useAuthStore()
      if (id == null || !auth.requireLogin()) return
      if (id === auth.id || this.busy.includes(id)) return
      const was = this.ids.includes(id)
      const bump = (n: number) => { auth.following = Math.max(0, auth.following + n) }
      if (was) this.ids = this.ids.filter(x => x !== id); else this.ids.push(id)
      bump(was ? -1 : 1)
      this.busy.push(id)
      try {
        await $fetch(`/api/users/${id}/follow`, { method: was ? 'DELETE' : 'POST' })
      } catch (e: any) {
        if (was) this.ids.push(id); else this.ids = this.ids.filter(x => x !== id)
        bump(was ? 1 : -1)
        useToast().show(errMsg(e, was ? 'Não foi possível deixar de seguir' : 'Não foi possível seguir'))
      } finally {
        this.busy = this.busy.filter(x => x !== id)
      }
    }
  }
})
