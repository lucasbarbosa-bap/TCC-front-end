<script setup lang="ts">
defineProps<{ open: boolean; label: string; tall?: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div>
    <Transition name="fade"><div v-if="open" class="scrim" style="z-index:55" @click="emit('close')" /></Transition>
    <Transition name="sheet-up">
      <section v-if="open" class="sheet panel" :class="{ tall }" role="dialog" aria-modal="true" :aria-label="label" @keydown.esc="emit('close')">
        <i class="handle" />
        <slot />
      </section>
    </Transition>
  </div>
</template>
