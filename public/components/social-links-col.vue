<template>
  <v-col
    v-if="config.twitter || config.facebook || config.linkedin || config.youtube || config.instagram"
    :class="{'pa-0': true, 'white--text': dark}"
  >
    <h5>
      Retrouvez-nous sur les réseaux sociaux
    </h5>
    <social-links />
  </v-col>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    props: ['dark'],
    computed: {
      ...mapState(['config']),
    },
  }
</script>

<style>

</style>
