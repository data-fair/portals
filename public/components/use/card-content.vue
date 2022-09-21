<template>
  <div>
    <card-title :title="use.title" />
    <div class="pb-2">
      <v-img
        v-if="use.image"
        :src="`${publicUrl}/api/v1/portals/${portal._id}/uses/${use._id}/image-thumbnail`"
        :alt="use.title"
        :aspect-ratio="21/9"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    use: { type: Object, required: true }
  },
  computed: {
    ...mapState(['publicUrl', 'portal'])
  }
}
</script>

<style>

</style>
