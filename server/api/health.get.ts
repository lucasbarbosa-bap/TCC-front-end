// Diagnóstico rápido: abra  /api/health  no navegador para ver se o back-end está configurado e respondendo.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const out: Record<string, any> = { configurado: !!String(cfg.djangoApi ?? '').trim() }
  if (!out.configurado) {
    out.dica = 'Defina NUXT_DJANGO_API no arquivo .env (no seu computador) ou nas variáveis de ambiente da Vercel e reinicie.'
    return out
  }
  const t = Date.now()
  try {
    await django(event, '/postagem/', { timeout: 20000 })
    out.back_end = 'ok'
  } catch (e: any) {
    out.back_end = 'erro'
    out.status = e?.statusCode ?? e?.response?.status ?? null   // 404 = URL errada, 502/503 = Render acordando
    out.codigo = e?.cause?.code ?? e?.name ?? null              // ENOTFOUND = endereço inexistente
  }
  out.ms = Date.now() - t
  return out
})
