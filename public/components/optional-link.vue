<template>
  <nuxt-link
    v-if="to"
    :to="to"
    :aria-label="title"
  >
    <slot />
  </nuxt-link>
  <div v-else>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    to: { type: [String, Object], default: null },
    title: { type: String, required: true }
  }
}
</script>

<style>

</style>
