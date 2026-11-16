import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({ logged: false, guest: false, askLogin: false, user: '', id: null as number | null, avatar: '' }),
  getters: {
    display: (s): string => (s.logged ? s.user : 'Visitante')
  },
  actions: {
    // Login de verdade: o servidor do Nuxt confere no Django e guarda a sessão em cookie.
    async login(username: string, password: string) {
      const res = await $fetch<{ user: string; id: number | null }>('/api/auth/login', { method: 'POST', body: { username, password } })
      this.setSession(res.user, res.id)
    },
    setSession(user: string, id: number | null) {
      this.user = user; this.id = id
      this.logged = true; this.guest = false; this.askLogin = false
    },
    async logout() {
      try { await $fetch('/api/auth/logout', { method: 'POST' }) } catch { /* segue mesmo assim */ }
      this.logged = false; this.guest = false; this.askLogin = false; this.user = ''; this.id = null
    },
    browse() { this.guest = true; this.askLogin = false },
    // Ações que exigem conta chamam isto: sem login, abre o pop-up e devolve false.
    requireLogin(): boolean {
      if (this.logged) return true
      this.askLogin = true
      return false
    },
    setAvatar(data: string) {
      this.avatar = data
      try { localStorage.setItem('sinapse-avatar', data) } catch { /* sem armazenamento */ }
    },
    restore() {
      try { this.avatar = localStorage.getItem('sinapse-avatar') || '' } catch { /* sem armazenamento */ }
    }
  }
})
