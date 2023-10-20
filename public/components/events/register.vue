<template>
  <v-row
    align="center"
    class="ma-0"
  >
    Participerez-vous à cet évènement ?
    &nbsp;
    <template v-if="!user">
      Vous devez être connecté pour répondre
      <v-btn
        :href="loginHref"
        small
      >
        Se connecter / Créer un compte
      </v-btn>
    </template>
    <v-radio-group
      v-else-if="!loading"
      v-model="register"
      row
      @change="change"
    >
      <v-radio
        label="Oui"
        :value="true"
      />
      <v-radio
        label="Peut être"
        :value="null"
      />
      <v-radio
        label="Non"
        :value="false"
      />
    </v-radio-group>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    pageId: { type: String, required: true },
    pageTitle: { type: String, required: true }
  },
  data () {
    return {
      loading: true,
      register: null,
      lineId: null
    }
  },
  computed: {
    ...mapState('session', ['user']),
    ...mapGetters(['eventsDatasetUrl']),
    ...mapGetters('session', ['loginUrl']),
    loginHref () {
      return this.loginUrl(
        global.location && global.location.href,
        false
      )
    }
  },
  async mounted () {
    const params = {
      qs: 'pageId:' + this.pageId
    }
    const res = await this.$axios.$get(`${this.eventsDatasetUrl}/own/user:${this.user.id}/lines`, { params })
    if (res.results && res.results.length) {
      this.lineId = res.results[0]._id
      if (res.results[0].register !== null) this.register = res.results[0].register
    }
    this.loading = false
  },
  methods: {
    async change (event) {
      if (this.lineId) {
        if (event === null) await this.$axios.$delete(`${this.eventsDatasetUrl}/own/user:${this.user.id}/lines/${this.lineId}`)
        else await this.$axios.$patch(`${this.eventsDatasetUrl}/own/user:${this.user.id}/lines/${this.lineId}`, { register: event })
      } else {
        if (event !== null) await this.$axios.$post(`${this.eventsDatasetUrl}/own/user:${this.user.id}/lines`, { pageId: this.pageId, pageTitle: this.pageTitle, register: event })
      }
    }
  }
}
</script>

<style lang="css"></style>
