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

// "Quem seguir": autores de posts e comentários
const people = computed(() => {
  const m = new Map<string, string>()
  for (const p of store.posts) {
    if (p.name !== auth.user) m.set(p.name, p.role)
    for (const c of p.cms) if (c.n !== auth.user && !m.has(c.n)) m.set(c.n, c.r)
  }
  return [...m].map(([name, role]) => ({ name, role }))
})
const shownPeople = computed(() => (morePeople.value ? people.value : people.value.slice(0, 3)))
const handle = (n: string) => '@' + n.replace(/^(Prof\.|Profa\.)\s*/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '_')
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
        <button class="ico sm" :aria-label="`Não tenho interesse em ${t.tag}`" @click="hiddenTopics.push(t.tag)"><Icon name="dots" :size="18" /></button>
      </div>
      <button v-if="topics.length > 3" class="more-link" @click="moreTopics = !moreTopics">{{ moreTopics ? 'Mostrar menos' : 'Mostrar mais' }}</button>
    </section>

    <section class="card">
      <h2>Quem seguir</h2>
      <div v-for="u in shownPeople" :key="u.name" class="who-row">
        <UserAvatar :name="u.name" />
        <div class="who-txt"><strong>{{ u.name }}</strong><small>{{ handle(u.name) }} · {{ u.role }}</small></div>
        <button class="pill sm" :aria-pressed="store.following.includes(u.name)" @click="store.toggleFollow(u.name)">
          {{ store.following.includes(u.name) ? 'Seguindo' : 'Seguir' }}
        </button>
      </div>
      <button v-if="people.length > 3" class="more-link" @click="morePeople = !morePeople">{{ morePeople ? 'Mostrar menos' : 'Mostrar mais' }}</button>
    </section>
  </aside>
</template>
