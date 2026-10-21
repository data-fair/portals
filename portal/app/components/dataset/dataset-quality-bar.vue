<template>
  <div class="d-flex align-center ga-2">
    <!-- the percentage next to it carries the value -->
    <v-progress-linear
      :model-value="score"
      :color="score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error'"
      height="8"
      rounded
      aria-hidden="true"
    />
    <span class="font-weight-bold text-no-wrap">{{ score }} %</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ score: number }>()
</script>
