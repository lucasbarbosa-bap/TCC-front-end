<script setup lang="ts">
const store = usePostsStore()
const tab = ref('foryou')
const list = computed(() => store.filtered.filter(p => tab.value === 'foryou' || store.following.includes(p.name)))
</script>

<template>
  <div>
    <AppHeader v-model:tab="tab" />
    <LoadNotice />
    <button v-if="store.activeTag" class="chip on filter" @click="store.setTag(store.activeTag!)">{{ store.activeTag }} ✕</button>
    <TransitionGroup name="feed" tag="div" appear class="feed">
      <PostCard v-for="(p, i) in list" :key="p.id" :post="p" :style="{ '--i': Math.min(i, 8) }" />
    </TransitionGroup>
    <p v-if="store.loaded && !list.length" class="empty">{{ tab === 'following' ? 'Você ainda não segue ninguém com posts por aqui.' : 'Nada encontrado.' }}</p>
  </div>
</template>
