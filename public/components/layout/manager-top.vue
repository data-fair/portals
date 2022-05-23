<template>
  <v-app-bar
    app
    flat
    dense
    class="px-0 main-app-bar"
  >
    <v-toolbar-items>
      <v-btn
        text
        nuxt
        :to="{name: 'manager-portals'}"
      >
        Mes portails
      </v-btn>
      <v-btn
        text
        nuxt
        :to="{name: 'manager-admin'}"
      >
        Administration
      </v-btn>
    </v-toolbar-items>
    <v-breadcrumbs
      v-if="breadcrumbs"
      :items="breadcrumbs"
    />
    <v-spacer />

    <personal-menu />
    <lang-switcher />
  </v-app-bar>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import PersonalMenu from '@data-fair/sd-vue/src/vuetify/personal-menu.vue'
import LangSwitcher from '@data-fair/sd-vue/src/vuetify/lang-switcher.vue'

export default {
  components: { PersonalMenu, LangSwitcher },
  computed: {
    ...mapState(['breadcrumbs']),
    ...mapState('session', ['user', 'initialized']),
    ...mapGetters('session', ['activeAccount']),
    directoryUrl () {
      return this.$store.getters.directoryUrl
    }
  },
  methods: {
    ...mapActions('session', ['logout', 'login', 'setAdminMode', 'switchOrganization']),
    reload () {
      window.location.reload()
    }
  }
}
</script>

<style lang="css">
.main-app-bar .v-toolbar__content {
  padding-left: 0;
  padding-right: 0;
}
</style>
