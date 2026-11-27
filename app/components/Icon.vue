<script setup lang="ts">
defineProps<{ name: string; size?: number; fill?: boolean }>()
const P: Record<string, string> = {
  back: 'M19 12H5M11 5l-7 7 7 7',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  book: 'M3 5h7a2 2 0 012 2v13l-2.5-2H3zM21 5h-7a2 2 0 00-2 2v13l2.5-2H21z',
  share: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  edit: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19zM14.5 6.5l3 3',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  comment: 'M21 11.5a8.5 8.5 0 01-12.6 7.4L3 20.5l1.6-4.8A8.5 8.5 0 1121 11.5z',
  heart: 'M12 20s-7.5-4.6-9.2-9.3C1.7 7.5 3.7 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.2 0 5.2 3 4.1 6.2C19.5 15.4 12 20 12 20z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  plus: 'M12 5v14M5 12h14',
  camera: 'M4 8h3l1.5-2.5h7L17 8h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  image: 'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  mic: 'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM6 11a6 6 0 0012 0M12 17v4M9 21h6',
  docplus: 'M4 5h9M4 5v15h13v-8M8 10h6M8 14h6M18 3v6M15 6h6',
  close: 'M6 6l12 12M18 6L6 18'
}
// logos das redes (preenchidos)
const SOCIAL: Record<string, string> = {
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  facebook: 'M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.1H7.8v3h2.5V21z',
  google: 'M21.35 11.1H12v2.9h5.35c-.5 2.4-2.5 3.9-5.35 3.9a6 6 0 110-12c1.5 0 2.8.5 3.8 1.4l2.1-2.1A9 9 0 1012 21c5.2 0 8.7-3.6 8.7-8.8 0-.4 0-.8-.1-1.1z'
}
</script>

<template>
  <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24" aria-hidden="true"
       :fill="SOCIAL[name] || fill ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="SOCIAL[name] ? 0 : 1.8"
       stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'chatplus'">
      <path d="M3 8h13v9H9l-5 4v-4H3z" fill="currentColor" stroke="none" />
      <path d="M19.5 3v7M16 6.5h7" stroke-width="2.4" />
    </template>
    <path v-else :d="SOCIAL[name] || P[name]" />
  </svg>
</template>
