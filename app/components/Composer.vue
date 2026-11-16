<script setup lang="ts">
const store = usePostsStore()
const emit = defineEmits<{ published: [] }>()
const text = ref('')
const tag = ref('Matemática')
const busy = ref(false)

async function publish() {
  const t = text.value.trim()
  if (!t || busy.value) return
  busy.value = true
  const ok = await store.add(t, tag.value)
  busy.value = false
  if (ok) { text.value = ''; emit('published') }
}
</script>

<template>
  <section class="composer">
    <input v-model="text" class="pill write" placeholder="Qual é a sua dúvida?" aria-label="Nova publicação" @keyup.enter="publish">
    <select v-model="tag" class="pill" aria-label="Tag">
      <option>Matemática</option><option>Python</option><option>Banco de dados</option><option>Vue</option><option>Redação</option>
    </select>
    <button class="pill" :disabled="busy" @click="publish">{{ busy ? 'Publicando…' : 'Publicar' }}</button>
  </section>
</template>
