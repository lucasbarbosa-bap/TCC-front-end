<script setup lang="ts">
const store = usePostsStore()
</script>

<template>
  <div>
    <PageBar title="Favoritos" />
    <LoadNotice />
    <TransitionGroup name="feed" tag="div" appear class="feed">
      <PostCard v-for="p in store.favs" :key="p.id" :post="p" />
    </TransitionGroup>
    <p v-if="store.loaded && !store.favs.length" class="empty">Você ainda não favoritou nada. Toque na estrela de qualquer post.</p>
  </div>
</template>
