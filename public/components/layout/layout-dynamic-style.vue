<template>
  <!-- a little bit of dynamic css -->
  <!-- cf https://stackoverflow.com/a/57331310 -->
  <component :is="'style'">
    html {
    overflow-y: {{ htmlOverflow }} !important;
    }

    /* apply fonts */
    .v-application {
    font-family: {{ bodyFontFamily }} !important;
    }
    .v-application .text-subtitle-1, .v-application .text-subtitle-2, .v-application .text-body-1, .v-application .text-button, .v-application .text-caption, .v-application .text-overline  {
    font-family: {{ bodyFontFamily }} !important;
    }
    .v-application .text-h1, .v-application .text-h2, .v-application .text-h3, .v-application .text-h4, .v-application .text-h5, .v-application .text-h6 {
    font-family: {{ headingsFontFamily }} !important;
    }

    /* older typography classes */
    .v-application .subheading, .v-application .body-2, .v-application .body-1, .v-application .button, .v-application .caption, .v-application .overline {
    font-family: {{ bodyFontFamily }} !important;
    }
    .v-application .display-4, .v-application .display-3, .v-application .display-2, .v-application .display-1, .v-application .headline, .v-application .title {
    font-family: {{ headingsFontFamily }} !important;
    }

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
  props: {
    // defined here as the css rules from default and embed layout are loaded in the same chunk
    htmlOverflow: { type: String, default: 'auto' }
  },
  computed: {
    ...mapState(['textDark']),
    ...mapGetters(['readableThemeColor', 'bodyFontFamily', 'headingsFontFamily'])
  }
}

</script>

<style lang="css" scoped>
</style>
