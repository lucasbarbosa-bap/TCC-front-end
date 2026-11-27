<script setup lang="ts">
const auth = useAuthStore()
const posts = usePostsStore()
const drawer = useState('drawer', () => false)
const msg = useState('toast', () => '')
const route = useRoute()
// O pop-up aparece para quem não entrou e não escolheu navegar sem conta, ou quando uma ação exige login.
const modal = computed(() => !auth.logged && (!auth.guest || auth.askLogin))
const inChat = computed(() => /^\/chats\/[^/]+/.test(route.path))   // a conversa aberta tem a própria barra embaixo

watch(() => route.path, () => { drawer.value = false })
onMounted(() => {
  posts.hydrate()   // mostra na hora o último feed salvo, enquanto busca o novo
  posts.load()
  if (auth.logged) { auth.loadProfile(); posts.initFavs(auth.id) }
})
watch(() => auth.logged, (ok) => {
  if (ok) { auth.loadProfile(); posts.initFavs(auth.id) } else { posts.favIds = [] }
  posts.load()   // atualiza as curtidas de quem entrou ou saiu
})
</script>

<template>
  <div class="shell" :inert="modal ? '' : undefined"><slot /></div>
  <RightPanel v-if="route.path === '/'" :inert="modal ? '' : undefined" />
  <DrawerMenu />
  <Transition name="fade"><div v-if="drawer" class="scrim drawer-scrim" @click="drawer = false" /></Transition>
  <div v-if="!inChat" class="zig-bottom" aria-hidden="true" />
  <Transition name="modal"><AuthModal v-if="modal" /></Transition>
  <Transition name="toast"><div v-if="msg" class="toast" role="status">{{ msg }}</div></Transition>
</template>
