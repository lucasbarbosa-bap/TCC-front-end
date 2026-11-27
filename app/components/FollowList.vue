<script setup lang="ts">
// Lista de seguidores ou de quem o usuário segue (usada pelas duas telas).
interface Person { id: number; user: string; avatar: string }
const props = defineProps<{ userId: number; kind: 'seguidores' | 'seguindo' }>()
const auth = useAuthStore()
const follows = useFollowsStore()

const people = ref<Person[]>([])
const loading = ref(true)
const error = ref('')
const endpoint = computed(() => (props.kind === 'seguidores' ? 'followers' : 'following'))

async function load() {
  loading.value = true
  error.value = ''
  try {
    people.value = await $fetch<Person[]>(`/api/users/${props.userId}/${endpoint.value}`)
  } catch (e: any) {
    error.value = errMsg(e, 'Não foi possível carregar a lista. O servidor pode estar iniciando.')
  } finally { loading.value = false }
}
onMounted(() => { load(); if (auth.logged && !follows.loaded) follows.load() })
watch(() => [props.userId, props.kind], load)
// quem eu deixo de seguir na minha própria lista "Seguindo" continua visível até recarregar (dá para seguir de novo)
</script>

<template>
  <div>
    <p v-if="loading" class="chat-note" role="status">Carregando…</p>
    <p v-else-if="error" class="chat-note" role="alert">{{ error }} <button @click="load">Tentar de novo</button></p>
    <ul v-else-if="people.length" class="follow-list">
      <li v-for="u in people" :key="u.id" class="who-row">
        <NuxtLink :to="u.id === auth.id ? '/perfil' : `/usuarios/${u.id}`" class="who-link">
          <UserAvatar :name="u.user" :src="u.avatar" />
          <span class="who-txt"><strong>{{ u.user }}</strong></span>
        </NuxtLink>
        <FollowButton :user-id="u.id" :name="u.user" />
      </li>
    </ul>
    <p v-else class="empty">{{ kind === 'seguidores' ? 'Ninguém segue este perfil ainda.' : 'Este perfil ainda não segue ninguém.' }}</p>
  </div>
</template>
