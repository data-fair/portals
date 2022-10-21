<template lang="html">
  <v-card
    :to="`/pages/${news.id}`"
    flat
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <card-title
      :title="news.title"
      :color-class="titleColorClass"
      :lines="dense ? 1 : 2"
    />
    <v-row
      class="pl-7"
      style="height:35px;"
    >
      <span class="text-caption">
        <template v-if="news.publishedAt">
          Publiée le {{ news.publishedAt | date('L') }}
        </template>
      </span>
    </v-row>
    <v-card-text
      style="height:130px; overflow:hidden"
      class="py-0"
    >
      <div
        class="card-gradient-white-desc130"
        v-html="news.config.description"
      />
    </v-card-text>
    <v-row
      v-if="news.topics && news.topics.length"
      style="min-height:40px;"
      class="py-1"
    >
      <v-col class="pt-0 pb-1">
        <v-chip
          v-for="topic of news.topics"
          :key="topic.id"
          small
          dark
          :color="topic.color ? $readableColor(topic.color) : 'default'"
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
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    news: { type: Object, default: null },
    dense: { type: Boolean, default: false }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapGetters(['actionCardOptions']),
    titleColorClass () {
      let c

      if (this.hovered && this.actionCardOptions.includes('hoverColorTitle')) {
        c += ' primary--text'
      } else {
        c += ' grey--text text--darken-3'
      }
      if (this.actionCardOptions.includes('hoverUnderlineTitle')) {
        c += ' underline-link'
        if (this.hovered) c += ' underline-link-hover'
      }

      return c
    }
  }
}
</script>

<style lang="css" scoped>
</style>
