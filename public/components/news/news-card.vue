<template lang="html">
  <card-action-card
    :to="`/pages/${news.id}`"
    :title="news.title"
    :topics="news.topics"
    :html="news.config.description"
    :layout="layout"
    :img="news.config.mainImage && `${imagesDatasetUrl}/attachments/${news.config.mainImage.attachmentPath}`"
  >
    <template #bottom>
      <v-card-actions
        class="pa-1"
        style="min-height:40px;"
      >
        <v-spacer />
        <span
          class="text-caption px-1"
          style="line-height:1rem"
        >
          <template v-if="news.publishedAt">
            Publiée le {{ news.publishedAt | date('L') }}
          </template>
        </span>
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    news: { type: Object, default: null },
    layout: { type: String, default: 'dense' }
  },
  computed: {
    ...mapGetters(['imagesDatasetUrl'])
  }
}
</script>

<style lang="css" scoped>
</style>
