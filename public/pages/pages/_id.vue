<template lang="html">
  <div>
    <error v-if="$fetchState.error" :error="$fetchState.error" />
    <v-container v-else-if="page">
      <section-title :text="page.title" />
      <blank v-if="page.template === 'blank'" :config="page.config" />
    </v-container>
  </div>
</template>

<script>
  import Error from '~/components/error.vue'
  import Blank from '~/components/pages/blank.vue'
  const { mapState } = require('vuex')

  export default {
    middleware: 'portal-required',
    layout: 'default',
    components: {
      Blank,
      Error,
    },
    async fetch () {
      this.page = await this.$axios.$get(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id)
    },
    data: () => ({
      page: null,
    }),
    computed: {
      ...mapState(['portal']),
      url() {
        return process.env.publicUrl + '/pages/' + this.$route.params.id
      },
    },
    head () {
      if (this.page) {
        return { title: this.page.title }
      } else {
        return { title: 'Page non trouvée' }
      }
    },
  }
</script>
