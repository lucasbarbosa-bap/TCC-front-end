<script setup lang="ts">
const store = usePostsStore()
const auth = useAuthStore()
const hiddenTopics = ref<string[]>([])
const moreTopics = ref(false)
const morePeople = ref(false)

// "O que está acontecendo": assuntos (tags) ordenados pela quantidade de posts
const topics = computed(() => {
  const map = new Map<string, { tag: string; posts: number; title: string; likes: number }>()
  for (const p of store.posts) {
    const t = map.get(p.tag) ?? { tag: p.tag, posts: 0, title: p.title, likes: -1 }
    t.posts++
    if (p.likes > t.likes) { t.likes = p.likes; t.title = p.title }
    map.set(p.tag, t)
  }
  return [...map.values()].filter(t => !hiddenTopics.value.includes(t.tag)).sort((a, b) => b.posts - a.posts || b.likes - a.likes)
})
const shownTopics = computed(() => (moreTopics.value ? topics.value : topics.value.slice(0, 3)))

// "Quem seguir": autores dos posts
const people = computed(() => {
  const m = new Map<string, { id: number; name: string; avatar: string }>()
  for (const p of store.posts) if (p.authorId != null && p.authorId !== auth.id && !m.has(p.name)) m.set(p.name, { id: p.authorId, name: p.name, avatar: p.avatar })
  return [...m.values()]
})
const shownPeople = computed(() => (morePeople.value ? people.value : people.value.slice(0, 3)))
const handle = (n: string) => '@' + n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '_')
</script>

<template>
  <aside class="right" aria-label="Sugestões">
    <section class="card">
      <h2>O que está acontecendo</h2>
      <div v-for="t in shownTopics" :key="t.tag" class="topic">
        <div>
          <small>{{ t.tag }} · Assunto do momento</small>
          <button class="topic-title" @click="store.setTag(t.tag)">{{ t.title }}</button>
          <small>{{ t.posts }} {{ t.posts === 1 ? 'post' : 'posts' }}</small>
        </div>
        <button class="ico sm" :aria-label="`Não tenho interesse em ${t.tag}`" @click="hiddenTopics.push(t.tag)"><Icon name="close" :size="16" /></button>
      </div>
      <button v-if="topics.length > 3" class="more-link" @click="moreTopics = !moreTopics">{{ moreTopics ? 'Mostrar menos' : 'Mostrar mais' }}</button>
    </section>

    <section class="card">
      <h2>Quem seguir</h2>
      <div v-for="u in shownPeople" :key="u.name" class="who-row">
        <NuxtLink :to="`/usuarios/${u.id}`" class="who-link">
          <UserAvatar :name="u.name" :src="u.avatar" />
          <div class="who-txt"><strong>{{ u.name }}</strong><small>{{ handle(u.name) }}</small></div>
        </NuxtLink>
        <FollowButton :user-id="u.id" :name="u.name" />
      </div>
      <button v-if="people.length > 3" class="more-link" @click="morePeople = !morePeople">{{ morePeople ? 'Mostrar menos' : 'Mostrar mais' }}</button>
    </section>
  </aside>
</template>
