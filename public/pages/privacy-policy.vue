<template>
  <v-container>
    <page-title text="Politique de confidentialité" />
    <iframe
      v-if="config.analytics && config.analytics.type === 'matomo' && config.analytics.params.trackerBase"
      :style="`height: ${$vuetify.breakpoint.xsOnly ? 250 : ($vuetify.breakpoint.mdAndUp ? 150 : 200)}px; width: 100%;`"
      :src="`${config.analytics.params.trackerBase}/index.php?module=CoreAdminHome&action=optOut&language=fr&backgroundColor=&fontColor=&fontSize=&fontFamily=nunito`"
      scrolling="no"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
    />
    <v-switch
      v-if="config.analytics && config.analytics.type !== 'matomo'"
      :value="!$cookies.get('df_portal_track_opt_out')"
      label="Autoriser la mesure d'audience"
      @input="toggle"
    />
  </v-container>
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
  },
  methods: {
    toggle () {
      if (!this.$cookies.get('df_portal_track_opt_out')) {
        this.$cookies.set('df_portal_track_opt_out', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true })
      } else {
        this.$cookies.delete('df_portal_track_opt_out')
      }
      this.$router.go()
    }
  }
}
</script>
