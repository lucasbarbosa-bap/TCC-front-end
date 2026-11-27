<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const auth = useAuthStore()
const store = usePostsStore()
const { show } = useToast()
const TIPOS = ['Pergunta', 'Dica', 'Material', 'Discussão']
const MATERIAS = ['Matemática', 'Português', 'Física', 'Química', 'História', 'Inglês', 'Python', 'Banco de dados', 'Vue', 'Redação']
const text = ref('')
const tipo = ref('Pergunta')
const tag = ref('Matemática')
const files = ref<File[]>([])
const err = ref('')
const busy = ref(false)
const fileEl = ref<HTMLInputElement>()
const camEl = ref<HTMLInputElement>()
const gifEl = ref<HTMLInputElement>()

function pick(e: Event) {
  const input = e.target as HTMLInputElement
  const next = [...files.value, ...Array.from(input.files ?? [])]
  input.value = ''
  const bad = checkFiles(next, { max: 10, mb: 20, exts: [...IMG_EXT, ...VIDEO_EXT], label: 'o post' })
  if (bad) { err.value = bad; return }
  err.value = ''
  files.value = next
}
async function publish() {
  const t = text.value.trim()
  if (!t) { err.value = 'Escreva a sua pergunta.'; return }
  if (busy.value) return
  busy.value = true
  const ok = await store.add(t, tag.value, tipo.value, files.value)
  busy.value = false
  if (ok) { text.value = ''; files.value = []; err.value = ''; emit('close'); show('Publicado!') }
}
</script>

<template>
  <BaseSheet :open="open" label="Nova postagem" tall @close="emit('close')">
    <div class="np-top"><button class="btn" style="padding:0 14px" :disabled="busy" @click="publish">{{ busy ? 'Publicando…' : 'Publicar' }}</button></div>
    <div class="np-ask">
      <UserAvatar :name="auth.display" />
      <textarea v-model="text" placeholder="Qual sua pergunta?" aria-label="Sua pergunta" />
    </div>
    <ul v-if="files.length" class="up-list">
      <li v-for="(f, i) in files" :key="f.name + i"><span>{{ f.name }}</span><button type="button" :aria-label="`Remover ${f.name}`" @click="files.splice(i, 1)"><Icon name="close" :size="14" /></button></li>
    </ul>
    <p v-if="err" class="up-err" role="alert">{{ err }}</p>
    <div class="np-spacer" />
    <div class="np-opts">
      <label class="sel"><span class="mk" /><select v-model="tipo" aria-label="Tipo do post"><option v-for="t in TIPOS" :key="t">{{ t }}</option></select></label>
      <label class="sel"><span class="mk" /><select v-model="tag" aria-label="Matéria"><option v-for="m in MATERIAS" :key="m">{{ m }}</option></select></label>
    </div>
    <div class="zig" />
    <div class="np-icons">
      <input ref="fileEl" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,image/*,video/*" hidden @change="pick">
      <input ref="camEl" type="file" accept="image/*" capture="environment" hidden @change="pick">
      <input ref="gifEl" type="file" accept=".gif,image/gif" hidden @change="pick">
      <button type="button" aria-label="Anexar imagem ou vídeo" @click="fileEl?.click()"><Icon name="image" :size="28" /></button>
      <button type="button" aria-label="Tirar foto" @click="camEl?.click()"><Icon name="camera" :size="28" /></button>
      <button type="button" aria-label="Anexar GIF" @click="gifEl?.click()">GIF</button>
      <button type="button" aria-label="Agendar" @click="show('Em breve')"><Icon name="calendar" :size="28" /></button>
    </div>
  </BaseSheet>
</template>
