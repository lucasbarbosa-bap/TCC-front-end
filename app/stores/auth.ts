import { defineStore } from 'pinia'

interface Session { user: string; id: number; avatar?: string; bio?: string }
interface Profile { id: number; user: string; avatar: string; bio: string; following: number; followers: number }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    logged: false, guest: false, askLogin: false,
    user: '', id: null as number | null,
    avatar: '', bio: '', following: 0, followers: 0
  }),
  getters: {
    display: (s): string => (s.logged ? s.user : 'Visitante')
  },
  actions: {
    // O servidor do Nuxt confere a senha no Django e guarda a sessão em cookie.
    async login(username: string, password: string) {
      const res = await $fetch<Session>('/api/auth/login', { method: 'POST', body: { username, password } })
      this.setSession(res.user, res.id, res.avatar, res.bio)
    },
    // Cadastro (FormData): cria a conta, com foto opcional, e já entra.
    async register(username: string, email: string, password: string, avatar?: File | null) {
      const fd = new FormData()
      fd.append('username', username)
      if (email) fd.append('email', email)
      fd.append('password', password)
      if (avatar) fd.append('avatar', avatar)
      const res = await $fetch<Session>('/api/auth/register', { method: 'POST', body: fd })
      this.setSession(res.user, res.id, res.avatar, res.bio)
    },
    setSession(user: string, id: number | null, avatar = '', bio = '') {
      this.user = user; this.id = id; this.avatar = avatar; this.bio = bio
      this.logged = true; this.guest = false; this.askLogin = false
    },
    // Foto, biografia e números do perfil (vêm do Django).
    async loadProfile() {
      try {
        const p = await $fetch<Profile>('/api/profile')
        this.avatar = p.avatar; this.bio = p.bio; this.following = p.following; this.followers = p.followers
      } catch { /* o perfil é opcional na tela */ }
    },
    // Atualiza foto e/ou biografia no Django (PATCH multipart).
    async updateProfile(o: { avatar?: File | null; bio?: string }) {
      const fd = new FormData()
      if (o.avatar) fd.append('avatar', o.avatar)
      if (o.bio !== undefined) fd.append('biografia', o.bio)
      await $fetch('/api/profile', { method: 'PATCH', body: fd })
      await this.loadProfile()
    },
    async logout() {
      try { await $fetch('/api/auth/logout', { method: 'POST' }) } catch { /* segue mesmo assim */ }
      this.logged = false; this.guest = false; this.askLogin = false
      this.user = ''; this.id = null; this.avatar = ''; this.bio = ''; this.following = 0; this.followers = 0
    },
    browse() { this.guest = true; this.askLogin = false },
    // Ações que exigem conta chamam isto: sem login, abre o pop-up e devolve false.
    requireLogin(): boolean {
      if (this.logged) return true
      this.askLogin = true
      return false
    }
  }
})
