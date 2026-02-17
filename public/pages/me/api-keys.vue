<template lang="html">
  <v-container style="max-width:640px !important;">
    <h2 class="text-h4 my-4 ml-3">
      <v-icon
        size="36"
        color="primary"
        style="top: -2px"
      >
        mdi-cloud-circle
      </v-icon> Clés d'API
    </h2>
    <p class="mt-6">
      Les clés d'API sont utiles pour accéder aux données en levant certaines restrictions imposées aux utilisateurs anonymes ou pour exploiter des données privées auxquelles votre compte a accès.
    </p>
    <v-alert
      type="info"
      outlined
    >
      Pour la plupart des usages simples sur un jeu de données public une clé n'est pas nécessaire.
    </v-alert>
    <d-frame-wrapper
      iframe-title="Mes clés d'API"
      :src="apiKeysUrl"
    />
  </v-container>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'personal',
  middleware: ['portal-required', 'auth-required'],
  computed: {
    ...mapState(['config']),
    ...mapGetters(['dataFairUrl']),
    ...mapGetters('session', ['activeAccount']),
    ...mapState('session', ['user']),
    apiKeysUrl () {
      return `${this.dataFairUrl}/embed/settings/${this.activeAccount.type}/${this.activeAccount.id}/api-keys?scopes=datasets`
    }
  }
}
</script>
