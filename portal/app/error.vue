<template>
  <!-- This page must stay minimal and self-sufficient: it can render while the portal
       config, theme or links are broken, so no header/footer/layout here. The static
       main landmark and html lang are the only structure it can safely promise. -->
  <main v-if="error.status !== 401">
    <v-container>
      <h1 class="text-headline-medium my-4">
        {{ error.status }} - {{ documentTitle }}
      </h1>
      <v-alert type="error">
        {{ error.message }}
      </v-alert>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{ error: NuxtError }>()
const { t, locale } = useI18n()

// Distinct document title per error type (RGAA 8.5)
const documentTitle = computed(() => {
  if (error.status === 404) return t('notFound')
  if (error.status === 403) return t('forbidden')
  return t('error')
})
useHead({ title: () => documentTitle.value, htmlAttrs: { lang: () => locale.value } })

console.log('Error: ', error)
if (error.status === 401) {
  const session = useSession()
  session.login()
}

</script>

<i18n lang="yaml">
  en:
    notFound: Page not found
    forbidden: Access forbidden
    error: An error occurred
  fr:
    notFound: Page introuvable
    forbidden: Accès interdit
    error: Une erreur s'est produite
</i18n>
