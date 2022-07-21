<template>
  <div>
    <v-row v-if="iframeExternalReuses.length">
      <v-col
        v-for="(reuse, er) in iframeExternalReuses"
        :key="er"
        class="text-center"
      >
        <section-subtitle :text="reuse.title" />
        <client-only>
          <iframe
            v-if="reuse.fixedHeight"
            :src="reuse.link"
            :height="reuse.height"
            width="100%"
            class="mt-2"
          />
          <v-iframe
            v-else
            :src="reuse.link"
            class="mt-2"
          />
        </client-only>
      </v-col>
    </v-row>
    <template v-if="linkExternalReuses.length">
      <section-title
        text="Réutilisations"
      />
      <v-row>
        <v-col
          v-for="(reuse, er) in linkExternalReuses"
          :key="er"
          md="4"
          sm="6"
          cols="12"
        >
          <v-card
            outlined
            height="100%"
          >
            <card-title :title="reuse.title" />
            <v-card-text
              style="height:130px;color: rgba(0,0,0,0.87)"
              class="py-0"
            >
              <client-only>
                <v-clamp
                  :max-height="170"
                  class="external-reuse-desc130:before"
                  autoresize
                  v-html="reuse.description"
                />
              </client-only>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :href="reuse.link"
                target="_blank"
                color="primary"
                text
              >
                Ouvrir
              </v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import VIframe from '@koumoul/v-iframe'

export default {
  components: { VIframe },
  props: {
    dataset: { required: true }
  },
  computed: {
    iframeExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'embed')) || []
    },
    linkExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'link')) || []
    }
  }
}
</script>

<style>

</style>
