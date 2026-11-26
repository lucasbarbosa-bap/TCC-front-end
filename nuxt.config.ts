// Junte ao nuxt.config.ts existente, sem duplicar chaves.
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Só o servidor enxerga (não é "public"). Os valores vêm do arquivo .env
    djangoApi: '',
    djangoAuthScheme: 'Bearer',
    public: {
      // Se preenchido, fotos e mídias vão direto do navegador ao Django (exige CORS no Django). Ex.: https://seu-servico.onrender.com/api
      djangoDirect: '',
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
