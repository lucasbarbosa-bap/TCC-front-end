<script setup lang="ts">
defineProps<{ name: string; size?: number }>()
const P: Record<string, string> = {
  back: 'M19 12H5M11 5l-7 7 7 7',
  share: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  edit: 'M11 4H4v16h16v-7M18.5 3.5a2.1 2.1 0 013 3L12 16l-4 1 1-4z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  dots: 'M12 5h.01M12 12h.01M12 19h.01'
}
</script>

<template>
  <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       :stroke-width="name === 'dots' ? 3.5 : 1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="P[name]" />
  </svg>
</template>
