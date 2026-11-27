<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const back = computed(() => (id.value === auth.id ? '/perfil' : `/usuarios/${id.value}`))
</script>

<template>
  <div>
    <PageBar title="Seguindo" :to="back" />
    <FollowList :user-id="id" kind="seguindo" />
  </div>
</template>
