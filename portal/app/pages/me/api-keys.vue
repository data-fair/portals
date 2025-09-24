<template>
  <v-container max-width="600">
    <h2 class="text-h4 mt-4">
      <v-icon
        size="large"
        color="primary"
        style="top:-2px"
        :icon="mdiCloudKey"
      />
      {{ t('apiKeys') }}
    </h2>
    <p class="my-4">
      {{ t('apiKeysInfo') }}
    </p>
    <v-alert
      type="info"
      variant="outlined"
      :text="t('apiKeysAlert')"
    />
    <d-frame :src="`/data-fair/next-ui/embed/settings/${session.state.account.type}/${session.state.account.id}/api-keys?scopes=datasets`" />
  </v-container>
</template>

<script setup lang="ts">
import { mdiCloudKey } from '@mdi/js'

const session = useSessionAuthenticated()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    apiKeys: API Keys
    apiKeysInfo: API keys are useful to access data by lifting some restrictions imposed to anonymous users or to exploit private data your account has access to.
    apiKeysAlert: For most simple uses on a public dataset an API key is not necessary.

  fr:
    apiKeys: Clés d'API
    apiKeysInfo: Les clés d'API sont utiles pour accéder aux données en levant certaines restrictions imposées aux utilisateurs anonymes ou pour exploiter des données privées auxquelles votre compte a accès.
    apiKeysAlert: Pour la plupart des usages simples sur un jeu de données public une clé d'API n'est pas nécessaire.
</i18n>
