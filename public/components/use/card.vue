<template lang="html">
  <card-action-card
    :to="(use.published && link && `/uses/${use.slug}`) || null"
    :title="use.title"
    :img="use.image && use.image.name && `${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image-thumbnail`"
    :img-aspect-ratio="21/9"
    :html="use.description"
    :layout="layout"
  >
    <template #bottom>
      <v-card-actions
        class="pa-1"
        style="min-height:40px;"
      >
        <slot name="actions" />
        <v-spacer />
        <span
          class="text-caption px-1"
          style="line-height:1rem"
        >
          <template v-if="use.publishedAt">
            Publiée le {{ use.publishedAt | date('L') }}
          </template>
          <template v-else>
            Mise à jour le {{ use.updated.date | date('L') }}
          </template>
        </span>
      </v-card-actions>
    </template>
  </card-action-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    use: { type: Object, default: null },
    link: { type: Boolean, default: false },
    layout: { type: String, default: 'dense' }
  },
  computed: {
    ...mapState(['publicUrl', 'portal'])
  }
}
</script>

<style lang="css" scoped>
</style>
