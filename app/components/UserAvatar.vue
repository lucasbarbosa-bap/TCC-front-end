<script setup lang="ts">
const props = defineProps<{ name: string; big?: boolean; src?: string }>()
const auth = useAuthStore()
// foto que veio do servidor; para o próprio usuário, a foto do perfil dele
const img = computed(() => props.src || (auth.logged && props.name === auth.user ? auth.avatar : ''))
const initials = computed(() => props.name.split(/[\s_]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase())
</script>

<template>
  <div class="avatar" :class="{ big }" aria-hidden="true">
    <img v-if="img" :src="img" alt="" loading="lazy">
    <template v-else>{{ initials }}</template>
  </div>
</template>
