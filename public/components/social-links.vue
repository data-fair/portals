<template>
  <div>
    <v-btn
      v-if="config.twitter"
      :href="'https://twitter.com/' + config.twitter"
      icon
      color="primary"
      target="blank"
      title="Compte Twitter"
    >
      <v-icon>mdi-twitter</v-icon>
    </v-btn>

    <v-btn
      v-if="config.facebook"
      :href="'https://www.facebook.com/' + config.facebook"
      icon
      color="primary"
      target="blank"
      title="Compte Facebook"
    >
      <v-icon>mdi-facebook</v-icon>
    </v-btn>

    <v-btn
      v-if="config.youtube"
      :href="'https://www.youtube.com/channel/' + config.youtube"
      icon
      color="primary"
      target="blank"
      title="Chaîne Youtube"
    >
      <v-icon>mdi-youtube</v-icon>
    </v-btn>

    <v-btn
      v-if="config.vimeo"
      :href="'https://vimeo.com/' + config.vimeo"
      icon
      color="primary"
      target="blank"
      title="Chaîne Vimeo"
    >
      <v-icon>mdi-vimeo</v-icon>
    </v-btn>

    <v-btn
      v-if="config.linkedin"
      :href="'https://www.linkedin.com/company/' + config.linkedin"
      icon
      color="primary"
      target="blank"
      title="Compte LinkedIn"
    >
      <v-icon>mdi-linkedin</v-icon>
    </v-btn>

    <v-btn
      v-if="config.instagram"
      :href="'https://www.instagram.com/' + config.instagram"
      icon
      color="primary"
      target="blank"
      title="Compte Instagram"
    >
      <v-icon>mdi-instagram</v-icon>
    </v-btn>
  </div>
</template>

<script>
const { mapState } = require('vuex')
export default {
  computed: {
    ...mapState(['config'])
  }
}
</script>

<style>

</style>
