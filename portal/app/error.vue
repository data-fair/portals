<template>
  <v-container>
    <v-alert
      v-if="error.statusCode !== 401"
      type="error"
    >
      {{ error.message }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{ error: NuxtError }>()

console.log('Error: ', error)
if (error.statusCode === 401) {
  const session = useSession()
  session.login()
}

</script>
