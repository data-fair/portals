<template>
  <preview>
    <div class="d-flex justify-center mb-4">
      <nav-link
        :link="{
          type: 'standard',
          subtype: 'home',
          title: t('goToHome'),
          icon: { custom: mdiHome }
        }"
        :config="config"
      />
    </div>
  </preview>
</template>

<script setup lang="ts">
import type { LinkConfig } from '#api/types/page-elements'
import { mdiHome } from '@mdi/js'

const { t } = useI18n()
defineProps<{ config: LinkConfig }>()

</script>

<i18n lang="yaml">
  en:
    goToHome: Go to Home
  fr:
    goToHome: Aller à l'accueil
</i18n>
