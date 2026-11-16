<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <header class="pagebar">
    <NuxtLink to="/" class="ico" aria-label="Voltar"><Icon name="back" :size="30" /></NuxtLink>
    <h1>{{ title }}</h1>
  </header>
</template>
