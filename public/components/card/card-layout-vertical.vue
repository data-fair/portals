<template>
  <div>
    <v-img
      v-if="img"
      :src="img"
      :alt="title"
      :max-height="155"
      :contain="imgContain"
      :class="{'mb-2': !img}"
    />
    <card-title
      :title="title"
      :color-class="titleColorClass"
    />
    <card-text
      :html="html"
    />
    <card-topics :topics="topics" />
    <slot name="bottom" />
  </div>
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
