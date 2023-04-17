<template>
  <v-navigation-drawer
    v-model="navContext.drawer"
    class="navigation-left"
    color="primary"
    :dark="personalNavigationColorDark"
    app
    flat
  >
    <v-list
      nav
      class="pa-1"
    >
      <v-list-item
        :nuxt="true"
        :to="`/`"
      >
        <v-list-item-avatar>
          <img :src="`${directoryUrl}/api/avatars/${config.owner.type}/${config.owner.id}/avatar.png`">
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ config.title }}</v-list-item-title>
          <v-list-item-subtitle>Revenir au portail</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-subheader>Espace personnel</v-subheader>
      <v-list-item
        :nuxt="true"
        :to="`/me/account`"
      >
        <v-list-item-action><v-icon>mdi-account-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mon compte</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="config.usesManagement && config.usesManagement.type === 'users'"
        :nuxt="true"
        :to="`/me/uses`"
      >
        <v-list-item-action><v-icon>mdi-share-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mes réutilisations</v-list-item-title>
      </v-list-item>
      <v-list-item
        :nuxt="true"
        :to="`/me/notifications`"
      >
        <v-list-item-action><v-icon>mdi-bell-circle</v-icon></v-list-item-action>
        <v-list-item-title>Mes notifications</v-list-item-title>
      </v-list-item>

      <!-- TODO: account switching -->
      <v-select
        v-if="accounts.length > 1"
        label="Compte actif"
        :items="accounts"
        :value="accountValue"
        dense
        outlined
        hide-details
        class="my-3"
        @change="v => $store.dispatch('session/switchOrganization', v)"
      >
        <template #item="{item, on , attrs}">
          <v-list-item
            v-bind="attrs"
            v-on="on"
          >
            <v-list-item-action class=" my-0">
              <v-avatar :size="28">
                <img :src="item.avatar">
              </v-avatar>
            </v-list-item-action>
            <v-list-item-title>
              {{ item.text }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-select>

      <v-list-item
        v-if="activeAccount.type === 'organization' && accountRole === 'admin' && !activeAccount.department"
        :nuxt="true"
        :to="`/me/organization`"
      >
        <v-list-item-action><v-icon>mdi-account-group</v-icon></v-list-item-action>
        <v-list-item-title>Gestion de l'organisation</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="accountRole === 'admin' && !activeAccount.department"
        :nuxt="true"
        :to="`/me/api-keys`"
      >
        <v-list-item-action><v-icon>mdi-cloud-circle</v-icon></v-list-item-action>
        <v-list-item-title>Clés d'API</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="datasetsCount.rest || datasetsCount.file"
        :nuxt="true"
        :to="`/me/update-dataset`"
      >
        <v-list-item-action><v-icon>mdi-upload</v-icon></v-list-item-action>
        <v-list-item-title>Contribuer</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-footer
      absolute
      color="transparent"
      class="pa-0"
    >
      <v-list
        dense
        style="width:100%"
        class="pa-0"
      >
        <v-list-item
          :nuxt="true"
          :href="copyright.href"
          target="blank"
          dense
        >
          <!--<v-list-item-avatar class="ma-0">
            <v-avatar :size="28">
              <img :src="copyright.srcSmall[personalNavigationColorDark ? 'dark' : 'light']">
            </v-avatar>
          </v-list-item-avatar>-->
          <v-list-item-title
            style="white-space: normal;"
            class="text-caption"
          >
            {{ copyright.message }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-footer>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['navContext'],
  data () {
    return {
      datasetsCount: { file: null, rest: null }
    }
  },
  computed: {
    ...mapState(['config', 'portal', 'env']),
    ...mapState('session', ['user']),
    ...mapGetters(['logoUrl', 'directoryUrl', 'personalNavigationColorDark', 'dataFairUrl']),
    ...mapGetters('session', ['activeAccount', 'accountRole']),
    copyright () {
      return process.env.copyright
    },
    accountValue () {
      if (this.activeAccount.type === 'user') return null
      if (this.activeAccount.department) return `${this.activeAccount.id}:${this.activeAccount.department}`
      return this.activeAccount.id
    },
    accounts () {
      const accounts = []
      if (!this.user.ipa) {
        accounts.push({
          text: 'Compte personnel',
          value: null,
          avatar: `${this.directoryUrl}/api/avatars/user/${this.user.id}/avatar.png`
        })
      }
      for (const org of this.user.organizations) {
        const account = {
          text: org.name,
          value: org.id,
          avatar: `${this.directoryUrl}/api/avatars/organization/${org.id}/avatar.png`
        }
        if (org.department) {
          account.text += ' / ' + (org.departmentName || org.department)
          account.value += ':' + org.department
          account.avatar = `${this.directoryUrl}/api/avatars/organization/${org.id}/${org.department}/avatar.png`
        }
        accounts.push(account)
      }
      return accounts
      /*
<!-- account switching (personal account and organizations), copied from sd-vue -->
      <template v-if="user.organizations.length > 1 || (user.organizations.length === 1 && (!user.ipa || activeAccount.type === 'user'))">
        <v-subheader
          v-t="'switchAccount'"
          style="height: 24px"
        />
        <v-list-item
          v-if="activeAccount.type !== 'user' && !user.ipa"
          id="toolbar-menu-switch-user"
          @click="switchOrganization()"
        >
          <v-list-item-action class=" my-0">
            <v-avatar :size="28">
              <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
            </v-avatar>
          </v-list-item-action>
          <v-list-item-title v-t="'personalAccount'" />
        </v-list-item>
        <v-list-item
          v-for="organization in user.organizations.filter(o => activeAccount.type === 'user' || activeAccount.id !== o.id || (activeAccount.department || null) !== (o.department || null))"
          :id="'toolbar-menu-switch-orga-' + organization.id"
          :key="organization.id"
          @click="switchOrganization(organization.id + ':' + (organization.department || ''))"
        >
          <v-list-item-action class="my-0">
            <v-avatar :size="28">
              <img
                v-if="organization.department"
                :src="`${directoryUrl}/api/avatars/organization/${organization.id}/${organization.department}/avatar.png`"
              >
              <img
                v-else
                :src="`${directoryUrl}/api/avatars/organization/${organization.id}/avatar.png`"
              >
            </v-avatar>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ organization.name }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="organization.department">
              {{ organization.departmentName || organization.department }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
      */
    }
  },
  async mounted () {
    const owner = this.config.owner
    let ownerFilter = `${owner.type}:${owner.id}`
    if (owner.department) ownerFilter += `:${owner.department}`
    const baseParams = { size: 0, owner: ownerFilter, publicationSites: `data-fair-portals:${this.portal._id}` }
    this.datasetsCount.file = (await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', { params: { ...baseParams, file: true, can: 'writeData' } })).count
    this.datasetsCount.rest = (await this.$axios.$get(this.dataFairUrl + '/api/v1/datasets', { params: { ...baseParams, rest: true, can: 'createLine,updateLine' } })).count
  }
}
</script>

<style>
.navigation-left .v-list-item__action {
  margin-right: 16px !important;
}
</style>
