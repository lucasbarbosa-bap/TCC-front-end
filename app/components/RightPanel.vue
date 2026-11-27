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
  const m = new Map<string, { name: string; avatar: string }>()
  for (const p of store.posts) if (p.name !== auth.user && !m.has(p.name)) m.set(p.name, { name: p.name, avatar: p.avatar })
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
        <UserAvatar :name="u.name" :src="u.avatar" />
        <div class="who-txt"><strong>{{ u.name }}</strong><small>{{ handle(u.name) }}</small></div>
        <button class="btn" :aria-pressed="store.following.includes(u.name)" @click="store.toggleFollow(u.name)">
          {{ store.following.includes(u.name) ? 'Seguindo' : 'Seguir' }}
        </button>
      </div>
      <button v-if="people.length > 3" class="more-link" @click="morePeople = !morePeople">{{ morePeople ? 'Mostrar menos' : 'Mostrar mais' }}</button>
    </section>
  </aside>
</template>
