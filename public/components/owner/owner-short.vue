<template>
  <span
    :title="label"
    class="body-2"
  >
    <v-avatar :size="28">
      <img
        aria-hidden="true"
        :src="`${directoryUrl}/api/avatars/${owner.type}/${owner.id}/avatar.png`"
      >
    </v-avatar>
  </span>
  <!--<span v-if="dataset.owner.type === 'user'"><v-icon>mdi-account</v-icon>&nbsp;{{ dataset.owner.name }}</span>
  <span v-if="dataset.owner.type === 'organization'"><v-icon>mdi-account-group</v-icon>&nbsp;{{ dataset.owner.name }}<span v-if="dataset.owner.role"> ({{ dataset.owner.role }})</span></span>-->
</template>

<script>
export default {
  props: ['owner'],
  computed: {
    directoryUrl () {
      return this.$store.getters.directoryUrl
    },
    label () {
      let label = this.owner.name
      if (this.owner.role) label += ` (${this.owner.role})`
      return label
    }
  }
}
</script>

<style lang="css" scoped>
</style>
