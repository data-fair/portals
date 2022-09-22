<template>
  <div
    :style="`background-color: ${headerColor};width: 100%; height: 128px;`"
    :class="headerColorDark ? 'area--dark' : 'area--light'"
  >
    <v-container class="pb-0 pt-2">
      <v-row
        class="mb-0"
        style="height: 36px;"
      >
        <v-spacer /><social-links v-if="config.headerSocial" />
      </v-row>
      <v-row
        align="center"
        class="ma-1"
      >
        <layout-header-logo />
        <layout-header-logo-2
          v-if="$vuetify.breakpoint.xs"
          :config="config"
        />
        <v-col class="text-center">
          <h1 :class="`${$vuetify.breakpoint.xs ? 'headline' : 'display-1'} ${titleColor} font-weight-bold`">
            {{ config.title }}
          </h1>
        </v-col>
        <layout-header-logo-2
          v-if="!$vuetify.breakpoint.xs"
          :config="config"
        />
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapState(['config', 'textDark', 'portal', 'draft', 'publicUrl']),
    ...mapGetters(['themeColorDark', 'headerColor', 'headerColorDark']),
    titleColor () {
      if (this.headerColorDark) return 'white--text'
      return {
        grey: 'grey--text text--darken-2',
        primary: 'primary--text',
        secondary: 'secondary--text'
      }[this.config.titleColor || 'grey']
    }
  }
}
</script>

<style>

</style>
