<script setup lang="ts">
const open = useState('drawer', () => false)
const auth = useAuthStore()
const { dark, toggle } = useTheme()
const { show } = useToast()
const items: { t: string; to?: string; auth?: boolean }[] = [
  { t: 'Início', to: '/' },
  { t: 'Perfil', to: '/perfil', auth: true },
  { t: 'Notificações', auth: true },
  { t: 'Favoritos', to: '/favoritos', auth: true },
  { t: 'Chats', auth: true },
  { t: 'Configurações', to: '/configuracoes', auth: true }
]
function go(i: { to?: string; auth?: boolean }) {
  open.value = false
  if (i.auth && !auth.requireLogin()) return
  i.to ? navigateTo(i.to) : show('Em breve')
}
function enter() { open.value = false; auth.askLogin = true }
</script>

<template>
  <aside class="drawer" :class="{ open }" aria-label="Menu">
    <div class="drawer-top">
      <UserAvatar :name="auth.display" />
      <button class="ico" :aria-label="dark ? 'Usar tema claro' : 'Usar tema escuro'" @click="toggle">
        <Icon :name="dark ? 'moon' : 'sun'" :size="30" />
      </button>
    </div>
    <h2>{{ auth.display }}</h2>
    <small>{{ auth.logged ? 'perfil de estudante' : 'navegando sem conta' }}</small>
    <button v-if="!auth.logged" class="pill sm enter" @click="enter">Entrar ou criar conta</button>
    <nav>
      <button v-for="(i, n) in items" :key="i.t" :style="{ '--i': n }" @click="go(i)">{{ i.t }}</button>
    </nav>
  </aside>
</template>
