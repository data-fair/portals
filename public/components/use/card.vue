<template lang="html">
  <action-card
    :to="use.published && link && `/uses/${use.slug}`"
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
      <v-card-actions class="py-0">
        <slot name="actions" />
        <v-spacer />
        <v-subheader v-if="use.publishedAt">
          Publiée le {{ use.publishedAt | date('L') }}
        </v-subheader>
        <v-subheader v-else>
          Mise à jour le {{ use.updated.date | date('L') }}
        </v-subheader>
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
