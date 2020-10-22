<template>
  <v-container>
    <v-layout column align-center class="px-5">
      <template v-if="error.statusCode === 404">
        <v-img src="./undraw_page_not_found_su7k.png" :height="windowHeight / 2" contain />
        <h2 class="headline grey--text text--darken-1 my-5">
          La page demandée n'existe pas.
        </h2>
      </template>
      <template v-else-if="error.statusCode === 401 || error.statusCode === 403">
        <v-img src="./undraw_security_o890.png" :height="windowHeight / 2" contain />
        <div class="headline grey--text text--darken-2 mb-5">
          {{ error.message || `Vous n'avez pas les droits pour accéder à cette page.` }}
        </div>
      </template>
      <template v-else>
        <v-img src="./undraw_warning_cyit.png" :height="windowHeight / 2" contain />
        <div class="headline grey--text text--darken-2">
          Une erreur indéterminée s'est produite.
        </div>
        <div class="headline grey--text text--darken-2 mb-5">
          Si le problème persiste, vous pouvez nous contacter à <a href="mailto:support@koumoul.com">support@koumoul.com</a>.
        </div>
      </template>
      <nuxt-link :to="{name: 'index'}">
        Retour à l'accueil
      </nuxt-link>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: {
    error: { type: Object, default: null }
  }
}
</script>
