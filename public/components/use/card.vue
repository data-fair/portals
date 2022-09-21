<template lang="html">
  <v-card
    :hover="use.published && link"
    class="also-outlined"
  >
    <nuxt-link
      v-if="use.published && link"
      :to="`/uses/${use.slug}`"
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
        Publiée le {{ use.publishedAt | date('L') }}
      </v-subheader>
      <v-subheader v-else>
        Mise à jour le {{ use.updated.date | date('L') }}
      </v-subheader>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    use: { type: Object, default: null },
    link: { type: Boolean, default: false }
  }
}
</script>

<style lang="css" scoped>
</style>
