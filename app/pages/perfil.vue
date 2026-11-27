<script setup lang="ts">
const auth = useAuthStore()
const store = usePostsStore()
const { show } = useToast()
const tab = ref('posts')
const tabs = [{ id: 'posts', label: 'Posts' }, { id: 'respostas', label: 'Respostas' }, { id: 'respondidos', label: 'Respondidos' }, { id: 'curtidos', label: 'Curtidos' }]
const list = computed(() =>
  tab.value === 'posts' ? store.mine : tab.value === 'respostas' ? store.repliedByMe : tab.value === 'respondidos' ? store.answered : store.liked)
watch(tab, (t) => { if (t === 'respostas') store.loadAllComments() })

// editar perfil (foto e biografia, salvos no Django)
const editing = ref(false)
const bio = ref('')
const newAvatar = ref<File | null>(null)
const preview = ref('')
const err = ref('')
const saving = ref(false)
const fileEl = ref<HTMLInputElement>()

function openEdit() { bio.value = auth.bio; newAvatar.value = null; preview.value = ''; err.value = ''; editing.value = true }
function pickAvatar(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file) return
  const bad = checkFiles([file], { max: 1, mb: 5, exts: IMG_EXT, label: 'a foto de perfil' })
  if (bad) { err.value = bad; return }
  err.value = ''
  newAvatar.value = file
  preview.value = URL.createObjectURL(file)
}
async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await auth.updateProfile({ avatar: newAvatar.value, bio: bio.value })
    await store.load()   // os seus posts passam a mostrar a foto nova
    editing.value = false
    show('Perfil atualizado')
  } catch (e: any) {
    err.value = errMsg(e, 'Não foi possível salvar o perfil.')
  } finally { saving.value = false }
}
async function share() {
  try { await navigator.clipboard.writeText(location.href); show('Link do perfil copiado') } catch { show('Não foi possível copiar') }
}
</script>

<template>
  <div>
    <div v-if="!auth.logged" class="gate">
      <h1>Entre para ver seu perfil</h1>
      <p>Crie uma conta ou entre para publicar, comentar e acompanhar quem você segue.</p>
      <button class="btn" @click="auth.askLogin = true"><span class="mk" />Entrar ou criar conta</button>
      <NuxtLink to="/" class="link-btn">Voltar ao início</NuxtLink>
    </div>

    <template v-else>
      <header class="cover">
        <NuxtLink to="/" class="back" aria-label="Voltar ao início"><Icon name="back" :size="28" /><span>Perfil</span></NuxtLink>
        <button class="switch" @click="auth.logout()">Trocar de Conta</button>
      </header>
      <div class="id">
        <div class="id-left"><button class="ico" aria-label="Compartilhar perfil" @click="share"><Icon name="share" :size="24" /></button></div>
        <div class="id-right">
          <button class="avatar-edit" aria-label="Alterar foto de perfil" @click="openEdit">
            <UserAvatar :name="auth.user" big />
            <span class="cam"><Icon name="camera" :size="16" /></span>
          </button>
          <div class="id-name">
            <button class="ico sm" aria-label="Editar perfil" @click="openEdit"><Icon name="edit" :size="20" /></button>
            <h1>{{ auth.user }}</h1>
          </div>
          <small>Perfil / Estudante</small>
        </div>
        <p v-if="auth.bio" class="bio">{{ auth.bio }}</p>
      </div>

      <div class="stats">
        <div><span>Seguindo</span><b>{{ auth.following }}</b></div>
        <div><span>Posts</span><b>{{ store.mine.length }}</b></div>
        <div><span>Posts Respondidos</span><b>{{ store.answered.length }}</b></div>
      </div>
      <TabBar v-model="tab" :tabs="tabs" />
      <LoadNotice />
      <p v-if="tab === 'respostas' && store.loadingComments.length" class="hint" style="margin-top:12px" role="status">Procurando as suas respostas…</p>
      <TransitionGroup name="feed" tag="div" class="feed">
        <PostCard v-for="p in list" :key="`${tab}-${p.id}`" :post="p" />
      </TransitionGroup>
      <p v-if="store.loaded && !list.length" class="empty">Nada por aqui ainda.</p>

      <BaseSheet :open="editing" label="Editar perfil" @close="editing = false">
        <div style="display:grid;gap:14px;justify-items:center">
          <UserAvatar :name="auth.user" :src="preview" big />
          <input ref="fileEl" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/*" hidden @change="pickAvatar">
          <button type="button" class="btn" @click="fileEl?.click()"><span class="mk" />{{ newAvatar ? newAvatar.name : 'Trocar foto' }}</button>
          <label class="field" style="width:100%">Biografia<textarea v-model="bio" maxlength="300" style="height:110px;padding:8px 12px;resize:none" /></label>
          <p v-if="err" class="err" role="alert">{{ err }}</p>
          <div class="row2">
            <button type="button" class="btn" @click="editing = false"><span class="mk" />Cancelar</button>
            <button type="button" class="btn" :disabled="saving" @click="save"><span class="mk" />{{ saving ? 'Salvando…' : 'Salvar' }}</button>
          </div>
        </div>
      </BaseSheet>
    </template>
  </div>
</template>
