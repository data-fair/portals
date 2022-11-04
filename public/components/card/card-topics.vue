<template>
  <v-row
    style="min-height:28px;"
    class="mx-0 mb-0 mt-1"
  >
    <v-chip
      v-for="topic of topics"
      :key="topic.id"
      small
      dark
      :label="!config.topicsOptions.includes('rounded')"
      :color="readableTopicColor(topic)"
      class="ml-2 mt-1 font-weight-bold"
    >
      <v-icon
        v-if="topic.icon && topic.icon.name"
        left
        small
      >
        mdi-{{ topic.icon.name }}
      </v-icon>
      {{ topic.title }}
    </v-chip>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    topics: { type: Array, default: null }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['readableTopicColor'])
  }
}
</script>

<style>

</style>
