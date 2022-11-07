<template>
  <div>
    <template v-if="layout === 'dense' || layout === 'vertical'">
      <card-title
        :title="title"
        :color-class="titleColorClass"
      />
      <v-img
        v-if="img"
        :src="img"
        :alt="title"
        :max-height="155"
        :contain="imgContain"
        :class="{'mb-2': !img}"
        :aspect-ratio="imgAspectRatio"
      />
      <card-text
        v-if="!img || layout !== 'dense'"
        :html="html"
      />
      <card-topics :topics="topics" />
      <slot name="bottom" />
    </template>
    <v-row
      v-if="layout==='horizontal'"
      dense
      style="height:246px;"
    >
      <v-col
        cols="4"
        class="pr-0"
      >
        <v-img
          v-if="img"
          :src="img"
          :alt="title"
          height="238"
          :contain="imgContain"
          :aspect-ratio="imgAspectRatio"
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
  </div>
</template>

<script>
export default {
  props: {
    layout: { type: String, default: 'dense' },
    title: { type: String, default: '' },
    img: { type: String, default: '' },
    imgContain: { type: Boolean, default: false },
    imgAspectRatio: { type: Number, default: null },
    html: { type: String, default: '' },
    topics: { type: Array, default: null },
    titleColorClass: { type: String, default: '' }
  }
}
</script>

<style>

</style>
