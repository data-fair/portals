<template>
  <v-container max-width="600">
    <h2 class="text-h4 mt-4">
      <v-icon
        size="large"
        color="primary"
        style="top:-2px"
        :icon="mdiCloudKey"
      />
      Clés d'API
    </h2>
    <p class="my-4">
      Les clés d'API sont utiles pour accéder aux données en levant certaines restrictions imposées aux utilisateurs anonymes ou pour exploiter des données privées auxquelles votre compte a accès.
    </p>
    <v-alert
      type="info"
      variant="outlined"
    >
      Pour la plupart des usages simples sur un jeu de données public une clé d'API n'est pas nécessaire.
    </v-alert>
    <d-frame :src="`/data-fair/next-ui/embed/settings/${session.state.account.type}/${session.state.account.id}/api-keys?scopes=datasets`" />
  </v-container>
</template>

<script setup lang="ts">
import { mdiCloudKey } from '@mdi/js'

definePageMeta({ layout: 'personal' })
const session = useSessionAuthenticated()

</script>
