export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Só o servidor enxerga (não é "public"). Os valores vêm do arquivo .env
    djangoApi: '',
    djangoAuthScheme: 'Bearer',
    // Só use se a rota de comentários do Django tiver outro formato. Ex.: /comentario/{id}/
    commentsPath: '',
    public: {
      // Limite total de cada envio pelo servidor do site. A Vercel aceita no máximo 4,5 MB por pedido.
      maxUploadMb: 4
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }
      ]
    }
  }
})
