<template>
  <v-row v-once>
    <v-col>
      <page-title text="Politique de confidentialité" />

      <iframe
        v-if="config.analytics && config.analytics.active && config.analytics.type === 'matomo' && config.analytics.params.trackerBase"
        :style="`height: ${$vuetify.breakpoint.xsOnly ? 250 : ($vuetify.breakpoint.mdAndUp ? 150 : 200)}px; width: 100%;`"
        :src="`${config.analytics.params.trackerBase}/index.php?module=CoreAdminHome&action=optOut&language=fr&backgroundColor=&fontColor=&fontSize=&fontFamily=nunito`"
        scrolling="no"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
export default {
  head () {
    return {
      title: 'Politique de confidentialité - ' + this.config.title,
      meta: [{ hid: 'description', name: 'description', content: 'Quelles informations sont collectées, à quoi elles servent et ce que nous faisons pour les protéger.' }]
    }
  },
  computed: {
    ...mapState(['config'])
  }
}
</script>
