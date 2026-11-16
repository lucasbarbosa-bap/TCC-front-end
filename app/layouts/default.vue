<script setup lang="ts">
const auth = useAuthStore()
const drawer = useState('drawer', () => false)
const msg = useState('toast', () => '')
const route = useRoute()
// O pop-up aparece para quem não entrou e não escolheu navegar sem conta, ou quando uma ação exige login.
const modal = computed(() => !auth.logged && (!auth.guest || auth.askLogin))
watch(() => route.path, () => { drawer.value = false })
onMounted(() => { auth.restore(); usePostsStore().load() })
</script>

<template>
  <div class="shell" :inert="modal ? '' : undefined"><slot /></div>
  <RightPanel v-if="route.path === '/'" :inert="modal ? '' : undefined" />
  <DrawerMenu />
  <Transition name="fade"><div v-if="drawer" class="scrim drawer-scrim" @click="drawer = false" /></Transition>
  <Transition name="modal"><AuthModal v-if="modal" /></Transition>
  <Transition name="toast"><div v-if="msg" class="toast" role="status">{{ msg }}</div></Transition>
</template>
