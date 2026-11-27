<script setup lang="ts">
const store = usePostsStore()
const auth = useAuthStore()
const composing = ref(false)
function ask() { if (auth.requireLogin()) composing.value = true }
</script>

<template>
  <div>
    <AppHeader />
    <button class="ask" @click="ask"><UserAvatar :name="auth.display" /><span>Qual sua pergunta?</span></button>
    <LoadNotice />
    <button v-if="store.activeTag" class="chip on filter" @click="store.setTag(store.activeTag!)">#{{ store.activeTag }} ✕</button>
    <TransitionGroup name="feed" tag="div" appear class="feed">
      <PostCard v-for="(p, i) in store.filtered" :key="p.id" :post="p" :style="{ '--i': Math.min(i, 8) }" />
    </TransitionGroup>
    <p v-if="store.loaded && !store.filtered.length" class="empty">Nada encontrado.</p>
    <button class="fab" aria-label="Nova postagem" @click="ask"><Icon name="docplus" :size="34" /></button>
    <NewPostSheet :open="composing" @close="composing = false" />
  </div>
</template>
