<template lang="html">
  <div>
    <error v-if="$fetchState.error" :error="$fetchState.error" />
    <template v-else-if="page">
      <blank v-if="page.template === 'blank'" :config="page.config" />
      <thematic v-if="page.template === 'thematic'" :config="page.config" />
    </template>
  </div>
</template>

<script>
  import Error from '~/components/error.vue'
  import Blank from '~/components/pages/blank.vue'
  import Thematic from '~/components/pages/thematic.vue'
  const { mapState } = require('vuex')

  export default {
    middleware: 'portal-required',
    layout: 'default',
    components: {
      Blank,
      Thematic,
      Error,
    },
    async fetch () {
      this.page = await this.$axios.$get(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id)
    },
    data: () => ({
      page: null,
    }),
    computed: {
      ...mapState(['portal', 'publicUrl']),
      url() {
        return this.publicUrl + '/pages/' + this.$route.params.id
      },
    },
    watch: {
      async '$route.params.id' () {
        this.page = await this.$axios.$get(process.env.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id)
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
