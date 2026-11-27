<script setup lang="ts">
const open = useState('drawer', () => false)
const auth = useAuthStore()
const { dark, toggle } = useTheme()
const { show } = useToast()
const items: { t: string; to?: string }[] = [
  { t: 'Perfil', to: '/perfil' },
  { t: 'Notificações' },
  { t: 'Favoritos', to: '/favoritos' },
  { t: 'Chats', to: '/chats' },
  { t: 'Configurações', to: '/configuracoes' }
]
function go(i: { to?: string }) {
  open.value = false
  if (!auth.requireLogin()) return
  i.to ? navigateTo(i.to) : show('Em breve')
}
function enter() { open.value = false; auth.askLogin = true }
</script>

<template>
  <aside class="drawer" :class="{ open }" aria-label="Menu">
    <div class="drawer-top">
      <UserAvatar :name="auth.display" />
      <button class="ico" :aria-label="dark ? 'Usar tema claro' : 'Usar tema escuro'" @click="toggle">
        <Icon :name="dark ? 'moon' : 'sun'" :size="32" />
      </button>
    </div>
    <h2>{{ auth.display }}</h2>
    <small>{{ auth.logged ? 'Perfil / Estudante' : 'Navegando como visitante' }}</small>
    <button v-if="!auth.logged" class="link-btn" @click="enter">Entrar/Criar Conta:</button>
    <nav class="bars">
      <button v-for="(i, n) in items" :key="i.t" class="bar-item" :style="{ '--i': n }" @click="go(i)"><span class="mk" />{{ i.t }}</button>
    </nav>
  </aside>
</template>
