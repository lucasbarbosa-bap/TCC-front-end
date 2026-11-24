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
  const cfg = useRuntimeConfig().public
  if (!cfg.djangoDirect) {
    const total = files.reduce((s, f) => s + f.size, 0)
    if (total > Number(cfg.maxUploadMb) * 1024 * 1024) return `O total passa de ${cfg.maxUploadMb} MB (limite de envio do servidor do site).`
  }
  return ''
}

/** Envia um FormData: pelo servidor do site, ou direto ao Django se NUXT_PUBLIC_DJANGO_DIRECT estiver definido. */
export function sendForm<T = any>(proxyPath: string, djangoPath: string, body: FormData): Promise<T> {
  const direct = String(useRuntimeConfig().public.djangoDirect || '').replace(/\/+$/, '')
  return $fetch<T>(direct ? `${direct}${djangoPath}` : proxyPath, { method: 'POST', body })
}

/** Recorta no centro e reduz para 256px (pré-visualização da foto de perfil). */
export function resizeImage(f: File): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image()
    const url = URL.createObjectURL(f)
    img.onload = () => {
      const r = Math.min(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = c.height = 256
      c.getContext('2d')!.drawImage(img, (img.width - r) / 2, (img.height - r) / 2, r, r, 0, 0, 256, 256)
      URL.revokeObjectURL(url)
      ok(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('imagem inválida')) }
    img.src = url
  })
}
