<template lang="html">
  <action-card
    :to="(use.published && link && `/uses/${use.slug}`) || null"
    :title="use.title"
  >
    <div class="pb-2">
      <v-img
        :src="use.image && use.image.name && `${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image-thumbnail`"
        :alt="use.title"
        :aspect-ratio="21/9"
      />
    </div>
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
  </action-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    use: { type: Object, default: null },
    link: { type: Boolean, default: false }
  },
  computed: {
    ...mapState(['publicUrl', 'portal'])
  }
}
</script>

<style lang="css" scoped>
</style>
