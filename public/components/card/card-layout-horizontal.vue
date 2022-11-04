<template>
  <v-row dense>
    <v-col
      cols="4"
      class="pr-0"
    >
      <v-img
        v-if="img"
        :src="img"
        :alt="title"
        height="100%"
        :contain="imgContain"
      />
    </v-col>
    <v-col
      cols="8"
      class="pl-0"
    >
      <card-title
        :title="title"
        :color-class="titleColorClass"
      />
      <card-text
        :html="html"
        :height="90"
      />
      <card-topics :topics="topics" />
      <slot name="bottom" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    img: { type: String, default: '' },
    imgContain: { type: Boolean, default: false },
    html: { type: String, default: '' },
    topics: { type: Array, default: null },
    titleColorClass: { type: String, default: '' }
  }
}
</script>

<style>

</style>
