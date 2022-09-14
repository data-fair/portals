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
    .v-application .secondary--text {
    color: {{ readableSecondaryColor }}!important;
    }

    {{ appBarStyle }}
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
      'bodyFontFamily', 'headingsFontFamily'
    ]),
    appBarStyle () {
      // various styles of the app bar
      if (this.config.appBarColor === 'primaryGradient1' && this.themeColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.$color(this.config.themeColor).brighten(10).toHexString()} 20%, ${this.$color(this.config.themeColor).darken(20).toHexString()} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.$color(this.config.themeColor).darken(20).toHexString()} !important;
      }
      `
      }
      if (this.config.appBarColor === 'primaryGradient1' && !this.themeColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.$color(this.config.themeColor).brighten(20).toHexString()}} 20%, ${this.$color(this.config.themeColor).darken(10).toHexString()}} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.$color(this.config.themeColor).darken(10).toHexString()}} !important;
      }
      `
      }
      if (this.config.appBarColor === 'secondaryGradient1' && this.secondaryColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.$color(this.secondaryColor).brighten(10).toHexString()} 20%, ${this.$color(this.secondaryColor).darken(20).toHexString()} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.$color(this.secondaryColor).darken(20).toHexString()} !important;
      }
      `
      }
      if (this.config.appBarColor === 'secondaryGradient1' && !this.secondaryColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.$color(this.secondaryColor).brighten(20).toHexString()} 20%, ${this.$color(this.secondaryColor).darken(10).toHexString()} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.$color(this.secondaryColor).darken(10).toHexString()} !important;
      }
      `
      }
      if (this.config.appBarColor === 'primarySecondaryGradient' && this.themeColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.config.themeColor} 20%, ${this.readableSecondaryColor} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.readableSecondaryColor} !important;
      }
      `
      }
      if (this.config.appBarColor === 'primarySecondaryGradient' && !this.themeColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.config.themeColor} 20%, ${this.backgroundableSecondaryColor}} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.backgroundableSecondaryColor}} !important;
      }
      `
      }
      if (this.config.appBarColor === 'secondaryPrimaryGradient' && this.secondaryColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.secondaryColor} 20%, ${this.readableThemeColor} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.readableThemeColor} !important;
      }
      `
      }
      if (this.config.appBarColor === 'secondaryPrimaryGradient' && !this.secondaryColorDark) {
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      background: linear-gradient(90deg, ${this.secondaryColor} 20%, ${this.backgroundableThemeColor} 100%);
      }
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
      border: 1px solid ${this.backgroundableThemeColor} !important;
      }
      `
      }
      return ''
    }
  }
}

</script>

<style lang="css" scoped>
</style>
