<template lang="html">
  <v-card
    :hover="use.status === 'published'"
    class="also-outlined"
  >
    <nuxt-link
      v-if="use.status === 'published'"
      :to="{name: 'uses-id', params:{id: use.id}}"
      style="text-decoration:none"
    >
      <use-card-content :use="use" />
    </nuxt-link>
    <use-card-content
      v-else
      :use="use"
    />
    <v-card-actions class="py-0">
      <slot name="actions" />
      <v-spacer />
      <v-subheader v-if="use.publishedAt">
        Publiée le {{ use.updated.date | date('L') }}
      </v-subheader>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    use: { type: Object, default: null }
  }
}
</script>

<style lang="css" scoped>
</style>
