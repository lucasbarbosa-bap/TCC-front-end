import { defineStore } from 'pinia'

export interface Comment { id: number; n: string; authorId: number | null; avatar: string; t: string; media: string[]; time: string }
export interface Post {
  id: number; authorId: number | null; name: string; avatar: string; time: string
  tag: string; tipo: string; title: string; text: string; media: string[]
  likes: number; liked: boolean; comments: number
  cms: Comment[]; cmsLoaded: boolean; open: boolean
}

const msg = (e: any, fallback: string): string => errMsg(e, fallback)
const CACHE_KEY = 'sinapse-feed-v2'   // v2: formato novo dos posts (não reaproveita o cache antigo)
const favKey = (id: number | null) => `sinapse-favs-${id}`

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    loading: false,
    loaded: false,
    waking: false,      // true enquanto o servidor gratuito está acordando
    error: '',
    activeTag: null as string | null,
    query: '',
    following: [] as string[],   // ainda só no site (o back-end não tem rota para seguir)
    hidden: [] as number[],
    favIds: [] as number[],      // favoritos ficam salvos neste navegador
    busyLikes: [] as number[],
    loadingComments: [] as number[]
  }),
  getters: {
    filtered(s): Post[] {
      const q = s.query.trim().toLowerCase()
      return s.posts.filter(p =>
        !s.hidden.includes(p.id) &&
        (!s.activeTag || p.tag === s.activeTag) &&
        (!q || (p.title + p.text + p.name + p.tag + p.tipo).toLowerCase().includes(q)))
    },
    mine(s): Post[] { const me = useAuthStore().id; return me == null ? [] : s.posts.filter(p => p.authorId === me) },
    answered(): Post[] { return this.mine.filter(p => p.comments > 0) },
    repliedByMe(s): Post[] { const me = useAuthStore().id; return me == null ? [] : s.posts.filter(p => p.cms.some(c => c.authorId === me)) },
    liked(s): Post[] { return s.posts.filter(p => p.liked) },
    favs(s): Post[] { return s.posts.filter(p => s.favIds.includes(p.id)) }
  },
  actions: {
    // Mostra na hora o último feed salvo neste navegador, enquanto o novo é buscado.
    hydrate() {
      if (this.posts.length) return
      try {
        const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as Post[]
        if (saved.length) { this.posts = saved; this.loaded = true }
      } catch { /* sem cache */ }
    },
    async load(attempt = 0) {
      this.loading = true
      this.error = ''
      try {
        const fresh = await useRequestFetch()<Post[]>('/api/posts')
        const old = new Map(this.posts.map(p => [p.id, p]))
        // comentários já abertos e carregados só existem no site, então preservamos
        this.posts = fresh.map((p) => {
          const o = old.get(p.id)
          return o ? { ...p, open: o.open, cms: o.cms, cmsLoaded: o.cmsLoaded } : p
        })
        this.loaded = true
        this.waking = false
        this.loading = false
        const light = this.posts.slice(0, 50).map(p => ({ ...p, cms: [], cmsLoaded: false, open: false }))
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(light)) } catch { /* sem armazenamento */ }
      } catch (e: any) {
        const code = e?.statusCode ?? e?.status
        // servidor dormindo ou função da Vercel cortada: tenta de novo sozinho, sem o usuário clicar
        if ((!code || [502, 503, 504].includes(code)) && attempt < 8) {
          this.waking = true
          setTimeout(() => this.load(attempt + 1), 5000)
          return
        }
        this.waking = false
        this.loading = false
        this.error = msg(e, 'Não foi possível carregar os posts. O servidor pode estar iniciando.')
      }
    },
    find(id: number) { return this.posts.find(p => p.id === id)! },
    setTag(tag: string) { this.activeTag = this.activeTag === tag ? null : tag },

    initFavs(userId: number | null) {
      try { this.favIds = JSON.parse(localStorage.getItem(favKey(userId)) || '[]') } catch { this.favIds = [] }
    },
    toggleFav(id: number) {
      const auth = useAuthStore()
      if (!auth.requireLogin()) return
      const i = this.favIds.indexOf(id)
      if (i >= 0) this.favIds.splice(i, 1); else this.favIds.push(id)
      try { localStorage.setItem(favKey(auth.id), JSON.stringify(this.favIds)) } catch { /* sem armazenamento */ }
    },

    async toggleLike(id: number) {
      if (!useAuthStore().requireLogin()) return
      if (this.busyLikes.includes(id)) return
      const p = this.find(id)
      const wasLiked = p.liked
      p.liked = !wasLiked
      p.likes += p.liked ? 1 : -1
      this.busyLikes.push(id)
      try {
        // curtir cria no banco, descurtir apaga no banco
        await $fetch(`/api/posts/${id}/like`, { method: wasLiked ? 'DELETE' : 'POST' })
      } catch (e: any) {
        p.liked = wasLiked
        p.likes += wasLiked ? 1 : -1
        useToast().show(msg(e, 'Não foi possível atualizar a curtida'))
      } finally {
        this.busyLikes = this.busyLikes.filter(x => x !== id)
      }
    },

    // Comentários são buscados só quando a pessoa abre o post (o back-end devolve por post).
    toggleComments(id: number) {
      const p = this.find(id)
      p.open = !p.open
      if (p.open && !p.cmsLoaded) this.loadComments(id)
    },
    async loadComments(id: number, silent = false) {
      const p = this.find(id)
      if (!p) return
      if (!this.loadingComments.includes(id)) this.loadingComments.push(id)
      try {
        p.cms = await $fetch<Comment[]>(`/api/posts/${id}/comments`)
        p.cmsLoaded = true
        p.comments = p.cms.length
      } catch (e: any) {
        if (!silent) useToast().show(msg(e, 'Não foi possível carregar os comentários'))
      } finally {
        this.loadingComments = this.loadingComments.filter(x => x !== id)
      }
    },
    // Usado na aba "Respostas" do perfil: carrega os comentários dos posts que têm algum.
    async loadAllComments() {
      const todo = this.posts.filter(p => p.comments > 0 && !p.cmsLoaded).map(p => p.id)
      const worker = async () => { for (let id = todo.shift(); id !== undefined; id = todo.shift()) await this.loadComments(id, true) }
      await Promise.all([worker(), worker(), worker(), worker()])
    },
    async comment(id: number, text: string, files: File[] = []) {
      const auth = useAuthStore()
      if (!auth.requireLogin()) return
      const p = this.find(id)
      const temp: Comment = { id: -Date.now(), n: auth.user, authorId: auth.id, avatar: auth.avatar, t: text, media: [], time: 'agora' }
      p.cms.push(temp)
      p.open = true
      try {
        const fd = new FormData()
        fd.append('text', text)
        for (const f of files) fd.append('midia', f)
        await $fetch(`/api/posts/${id}/comments`, { method: 'POST', body: fd })
        await this.loadComments(id, true)   // troca o comentário provisório pelo real (com as URLs das mídias)
        p.comments = Math.max(p.comments, p.cms.length)
      } catch (e: any) {
        p.cms.splice(p.cms.indexOf(temp), 1)
        useToast().show(msg(e, 'Não foi possível comentar'))
      }
    },

    async add(text: string, tag: string, tipo: string, files: File[] = []): Promise<boolean> {
      if (!useAuthStore().requireLogin()) return false
      try {
        const fd = new FormData()
        fd.append('text', text)
        fd.append('tag', tag)
        fd.append('tipo', tipo)
        for (const f of files) fd.append('midia', f)
        await $fetch('/api/posts', { method: 'POST', body: fd })
        this.activeTag = null
        await this.load()
        return true
      } catch (e: any) {
        useToast().show(msg(e, 'Não foi possível publicar'))
        return false
      }
    },
    async remove(id: number) {
      try {
        await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
        this.posts = this.posts.filter(p => p.id !== id)
        useToast().show('Post excluído')
      } catch (e: any) {
        useToast().show(msg(e, 'Não foi possível excluir o post'))
      }
    },
    hide(id: number) { this.hidden.push(id) },
    toggleFollow(name: string) {
      if (!useAuthStore().requireLogin()) return
      const i = this.following.indexOf(name)
      if (i >= 0) this.following.splice(i, 1); else this.following.push(name)
    }
  }
})
