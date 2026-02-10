<template>
  <div>
    <v-row class="ma-0">
      <nuxt-link
        :to="{path: `/applications/${applicationRef}`, query: syncedStateParams}"
        class="title"
      >
        <span class="underline-link">{{ application.title }}</span>&nbsp;<v-icon :color="'primary'">
          mdi-open-in-new
        </v-icon>
      </nuxt-link>
      <v-spacer />
      <application-fullscreen
        :application="application"
        :synced-state="syncedState"
      />
      <application-capture
        v-if="baseApplication && fullApplication"
        :application="fullApplication"
        :base-application="baseApplication"
        :synced-state="syncedState"
      />
    </v-row>
    <client-only>
      <d-frame-wrapper
        :src="`${dataFairUrl}/app/${applicationRef}?d-frame=true&primary=${readablePrimaryColor}`"
        :iframe-title="application.title"
        :style="iframeStyle"
        scrolling="no"
        resize="no"
        aspect-ratio
        state-change-events
        @state-change="s => syncedState = s.detail[1]"
      />
    </client-only>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
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
    baseApplication: null,
    fullApplication: null,
    syncedState: null
  }),
  computed: {
    ...mapGetters(['readablePrimaryColor', 'dataFairUrl', 'owner', 'isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    },
    syncedStateParams () {
      if (!this.syncedState) return {}
      const url = new URL(this.syncedState)
      const params = {}
      for (const key of [...url.searchParams.keys()]) {
        if (key !== 'primary') params[key] = url.searchParams.get(key)
      }
      return params
    }
  },
  async mounted () {
    this.baseApplication = await this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.applicationRef}/base-application`, { params: { html: true } })
    this.fullApplication = await this.$axios.$get(this.dataFairUrl + `/api/v1/applications/${this.applicationRef}`, { params: { raw: true, select: '-userPermissions,-owner' } })
  }
}
</script>

<style>

</style>
