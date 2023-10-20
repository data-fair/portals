<template lang="html">
  <card-action-card
    :to="`/pages/${event.id}`"
    :title="event.config.title"
    :topics="event.topics"
    :html="event.config.summary || event.config.description"
    :layout="layout"
    :img="event.config.image && `${imagesDatasetUrl}/attachments/${event.config.image.attachmentPath}`"
  >
    <template #bottom>
      <v-card-actions
        class="pa-1"
        style="min-height:40px;"
      >
        <v-col
          :style="layout === 'horizontal' ? `margin-top:-32px` : ''"
        >
          <div v-if="event.config.datetimes">
            <v-icon>mdi-calendar</v-icon>
            <template v-if="event.config.datetimes.start && event.config.datetimes.end && event.config.datetimes.start.slice(0, 10) === event.config.datetimes.end.slice(0, 10)">
              {{ event.config.datetimes.start | date('LL') }}, {{ event.config.datetimes.start | date('LT') }} - {{ event.config.datetimes.end | date('LT') }}
            </template>
            <template v-else>
              {{ event.config.datetimes.start | date('LLL') }} {{ event.config.datetimes.start && event.config.datetimes.end ? '-' : '' }} {{ event.config.datetimes.end | date('LLL') }}
            </template>
          </div>
          <div v-if="event.config.location">
            <v-icon>mdi-map-marker</v-icon>
            {{ event.config.location.title }}
          </div>
        </v-col>
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    event: { type: Object, default: null },
    layout: { type: String, default: 'dense' }
  },
  computed: {
    ...mapGetters(['imagesDatasetUrl'])
  }
}
</script>

<style lang="css" scoped>
</style>
