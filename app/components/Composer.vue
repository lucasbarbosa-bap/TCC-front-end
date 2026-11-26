<script setup lang="ts">
const store = usePostsStore()
const emit = defineEmits<{ published: [] }>()
const text = ref('')
const tag = ref('Matemática')
const busy = ref(false)
const files = ref<File[]>([])
const fileEl = ref<HTMLInputElement>()
const err = ref('')

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
  if (!t || busy.value) return
  busy.value = true
  const ok = await store.add(t, tag.value, files.value)
  busy.value = false
  if (ok) { text.value = ''; files.value = []; err.value = ''; emit('published') }
}
</script>

<template>
  <section class="composer">
    <input v-model="text" class="pill write" placeholder="Qual é a sua dúvida?" aria-label="Nova publicação" @keyup.enter="publish">
    <select v-model="tag" class="pill" aria-label="Tag">
      <option>Matemática</option><option>Python</option><option>Banco de dados</option><option>Vue</option><option>Redação</option>
    </select>
    <input ref="fileEl" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,image/*,video/*" hidden @change="pick">
    <button type="button" class="pill" @click="fileEl?.click()">Anexar{{ files.length ? ` (${files.length})` : '' }}</button>
    <button class="pill" :disabled="busy" @click="publish">{{ busy ? 'Publicando…' : 'Publicar' }}</button>
    <ul v-if="files.length" class="up-list">
      <li v-for="(f, i) in files" :key="f.name + i"><span>{{ f.name }}</span><button type="button" :aria-label="`Remover ${f.name}`" @click="files.splice(i, 1)">✕</button></li>
    </ul>
    <p v-if="err" class="up-err" role="alert">{{ err }}</p>
  </section>
</template>
