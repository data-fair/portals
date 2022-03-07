<template lang="html">
  <v-card
    outlined
    :elevation="hover ? 4 : 0"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <nuxt-link
      :to="{name: 'reuses-id', params:{id: application.id}}"
      style="text-decoration:none"
    >
      <v-card-title>
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <h3
              class="title grey--text text--darken-2 font-weight-bold"
              style="height:40px;line-height: 1.1;"
              v-bind="attrs"
              v-on="on"
            >
              <v-clamp
                :max-lines="2"
                autoresize
              >
                {{ application.title }}
              </v-clamp>
            </h3>
          </template>
          <span>{{ application.title }}</span>
        </v-tooltip>
      </v-card-title>
      <div class="pb-2">
        <v-img
          :src="`${application.href}/capture`"
          :alt="application.title"
          aspect-ratio="3"
        />
      </div>
      <v-row style="min-height:25px;">
        <v-col class="py-0">
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
    </nuxt-link>
    <v-card-actions class="py-0">
      <application-view :application="application" />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :to="{name: 'reuses-id-full', params:{id: application.id}}"
            icon
            v-on="on"
          >
            <v-icon color="primary">
              mdi-fullscreen
            </v-icon>
          </v-btn>
        </template>
        <span>Accéder à la visualisation en plein écran</span>
      </v-tooltip>
      <v-spacer />
      <v-subheader>Mis à jour le {{ application.updatedAt | date('L') }}</v-subheader>
    </v-card-actions>
  </v-card>
</template>

<script>
import VClamp from 'vue-clamp'
import ApplicationView from '~/components/application/view.vue'

export default {
  components: {
    VClamp,
    ApplicationView
  },
  props: {
    application: { type: Object, default: null }
  },
  data () {
    return {
      hover: false
    }
  }
}
</script>

<style lang="css" scoped>
</style>
