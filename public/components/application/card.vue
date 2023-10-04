<template lang="html">
  <card-action-card
    :title="application.title"
    :to="{name: 'applications-slug', params:{slug: application.slug}}"
    :img="`${application.href}/capture?updatedAt=${application.updatedAt}`"
    :img-aspect-ratio="21/9"
    :topics="application.topics"
    :html="application.description"
    :layout="layout"
  >
    <template #bottom>
      <v-card-actions class="pa-1">
        <application-view :application="application" />
        <application-fullscreen :application="application" />
        <v-spacer />
        <span
          class="text-caption px-1"
          style="line-height:1rem"
        >
          Mis à jour le {{ application.updatedAt | date('L') }}
        </span>
        <owner-department :owner="application.owner" />
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import ApplicationView from '~/components/application/view.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    ApplicationView
  },
  props: {
    application: { type: Object, default: null },
    layout: { type: String, default: 'dense' }
  },
  computed: {
    ...mapGetters(['readableTopicColor'])
  }
}
</script>

<style lang="css" scoped>
</style>
