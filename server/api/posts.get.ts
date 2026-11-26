// Busca posts, comentários e interações no Django e entrega no formato que o site usa.
export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'uid')
  let raw: any[]
  try {
    raw = await Promise.all([django(event, '/postagem/'), django(event, '/comentario/'), django(event, '/interacao/')])
  } catch (e) { fail(e, 'Não foi possível carregar os posts. O servidor pode estar iniciando.') }

  const posts = list(raw[0], 'Postagens')
  const comments = list(raw[1], 'Comentarios')
  const inter = list(raw[2], 'Interações')

  return posts
    .sort((a: any, b: any) => +new Date(b.data_criacao) - +new Date(a.data_criacao))
    .map((x: any) => {
      const { text, tag } = splitTag(x.conteudo ?? '')
      const title = x.titulo ?? ''
      const likes = inter.filter((n: any) => n.post_id === x.id && n.tipo === 'like')
      const likers = new Set(likes.map((n: any) => String(n.autor_id)))   // pessoas diferentes (curtidas repetidas no banco não inflam o número)
      return {
        id: x.id,
        avatar: mediaUrl(event, x.autor?.avatar),
        media: mediaList(event, x.midia),
        name: x.autor?.nome ?? 'anônimo',
        role: 'Aluno',                       // o back-end ainda não diferencia aluno e professor
        c: (x.autor?.id ?? 0) % 6,
        time: ago(x.data_criacao),
        tag,
        title,
        text: text.trim() === title.trim() ? '' : text,
        likes: likers.size,
        liked: !!uid && likers.has(uid),
        fav: false,
        open: false,
        cms: comments
          .filter((m: any) => m.post_original === x.id)
          .map((m: any) => ({ n: m.autor?.nome ?? 'anônimo', r: 'Aluno', ok: false, t: m.conteudo ?? '', avatar: mediaUrl(event, m.autor?.avatar), media: mediaList(event, m.midia) }))
      }
    })
})
