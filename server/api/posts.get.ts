// Monta o feed a partir do Django (com cache curto) no formato que o site usa.
export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'uid')
  let raw: Awaited<ReturnType<typeof feedRaw>>
  try {
    raw = await feedRaw(event)
  } catch (e) { fail(e, 'Não foi possível carregar os posts. O servidor pode estar iniciando.') }

  // Conta pessoas diferentes (e não linhas do banco): curtidas repetidas não inflam o número
  const likers = new Map<number, Set<string>>()
  const liked = new Set<number>()
  for (const n of raw.inter) {
    if (n.tipo !== 'like' || n.post_id == null) continue
    const set = likers.get(n.post_id) ?? likers.set(n.post_id, new Set()).get(n.post_id)!
    set.add(String(n.autor_id))
    if (uid && String(n.autor_id) === uid) liked.add(n.post_id)
  }

  return [...raw.posts]
    .sort((a, b) => +new Date(b.data_criacao) - +new Date(a.data_criacao))
    .map((x) => {
      const { text, tag, tipo } = splitTag(x.conteudo ?? '')
      const title = x.titulo ?? ''
      return {
        id: x.id,
        authorId: x.autor?.id ?? null,
        name: x.autor?.nome ?? 'usuário removido',
        avatar: mediaUrl(event, x.autor?.avatar),
        time: ago(x.data_criacao),
        tag,
        tipo,
        title,
        text: text.trim() === title.trim() ? '' : text,
        media: mediaList(event, x.midia),
        likes: likers.get(x.id)?.size ?? 0,
        liked: liked.has(x.id),
        comments: Number(x.comentarios ?? 0),
        cms: [],
        cmsLoaded: false,
        open: false
      }
    })
})