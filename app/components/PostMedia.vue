<script setup lang="ts">
const props = defineProps<{ items?: string[]; small?: boolean }>()
const list = computed(() => props.items ?? [])
</script>

<template>
  <div v-if="list.length" class="pm" :class="[`n${Math.min(list.length, 4)}`, { small }]">
    <template v-for="u in list" :key="u">
      <video v-if="isVideo(u)" :src="u" controls preload="metadata" playsinline />
      <a v-else :href="u" target="_blank" rel="noopener"><img :src="u" alt="Imagem anexada" loading="lazy"></a>
    </template>
  </div>
</template>
