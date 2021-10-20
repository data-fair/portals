<template>
  <v-container class="pb-0" style="background-color: #fcfcfc;">
    <v-row v-if="config.headerSocial">
      <v-spacer /><social-links />
    </v-row>
    <v-row align="center" class="ma-1">
      <layout-header-logo />
      <layout-header-logo-2 v-if="$vuetify.breakpoint.xs" :config="config" />
      <v-col class="text-center">
        <h1 :class="`${$vuetify.breakpoint.xs ? 'headline' : 'display-1'} grey--text text--darken-2 font-weight-bold`">
          {{ config.title }}
        </h1>
      </v-col>
      <layout-header-logo-2 v-if="!$vuetify.breakpoint.xs" :config="config" />
    </v-row>
  </v-container>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  export default {
    computed: {
      ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
      ...mapGetters(['themeColorDark']),
    },
  }
</script>

<style>

</style>
