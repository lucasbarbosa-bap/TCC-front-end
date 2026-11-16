<script setup lang="ts">
const props = defineProps<{ name: string; big?: boolean }>()
const auth = useAuthStore()
const src = computed(() => (auth.logged && props.name === auth.user ? auth.avatar : ''))
const initials = computed(() =>
  props.name.replace(/^(Prof\.|Profa\.)\s*/, '').split(/[\s_]+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())
</script>

<template>
  <div class="avatar" :class="{ big }" aria-hidden="true">
    <img v-if="src" :src="src" alt="">
    <template v-else>{{ initials }}</template>
  </div>
</template>
