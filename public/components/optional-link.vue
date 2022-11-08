<template>
  <nuxt-link
    v-if="to"
    :to="to"
  >
    <slot />
  </nuxt-link>
  <div v-else>
    <slot />
  </div>
</template>

<script>
export default {
  props: { to: { type: [String, Object], default: null } }
}
</script>

<style>

</style>
