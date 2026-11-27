<script setup lang="ts">
const { show } = useToast()
const items: { t: string; to?: string }[] = [
  { t: 'Sua conta', to: '/perfil' },
  { t: 'Privacidade' },
  { t: 'Notificações' },
  { t: 'Chats', to: '/chats' }
]
function go(i: { to?: string }) { i.to ? navigateTo(i.to) : show('Em breve') }
</script>

<template>
  <div>
    <PageBar title="Configurações" />
    <nav class="bars settings">
      <button v-for="i in items" :key="i.t" class="bar-item" @click="go(i)"><span class="mk" />{{ i.t }}</button>
    </nav>
  </div>
</template>
