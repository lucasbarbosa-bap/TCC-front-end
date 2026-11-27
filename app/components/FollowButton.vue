<script setup lang="ts">
// Botão Seguir / Seguindo. Funciona no celular e no computador; some no próprio perfil.
const props = defineProps<{ userId: number | null | undefined; name?: string }>()
const auth = useAuthStore()
const follows = useFollowsStore()
const on = computed(() => follows.isFollowing(props.userId))
const show = computed(() => props.userId != null && props.userId !== auth.id)
const busy = computed(() => props.userId != null && follows.busy.includes(props.userId))
</script>

<template>
  <button
    v-if="show"
    type="button"
    class="btn follow-btn"
    :aria-pressed="on"
    :aria-label="`${on ? 'Deixar de seguir' : 'Seguir'}${name ? ' ' + name : ''}`"
    :disabled="busy"
    @click.stop="follows.toggle(userId)"
  >{{ on ? 'Seguindo' : 'Seguir' }}</button>
</template>
