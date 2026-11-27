export const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp']
export const VIDEO_EXT = ['mp4', 'webm', 'mov']
export const extOf = (name: string) => (name.split('?')[0].split('.').pop() ?? '').toLowerCase()
export const isVideo = (url: string) => VIDEO_EXT.includes(extOf(url))

/** Mensagem de erro amigável, venha ela do servidor do site (message) ou direto do Django (erro/mensagem). */
export function errMsg(e: any, fallback: string): string {
  const m = e?.data?.message || e?.data?.erro || e?.data?.mensagem || ''
  if (/ja existe/i.test(m)) return 'Este nome de usuário já está em uso.'
  return m || fallback
}

/** Confere formato e tamanho antes de enviar. Devolve o texto do erro, ou '' se estiver tudo certo. */
export function checkFiles(files: File[], o: { max: number; mb: number; exts: string[]; label: string }): string {
  if (files.length > o.max) return `Envie no máximo ${o.max} arquivo(s) em ${o.label}.`
  for (const f of files) {
    if (!o.exts.includes(extOf(f.name))) return `Formato não aceito: ${f.name}. Use ${o.exts.join(', ')}.`
    if (f.size > o.mb * 1024 * 1024) return `${f.name} passa de ${o.mb} MB.`
  }
  // A Vercel só aceita ~4,5 MB por envio passando pelo servidor do site.
  const limit = Number(useRuntimeConfig().public.maxUploadMb) || 4
  if (files.reduce((s, f) => s + f.size, 0) > limit * 1024 * 1024) return `O total passa de ${limit} MB (limite de envio do site).`
  return ''
}
