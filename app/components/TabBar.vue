<script setup lang="ts">
defineProps<{ tabs: { id: string; label: string }[] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="ptabs" role="tablist">
    <button v-for="t in tabs" :key="t.id" role="tab" :aria-selected="model === t.id" :class="{ on: model === t.id }" @click="model = t.id">
      <span v-if="model === t.id" class="mk" />{{ t.label }}
    </button>
  </div>
</template>
