<script setup lang="ts">
defineProps<{ title: string; to?: string }>()
</script>

<template>
  <header class="pagebar">
    <div class="pagebar-row">
      <NuxtLink :to="to || '/'" class="ico" aria-label="Voltar"><Icon name="back" :size="28" /></NuxtLink>
      <span class="pagebar-title">{{ title }}</span>
    </div>
    <div class="zig" />
  </header>
</template>
