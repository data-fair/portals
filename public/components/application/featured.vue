<template>
  <div>
    <v-row class="ma-0">
      <nuxt-link
        :to="`/reuses/${application.id}`"
        class="title"
        style="text-decoration-line:none"
      >
        {{ application.title }}&nbsp;<v-icon :color="'primary'">
          mdi-open-in-new
        </v-icon>
      </nuxt-link>
      <v-spacer />
      <application-fullscreen :application="application" />
      <application-capture
        v-if="baseApplication"
        :application="application"
        :base-application="baseApplication"
        :synced-state="syncedState"
      />
    </v-row>
    <client-only>
      <v-iframe
        :src="`${dataFairUrl}/app/${application.id}`"
        :style="iframeStyle"
        :sync-state="true"
        :query-params-extra="{primary: readableThemeColor, embed: true}"
        :query-params-exclude="['portalId']"
        @state="s => syncedState = s"
      />
    </client-only>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VIframe from '@koumoul/v-iframe'

export default {
  components: {
    VIframe
  },
  props: {
    application: {
      type: Object,
      required: true
    },
    iframeStyle: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    baseApplication: null
  }),
  computed: {
    ...mapGetters(['readableThemeColor', 'dataFairUrl', 'owner'])
  },
  async mounted () {
    this.baseApplication = await this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.application.id}/base-application`, { params: { html: true } })
  }
}
</script>

<style>

</style>
