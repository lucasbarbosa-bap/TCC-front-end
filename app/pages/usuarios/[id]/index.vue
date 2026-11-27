<script setup lang="ts">
// Perfil de outro usuário: botão Seguir, seguidores, seguindo e posts dele.
interface Profile { id: number; user: string; avatar: string; bio: string; following: number; followers: number }
const route = useRoute()
const auth = useAuthStore()
const store = usePostsStore()
const follows = useFollowsStore()
const id = computed(() => Number(route.params.id))

// o próprio perfil tem tela própria
if (auth.id != null && id.value === auth.id) await navigateTo('/perfil', { replace: true })

const profile = ref<Profile | null>(null)
const error = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  error.value = ''
  try {
    profile.value = await $fetch<Profile>(`/api/users/${id.value}`)
  } catch (e: any) {
    error.value = errMsg(e, 'Não foi possível carregar este perfil.')
  } finally { loading.value = false }
}
onMounted(() => { load(); if (auth.logged && !follows.loaded) follows.load() })
watch(id, load)

const posts = computed(() => store.posts.filter(p => p.authorId === id.value))

// depois de seguir/deixar de seguir, busca o número real de seguidores no servidor
watch(() => follows.busy.length, (n, old) => { if (old > 0 && n === 0) load() })
</script>

<template>
  <div>
    <PageBar title="Perfil" />
    <p v-if="loading && !profile" class="chat-note" role="status">Carregando perfil… O servidor pode levar até 1 minuto para acordar.</p>
    <p v-else-if="error" class="chat-note" role="alert">{{ error }} <button @click="load">Tentar de novo</button></p>

    <template v-else-if="profile">
      <div class="id user-id">
        <div class="id-right">
          <UserAvatar :name="profile.user" :src="profile.avatar" big />
          <div class="id-name"><h1>{{ profile.user }}</h1></div>
          <small>Perfil / Estudante</small>
        </div>
        <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
        <div class="user-actions"><FollowButton :user-id="profile.id" :name="profile.user" /></div>
      </div>

      <div class="stats s3">
        <NuxtLink :to="`/usuarios/${profile.id}/seguidores`" class="stat"><span>Seguidores</span><b>{{ profile.followers }}</b></NuxtLink>
        <NuxtLink :to="`/usuarios/${profile.id}/seguindo`" class="stat"><span>Seguindo</span><b>{{ profile.following }}</b></NuxtLink>
        <div><span>Posts</span><b>{{ posts.length }}</b></div>
      </div>

      <LoadNotice />
      <TransitionGroup name="feed" tag="div" class="feed">
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </TransitionGroup>
      <p v-if="store.loaded && !posts.length" class="empty">Nenhum post por aqui ainda.</p>
    </template>
  </div>
</template>
