<template lang="html">
  <div>
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <template v-else-if="page">
      <blank
        v-if="page.template === 'blank'"
        :config="page.config"
      />
      <thematic
        v-if="page.template === 'thematic'"
        :config="page.config"
      />
      <news
        v-if="page.template === 'news'"
        :config="page.config"
      />
    </template>
  </div>
</template>

<script>
import Error from '~/components/error.vue'
import Blank from '~/components/pages/blank.vue'
import Thematic from '~/components/pages/thematic.vue'
import News from '~/components/pages/news.vue'
const { mapState } = require('vuex')

export default {
  components: {
    Blank,
    Thematic,
    News,
    Error
  },
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    page: null
  }),
  async fetch () {
    await this.fetchPage()
  },
  head () {
    if (this.page) {
      return { title: this.page.title }
    } else {
      return { title: 'Page non trouvée' }
    }
  },
  computed: {
    ...mapState(['portal', 'publicUrl']),
    url () {
      return this.publicUrl + '/pages/' + this.$route.params.id
    }
  },
  watch: {
    async '$route.params.id' () {
      await this.fetchPage()
    }
  },
  methods: {
    async fetchPage () {
      this.page = await this.$axios.$get(this.$store.state.publicUrl + `/api/v1/portals/${this.portal._id}/pages/` + this.$route.params.id, { params: { html: true } })
    }
  }
}
</script>
