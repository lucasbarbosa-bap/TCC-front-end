<script setup lang="ts">
const store = usePostsStore()
</script>

<template>
  <div v-if="store.loading && !store.loaded" class="sk-wrap" role="status" aria-live="polite">
    <p class="sk-note">
      {{ store.waking ? 'O servidor está acordando… pode levar até 1 minuto na primeira vez, depois fica rápido.' : 'Carregando posts…' }}
    </p>
    <div v-for="n in 3" :key="n" class="sk-post" aria-hidden="true">
      <i class="sk sk-av" />
      <div class="sk-body"><i class="sk sk-line w40" /><i class="sk sk-line" /><i class="sk sk-line w70" /></div>
    </div>
  </div>
  <p v-else-if="store.error" class="sk-note" role="alert">
    {{ store.error }} <button class="sk-retry" @click="store.load()">Tentar de novo</button>
  </p>
</template>
