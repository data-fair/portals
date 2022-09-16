<template>
  <!-- a little bit of dynamic css -->
  <!-- cf https://stackoverflow.com/a/57331310 -->
  <component :is="'style'">
    html {
    overflow-y: {{ htmlOverflow }} !important;
    }

    .v-application.theme--light#app {
    background: {{ backgroundColor }};
    }

    .v-btn.primary.theme--light {
    background: linear-gradient(90deg, {{ config.themeColor }} 0%, {{ darkPrimary10 }} 100%);
    }
    .v-application.theme--light .v-btn.primary.v-btn--has-bg {
    border: 1px solid {{ darkPrimary10 }} !important;
    }

    /* apply fonts */
    {{ fontsStyle }}

    / * some police tuning */
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
    .v-application .secondary--text {
    color: {{ readableSecondaryColor }}!important;
    }

    /* style of the main app bar */
    {{ appBarStyle }}

    /* style of the personal navigation bar */
    {{ personalNavigationStyle }}
  </component>
</template>
<script>
const { mapState, mapGetters } = require('vuex')

export default {
  props: {
    // defined here as the css rules from default and embed layout are loaded in the same chunk
    htmlOverflow: { type: String, default: 'auto' },
    applyFonts: { type: Boolean, default: true }
  },
  computed: {
    ...mapState(['textDark', 'config']),
    ...mapGetters([
      'backgroundColor',
      'readableThemeColor',
      'backgroundableThemeColor',
      'themeColorDark',
      'secondaryColorDark',
      'secondaryColor',
      'readableSecondaryColor',
      'backgroundableSecondaryColor',
      'bodyFontFamily',
      'headingsFontFamily',
      'personalNavigationColor',
      'personalNavigationColorDark'
    ]),
    darkPrimary10 () {
      return this.$color(this.config.themeColor).darken(10).toHexString()
    },
    lightPrimary10 () {
      return this.$color(this.config.themeColor).brighten(10).toHexString()
    },
    lightPrimary20 () {
      return this.$color(this.config.themeColor).brighten(20).toHexString()
    },
    fontsStyle () {
      if (!this.applyFonts) return ''
      return `
    .v-application {
    font-family: ${this.bodyFontFamily} !important;
    }
    .v-application .text-subtitle-1, .v-application .text-subtitle-2, .v-application .text-body-1, .v-application .text-button, .v-application .text-caption, .v-application .text-overline  {
    font-family: ${this.bodyFontFamily} !important;
    }
    .v-application .text-h1, .v-application .text-h2, .v-application .text-h3, .v-application .text-h4, .v-application .text-h5, .v-application .text-h6 {
    font-family: ${this.headingsFontFamily} !important;
    }

    /* older typography classes */
    .v-application .subheading, .v-application .body-2, .v-application .body-1, .v-application .button, .v-application .caption, .v-application .overline {
    font-family: ${this.bodyFontFamily} !important;
    }
    .v-application .display-4, .v-application .display-3, .v-application .display-2, .v-application .display-1, .v-application .headline, .v-application .title {
    font-family: ${this.headingsFontFamily} !important;
    }
      `
    },
    appBarStyle () {
      // various styles of the app bar
      let color1, color2
      if (this.config.appBarColor === 'primaryGradient1' && this.themeColorDark) {
        color1 = this.lightPrimary10
        color2 = this.$color(this.config.themeColor).darken(20).toHexString()
      }
      if (this.config.appBarColor === 'primaryGradient1' && !this.themeColorDark) {
        color1 = this.lightPrimary20
        color2 = this.darkPrimary10
      }
      if (this.config.appBarColor === 'secondaryGradient1' && this.secondaryColorDark) {
        color1 = this.$color(this.secondaryColor).brighten(10).toHexString()
        color2 = this.$color(this.secondaryColor).darken(20).toHexString()
      }
      if (this.config.appBarColor === 'secondaryGradient1' && !this.secondaryColorDark) {
        color1 = this.$color(this.secondaryColor).brighten(20).toHexString()
        color2 = this.$color(this.secondaryColor).darken(10).toHexString()
      }
      if (this.config.appBarColor === 'primarySecondaryGradient' && this.themeColorDark) {
        color1 = this.config.themeColor
        color2 = this.readableSecondaryColor
      }
      if (this.config.appBarColor === 'primarySecondaryGradient' && !this.themeColorDark) {
        color1 = this.config.themeColor
        color2 = this.backgroundableSecondaryColor
      }
      if (this.config.appBarColor === 'secondaryPrimaryGradient' && this.secondaryColorDark) {
        color1 = this.secondaryColor
        color2 = this.readableThemeColor
      }
      if (this.config.appBarColor === 'secondaryPrimaryGradient' && !this.secondaryColorDark) {
        color1 = this.secondaryColor
        color2 = this.backgroundableThemeColor
      }
      if (color1 && color2) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${color1} 20%, ${color2} 100%);
      }
      `
      }
      return ''
    },
    personalNavigationStyle () {
      const darkened = this.$color(this.personalNavigationColor).darken(10).toHexString()
      const brightened = this.$color(this.personalNavigationColor).brighten(10).toHexString()
      let color1, color2
      if (this.personalNavigationColorDark) {
        color1 = darkened
        color2 = brightened
      } else {
        color1 = brightened
        color2 = darkened
      }
      return `
    .navigation-left {
    background: linear-gradient(90deg, ${color1} 0%, ${color2} 100%);
    }
    .v-application.theme--light .navigation-left {
    border-right: 1px solid ${color1} !important;
    }
    `
    }
  }
}

</script>

<style lang="css" scoped>
</style>
