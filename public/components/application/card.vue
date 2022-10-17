<template lang="html">
  <action-card
    :title="application.title"
    :to="{name: 'applications-id', params:{id: application.id}}"
  >
    <div class="pb-2">
      <v-img
        :src="`${application.href}/capture?updatedAt=${application.updatedAt}`"
        :alt="application.title"
        :aspect-ratio="21/9"
      />
    </div>
    <v-row
      style="min-height:40px;"
      class="py-1"
    >
      <v-col class="pt-0 pb-1">
        <v-chip
          v-for="topic of application.topics"
          :key="topic.id"
          small
          dark
          :color="topic.color ? $readableColor(topic.color) : 'default'"
          class="ml-2 mt-1 font-weight-bold"
        >
          {{ topic.title }}
        </v-chip>
      </v-col>
    </v-row>
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
  </action-card>
</template>

<script>
import ApplicationView from '~/components/application/view.vue'

export default {
  components: {
    ApplicationView
  },
  props: {
    application: { type: Object, default: null }
  }
}
</script>

<style lang="css" scoped>
</style>
