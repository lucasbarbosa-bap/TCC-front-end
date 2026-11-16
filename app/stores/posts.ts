import { defineStore } from 'pinia'

export interface Comment { n: string; r: string; ok: boolean; t: string }
export interface Post {
  id: number; name: string; role: string; c: number; time: string
  tag: string; title: string; text: string; file?: string
  likes: number; liked: boolean; fav: boolean; open: boolean; cms: Comment[]
}

const msg = (e: any, fallback: string): string => e?.data?.message || fallback

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    loading: false,
    loaded: false,
    error: '',
    activeTag: null as string | null,
    query: '',
    following: [] as string[],   // ainda só no site (o back-end não tem seguir)
    hidden: [] as number[]
  }),
  getters: {
    filtered(s): Post[] {
      const q = s.query.trim().toLowerCase()
      return s.posts.filter(p =>
        !s.hidden.includes(p.id) &&
        (!s.activeTag || p.tag === s.activeTag) &&
        (!q || (p.title + p.text + p.name + p.tag).toLowerCase().includes(q)))
    },
    mine(s): Post[] { const me = useAuthStore().user; return s.posts.filter(p => p.name === me) },
    commented(s): Post[] { const me = useAuthStore().user; return s.posts.filter(p => p.cms.some(c => c.n === me)) },
    liked(s): Post[] { return s.posts.filter(p => p.liked) },
    favs(s): Post[] { return s.posts.filter(p => p.fav) }
  },
  actions: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        const fresh = await useRequestFetch()<Post[]>('/api/posts')
        const old = new Map(this.posts.map(p => [p.id, p]))
        // favoritos e comentários abertos só existem no site, então preservamos
        this.posts = fresh.map(p => ({ ...p, fav: old.get(p.id)?.fav ?? false, open: old.get(p.id)?.open ?? false }))
        this.loaded = true
      } catch (e: any) {
        this.error = msg(e, 'Não foi possível carregar os posts. O servidor pode estar iniciando.')
      } finally {
        this.loading = false
      }
    },
    find(id: number) { return this.posts.find(p => p.id === id)! },
    setTag(tag: string) { this.activeTag = this.activeTag === tag ? null : tag },
    async toggleLike(id: number) {
      if (!useAuthStore().requireLogin()) return
      const p = this.find(id)
      p.liked = !p.liked
      p.likes += p.liked ? 1 : -1
      if (!p.liked) return   // o back-end ainda não tem rota para remover curtida
      try { await $fetch(`/api/posts/${id}/like`, { method: 'POST' }) } catch (e: any) {
        p.liked = false; p.likes -= 1
        useToast().show(msg(e, 'Não foi possível curtir'))
      }
    },
    toggleFav(id: number) { if (!useAuthStore().requireLogin()) return; const p = this.find(id); p.fav = !p.fav },
    toggleComments(id: number) { const p = this.find(id); p.open = !p.open },
    hide(id: number) { this.hidden.push(id) },
    toggleFollow(name: string) {
      if (!useAuthStore().requireLogin()) return
      const i = this.following.indexOf(name)
      if (i >= 0) this.following.splice(i, 1); else this.following.push(name)
    },
    async comment(id: number, t: string) {
      if (!useAuthStore().requireLogin()) return
      const p = this.find(id)
      const c: Comment = { n: useAuthStore().user, r: 'Aluno', ok: false, t }
      p.cms.push(c)
      try { await $fetch(`/api/posts/${id}/comments`, { method: 'POST', body: { text: t } }) } catch (e: any) {
        p.cms.splice(p.cms.indexOf(c), 1)
        useToast().show(msg(e, 'Não foi possível comentar'))
      }
    },
    async add(text: string, tag: string): Promise<boolean> {
      if (!useAuthStore().requireLogin()) return false
      try {
        await $fetch('/api/posts', { method: 'POST', body: { text, tag } })
        this.activeTag = null
        await this.load()
        return true
      } catch (e: any) {
        useToast().show(msg(e, 'Não foi possível publicar'))
        return false
      }
    }
  }
})
