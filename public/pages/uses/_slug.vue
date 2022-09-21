<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    TODO {{ use }}
  </div>
</template>

<script>
import Error from '~/components/error.vue'
const { mapState } = require('vuex')

export default {
  components: {
    Error
  },
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    use: null
  }),
  async fetch () {
    await this.fetchuse()
  },
  head () {
    if (this.use) {
      return { title: this.use.title }
    } else {
      return { title: 'Réutilisation non trouvée' }
    }
  },
  computed: {
    ...mapState(['portal', 'publicUrl'])
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchuse()
    }
  },
  methods: {
    async fetchuse () {
      this.use = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/uses`, { params: { html: true, slug: this.$route.params.slug } })
    }
  }
}
</script>
