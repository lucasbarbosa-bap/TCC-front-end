import type { H3Event } from 'h3'

export const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp']
export const VIDEO_EXT = ['mp4', 'webm', 'mov']

type Part = { name?: string; filename?: string; type?: string; data: Buffer }
export type Upload = { fields: Record<string, string>; files: Record<string, Part[]> }

/** Lê um formulário multipart (FormData) enviado pelo site: campos de texto e arquivos. */
export async function readUpload(event: H3Event): Promise<Upload> {
  const parts = (await readMultipartFormData(event)) ?? []
  const out: Upload = { fields: {}, files: {} }
  for (const p of parts) {
    if (!p.name) continue
    if (p.filename) {
      if (p.data.length) (out.files[p.name] ??= []).push(p as Part)   // ignora campo de arquivo vazio
    } else {
      out.fields[p.name] = p.data.toString('utf8')
    }
  }
  return out
}

/** Confere quantidade, formato e tamanho (as mesmas regras do back-end). Lança erro 400 em português. */
export function checkUpload(files: Part[], o: { max: number; mb: number; exts: string[]; label: string }) {
  if (files.length > o.max) throw createError({ statusCode: 400, message: `Envie no máximo ${o.max} arquivo(s) em ${o.label}.` })
  for (const f of files) {
    const ext = (f.filename ?? '').split('.').pop()?.toLowerCase() ?? ''
    if (!o.exts.includes(ext)) throw createError({ statusCode: 400, message: `Formato não aceito: ${f.filename}. Use ${o.exts.join(', ')}.` })
    if (f.data.length > o.mb * 1024 * 1024) throw createError({ statusCode: 400, message: `${f.filename} passa de ${o.mb} MB.` })
  }
}

/** Monta o FormData que o Django espera. Vários arquivos entram com a mesma chave (ex.: "midia"). */
export function toDjangoForm(fields: Record<string, string | number | undefined>, files: Part[] = [], key = 'midia'): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== '') fd.append(k, String(v))
  for (const f of files) fd.append(key, new Blob([new Uint8Array(f.data)], { type: f.type || 'application/octet-stream' }), f.filename || 'arquivo')
  return fd
}

/** URLs de mídia podem vir relativas (/media/...): completa com o endereço do back-end. */
export function mediaUrl(event: H3Event, u: unknown): string {
  const s = String(u ?? '')
  if (!s || /^(https?:|data:)/i.test(s)) return s
  try { return new URL(s, new URL(String(useRuntimeConfig(event).djangoApi)).origin).href } catch { return s }
}
export function mediaList(event: H3Event, v: unknown): string[] {
  return Array.isArray(v) ? v.map(u => mediaUrl(event, typeof u === 'string' ? u : (u as any)?.url)).filter(Boolean) : []
}
