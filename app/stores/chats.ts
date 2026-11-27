import { defineStore } from 'pinia'

export interface Chat { id: number; user: string }
export interface Message { id: number; mine: boolean; text: string; at: string }

const msg = (e: any, fallback: string): string => e?.data?.message || fallback
const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Modo demonstração: usado enquanto o back-end ainda não tiver as rotas de conversa.
const DEMO_CHATS: Chat[] = [
  { id: -1, user: 'user_generic' }, { id: -2, user: 'user_generic' }, { id: -3, user: 'user_generic' }
]
const DEMO_MSGS = (): Message[] => [
  { id: 1, mine: false, text: 'Oi! Vi seu post sobre derivadas.', at: '10:02' },
  { id: 2, mine: true, text: 'Oi! Quer que eu explique melhor?', at: '10:03' }
]

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [] as Chat[],
    messages: {} as Record<number, Message[]>,
    loading: false,
    loaded: false,
    error: '',
    demo: false
  }),
  actions: {
    async loadChats() {
      this.loading = true
      this.error = ''
      try {
        this.chats = await useRequestFetch()<Chat[]>('/api/chats')
        this.demo = false
        this.loaded = true
      } catch (e: any) {
        if ((e?.statusCode ?? e?.status) === 404) {   // o back-end ainda não tem conversas
          this.demo = true
          if (!this.chats.length) this.chats = [...DEMO_CHATS]
          this.loaded = true
        } else {
          this.error = msg(e, 'Não foi possível carregar as conversas.')
        }
      } finally {
        this.loading = false
      }
    },
    async loadMessages(id: number, silent = false) {
      if (this.demo) { if (!this.messages[id]) this.messages[id] = id >= -3 && id < 0 ? DEMO_MSGS() : []; return }
      try {
        const fresh = await useRequestFetch()<Message[]>(`/api/chats/${id}/messages`)
        const cur = this.messages[id] ?? []
        const last = (l: Message[]) => l[l.length - 1]?.id
        if (fresh.length !== cur.length || last(fresh) !== last(cur)) this.messages[id] = fresh
      } catch (e: any) {
        if (!silent) useToast().show(msg(e, 'Não foi possível carregar as mensagens'))
      }
    },
    async send(id: number, text: string) {
      if (!useAuthStore().requireLogin()) return
      this.messages[id] ??= []
      const list = this.messages[id]
      const m: Message = { id: -Date.now(), mine: true, text, at: hora() }
      list.push(m)
      if (this.demo) return
      try {
        await $fetch(`/api/chats/${id}/messages`, { method: 'POST', body: { text } })
        await this.loadMessages(id, true)
      } catch (e: any) {
        const i = list.indexOf(m)
        if (i >= 0) list.splice(i, 1)
        useToast().show(msg(e, 'Não foi possível enviar'))
      }
    },
    async start(user: string): Promise<Chat | null> {
      if (!useAuthStore().requireLogin()) return null
      const existing = this.chats.find(c => c.user.toLowerCase() === user.toLowerCase())
      if (existing) return existing
      if (this.demo) { const c = { id: -Date.now(), user }; this.chats.unshift(c); return c }
      try {
        const c = await $fetch<Chat>('/api/chats', { method: 'POST', body: { user } })
        this.chats.unshift(c)
        return c
      } catch (e: any) {
        useToast().show(msg(e, 'Não foi possível iniciar a conversa'))
        return null
      }
    }
  }
})
