<template>
  <v-container>
    <v-row class="px-5">
      <v-col class="text-center">
        <template v-if="error.statusCode === 404">
          <v-img
            src="./undraw_page_not_found_su7k.png"
            :height="windowHeight / 2"
            contain
          />
          <h2 class="headline grey--text text--darken-1 my-5">
            La page demandée n'existe pas.
          </h2>
        </template>
        <template v-else-if="error.statusCode === 401 || error.statusCode === 403">
          <v-img
            src="./undraw_security_o890.png"
            :height="windowHeight / 2"
            contain
          />
          <h2
            v-if="error.statusCode === 401"
            class="headline grey--text text--darken-1 my-5"
          >
            Vous devez être authentifié pour accéder à cette page.
          </h2>
          <h2
            v-if="error.statusCode === 403"
            class="headline grey--text text--darken-1 my-5"
          >
            Vous n'avez pas les droits pour accéder à cette page.
          </h2>
        </template>
        <template v-else>
          <v-img
            src="./undraw_warning_cyit.png"
            :height="windowHeight / 2"
            contain
          />
          <h2 class="headline grey--text text--darken-1 my-5">
            Une erreur indéterminée s'est produite.
          </h2>
          <h2 class="headline grey--text text--darken-1 my-5">
            Si le problème persiste, vous pouvez nous contacter à <a href="mailto:support@koumoul.com">support@koumoul.com</a>.
          </h2>
        </template>
        <br>
        <nuxt-link :to="{name: 'index'}">
          Retour à l'accueil
        </nuxt-link>
        <v-col />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    error: { type: Object, default: null }
  }
}
</script>
