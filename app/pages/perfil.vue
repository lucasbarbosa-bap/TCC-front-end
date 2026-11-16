<script setup lang="ts">
const auth = useAuthStore()
const store = usePostsStore()
const { show } = useToast()
const tab = ref('posts')
const file = ref<HTMLInputElement>()
const tabs = [{ id: 'posts', label: 'posts' }, { id: 'comentarios', label: 'comentarios' }, { id: 'curtido', label: 'curtido' }]
const list = computed(() => tab.value === 'posts' ? store.mine : tab.value === 'comentarios' ? store.commented : store.liked)

async function share() {
  try { await navigator.clipboard.writeText(location.href); show('Link do perfil copiado') } catch { show('Não foi possível copiar') }
}
// recorta a foto no centro, em quadrado de 256px, para ficar leve
function resize(f: File): Promise<string> {
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
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (!f) return
  if (!f.type.startsWith('image/')) { show('Escolha um arquivo de imagem'); return }
  if (f.size > 8 * 1024 * 1024) { show('A imagem deve ter até 8 MB'); return }
  try { auth.setAvatar(await resize(f)); show('Foto atualizada') } catch { show('Não foi possível usar essa imagem') }
}
</script>

<template>
  <div>
    <div v-if="!auth.logged" class="gate">
      <h1>Entre para ver seu perfil</h1>
      <p>Crie uma conta ou entre para publicar, comentar e acompanhar quem você segue.</p>
      <button class="pill" @click="auth.askLogin = true">Entrar ou criar conta</button>
      <NuxtLink to="/" class="pill">Voltar ao início</NuxtLink>
    </div>

    <template v-else>
      <div class="cover">
        <NuxtLink to="/" class="ico back" aria-label="Voltar ao início"><Icon name="back" :size="30" /></NuxtLink>
        <button class="ico share" aria-label="Compartilhar perfil" @click="share"><Icon name="share" :size="24" /></button>
        <button class="pill sm switch" @click="auth.logout()">trocar de conta</button>
      </div>
      <div class="id">
        <button class="avatar-edit" aria-label="Alterar foto de perfil" @click="file?.click()">
          <UserAvatar :name="auth.user" big />
          <span class="cam"><Icon name="camera" :size="16" /></span>
        </button>
        <input ref="file" type="file" accept="image/*" hidden @change="onFile">
        <div class="id-name">
          <button class="ico sm" aria-label="Alterar foto de perfil" @click="file?.click()"><Icon name="edit" :size="22" /></button>
          <h1>{{ auth.user }}</h1>
        </div>
        <small>Perfil De Estudante</small>
      </div>
      <div class="stats">
        <div><span>seguindo</span><b>{{ store.following.length }}</b></div>
        <div><span>seguidores</span><b>0</b></div>
        <div><span>posts lançados</span><b>{{ store.mine.length }}</b></div>
      </div>
      <LoadNotice />
      <Composer @published="tab = 'posts'" />
      <TabBar v-model="tab" class="between line" :tabs="tabs" />
      <TransitionGroup name="feed" tag="div" class="feed">
        <PostCard v-for="p in list" :key="`${tab}-${p.id}`" :post="p" />
      </TransitionGroup>
      <p v-if="store.loaded && !list.length" class="empty">Nada por aqui ainda.</p>
    </template>
  </div>
</template>
