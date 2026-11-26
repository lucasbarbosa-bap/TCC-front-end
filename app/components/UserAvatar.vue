<script setup lang="ts">
const props = defineProps<{ name: string; big?: boolean; src?: string }>()
const auth = useAuthStore()
// a foto trocada neste navegador vale primeiro; senão, a foto que veio do servidor
const local = computed(() => (auth.logged && props.name === auth.user ? auth.avatar : ''))
const img = computed(() => local.value || props.src || '')
const initials = computed(() =>
  props.name.replace(/^(Prof\.|Profa\.)\s*/, '').split(/[\s_]+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())
</script>

<template>
  <div class="avatar" :class="{ big }" aria-hidden="true">
    <img v-if="img" :src="img" alt="" loading="lazy">
    <template v-else>{{ initials }}</template>
  </div>
</template>
