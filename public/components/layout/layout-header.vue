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
        <v-spacer />
        <social-links
          v-if="config.headerSocial"
          :dark="headerColorDark"
          class="pt-2"
        />
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
        <v-spacer v-if="config.headerNoTitle" />
        <v-col
          v-else
          class="text-center"
        >
          <h1
            v-if="!config.useHtmlTitle"
            :class="`${$vuetify.breakpoint.xs ? 'headline' : 'display-1'} ${titleColor} font-weight-bold`"
          >
            {{ config.title }}
          </h1>
          <h1
            v-else
            :class="`${$vuetify.breakpoint.xs ? 'headline' : 'display-1'} font-weight-bold`"
            v-html="config.htmlTitle"
          />
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
    ...mapGetters(['primaryColorDark', 'headerColor', 'headerColorDark']),
    titleColor () {
      if (this.headerColorDark) return 'white--text'
      return {
        grey: 'grey--text text--darken-3',
        primary: 'primary--text',
        secondary: 'secondary--text'
      }[this.config.titleColor || 'grey']
    }
  }
}
</script>

<style>

</style>
