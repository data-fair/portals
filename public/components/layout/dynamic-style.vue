<template>
  <!-- a little bit of dynamic css -->
  <!-- cf https://stackoverflow.com/a/57331310 -->
  <component :is="'style'">
    .v-application a {
    color: {{ readableThemeColor }};
    }

    .v-application .area--dark a, .v-application .area--dark h3, .v-application .area--dark span {
    color: white;
    }

    .v-application .area--light a, .v-application .area--light h3, .v-application .area--light span, .v-application .area--light .v-tabs-bar.primary .v-tab--active {
    color: {{ textDark }};
    }

    .v-application .primary--text {
    color: {{ readableThemeColor }}!important;
    }
  </component>
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  computed: {
    ...mapState(['textDark']),
    ...mapGetters(['readableThemeColor'])
  }
}
</script>

<style lang="css" scoped>
</style>
