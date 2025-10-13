<template lang="html">
  <card-action-card
    :title="application.title"
    :to="{name: 'applications-ref' + (config.applicationsDirectNavigation ? '-full' : ''), params:{ref: applicationRef}}"
    :img="`${application.href}/capture?updatedAt=${application.updatedAt}`"
    :img-aspect-ratio="21/9"
    :topics="application.topics"
    :html="application.description"
    :layout="layout"
  >
    <template
      v-if="!config.applicationsDirectNavigation"
      #bottom
    >
      <v-card-actions class="pa-1">
        <application-view :application="application" />
        <application-fullscreen :application="application" />
        <v-spacer />
        <span
          v-if="config.applicationActionsDisplay !== 'button'"
          class="text-caption px-1"
          style="line-height:1rem"
        >
          Mis à jour le {{ application.updatedAt | date('L') }}
        </span>
        <owner-department v-if="!config.applicationHideDepartment" :owner="application.owner" />
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import ApplicationView from '~/components/application/view.vue'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    ApplicationView
  },
  props: {
    application: { type: Object, default: null },
    layout: { type: String, default: 'dense' }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['readableTopicColor', 'isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    }
  }
}
</script>

<style lang="css" scoped>
</style>
