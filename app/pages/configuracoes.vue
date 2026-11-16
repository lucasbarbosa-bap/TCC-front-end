<script setup lang="ts">
const auth = useAuthStore()
const { show } = useToast()
function remove() {
  if (confirm('Excluir sua conta? Esta ação não pode ser desfeita.')) { auth.logout(); navigateTo('/') }
}
</script>

<template>
  <div class="gray">
    <PageBar title="Configurações" />
    <ul class="settings">
      <li><button @click="show('Em breve')">Sua Conta</button></li>
      <li><button @click="show('Em breve')">Privacidade e Segurança</button></li>
      <li><button @click="show('Em breve')">notificações</button></li>
      <li><button class="danger" @click="remove">excluir conta</button></li>
    </ul>
  </div>
</template>
