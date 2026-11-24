import { defineStore } from 'pinia'

export interface Comment { n: string; r: string; ok: boolean; t: string; avatar?: string; media?: string[] }
export interface Post {
  id: number; name: string; role: string; c: number; time: string
  tag: string; title: string; text: string; file?: string
  likes: number; liked: boolean; fav: boolean; open: boolean; cms: Comment[]
  avatar?: string; media?: string[]
}

const msg = (e: any, fallback: string): string => errMsg(e, fallback)

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    loading: false,
    loaded: false,
    error: '',
    activeTag: null as string | null,
    query: '',
    following: [] as string[],   // ainda só no site (o back-end não tem seguir)
    hidden: [] as number[],
    busyLikes: [] as number[]   // posts com curtida em andamento (evita cliques repetidos)
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
        // mostra a sua foto (que veio do servidor) no cabeçalho e no menu
        const auth = useAuthStore()
        if (auth.logged && !auth.avatar) {
          const mine = fresh.find(p => p.name === auth.user && p.avatar)
          if (mine?.avatar) auth.avatar = mine.avatar
        }
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
    toggleFav(id: number) { if (!useAuthStore().requireLogin()) return; const p = this.find(id); p.fav = !p.fav },
    toggleComments(id: number) { const p = this.find(id); p.open = !p.open },
    hide(id: number) { this.hidden.push(id) },
    toggleFollow(name: string) {
      if (!useAuthStore().requireLogin()) return
      const i = this.following.indexOf(name)
      if (i >= 0) this.following.splice(i, 1); else this.following.push(name)
    },
    async comment(id: number, t: string, files: File[] = []) {
      if (!useAuthStore().requireLogin()) return
      const p = this.find(id)
      const c: Comment = { n: useAuthStore().user, r: 'Aluno', ok: false, t, media: [] }
      p.cms.push(c)
      try {
        const fd = new FormData()
        if (useRuntimeConfig().public.djangoDirect) {   // direto ao Django: o site não preenche o autor
          fd.append('autor', String(useAuthStore().id)); fd.append('post_original', String(id)); fd.append('conteudo', t)
        } else {
          fd.append('text', t)
        }
        for (const f of files) fd.append('midia', f)
        await sendForm(`/api/posts/${id}/comments`, '/comentario/', fd)
        if (files.length) await this.load()   // busca as URLs das mídias enviadas
      } catch (e: any) {
        p.cms.splice(p.cms.indexOf(c), 1)
        useToast().show(msg(e, 'Não foi possível comentar'))
      }
    },
    async add(text: string, tag: string, files: File[] = []): Promise<boolean> {
      if (!useAuthStore().requireLogin()) return false
      try {
        const fd = new FormData()
        if (useRuntimeConfig().public.djangoDirect) {   // direto ao Django: o site não preenche o autor
          fd.append('titulo', text.length > 60 ? text.slice(0, 57) + '…' : text)
          fd.append('conteudo', `${text}\n\n#${tag.trim().replace(/\s+/g, '_')}`)
          fd.append('autor', String(useAuthStore().id))
        } else {
          fd.append('text', text); fd.append('tag', tag)
        }
        for (const f of files) fd.append('midia', f)
        await sendForm('/api/posts', '/postagem/', fd)
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
