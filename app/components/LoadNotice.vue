<script setup lang="ts">
const store = usePostsStore()
</script>

<template>
  <p v-if="store.loading && !store.loaded" class="notice" role="status">
    Carregando posts… Na primeira vez o servidor pode levar até 1 minuto para acordar.
  </p>
  <p v-else-if="store.error" class="notice" role="alert">
    {{ store.error }} <button class="link" @click="store.load()">Tentar de novo</button>
  </p>
</template>
