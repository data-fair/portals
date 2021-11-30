<template>
  <v-menu
    v-model="menu"
    nudge-left
    offset-y
    max-height="400"
  >
    <template v-slot:activator="{on, attrs}">
      <v-btn
        text
        class="px-0"
        v-bind="attrs"
        v-on="on"
      >
        <v-badge
          :content="countNew"
          :value="!!countNew"
          color="pink"
          overlap
        >
          <v-icon :color="themeColorDark ? 'white' : textDark">
            mdi-bell
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-list :width="500" dense>
      <v-list-item v-if="notifications && !notifications.length">
        <v-list-item-content>
          <v-list-item-title>Vous n'avez pas encore reçu de notification</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-group
        v-if="notifications && notifications.length"
        active-class="pink--text"
        multiple
        :value="notifications.filter(n => n.new).map(n => n._id)"
      >
        <v-list-item
          v-for="notif in notifications"
          :key="notif._id"
          :value="notif._id"
          three-line
          :href="notif.url"
        >
          <v-list-item-content>
            <v-list-item-title>{{ notif.title.fr || notif.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ $dayjs(notif.date).format("lll") }}</v-list-item-subtitle>
            <v-list-item-subtitle v-if="notif.body" :title="notif.body.fr || notif.body">
              {{ notif.body.fr || notif.body }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <owner-short v-if="notif.sender" :owner="notif.sender" />
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import eventBus from '~/event-bus'
  import OwnerShort from '~/components/owners/short.vue'
  let sound
  if (!process.server) {
    sound = new Audio(require('@/assets/sounds/Information_Block.ogg'))
  }

  export default {
    components: { OwnerShort },
    props: ['notifyUrl'],
    data: () => ({
      menu: false,
      countNew: null,
      notifications: null,
      loading: false,
      size: 10,
    }),
    computed: {
      ...mapState(['textDark']),
      ...mapState('session', ['user']),
      ...mapGetters(['themeColorDark']),
    },
    watch: {
      menu(value) {
        if (value) {
          this.fetchNotifications()
        } else {
          this.countNotifications()
          this.notifications = null
          this.size = 10
        }
      },
    },
    mounted() {
      this.countNotifications()
      // always subscribe to notifications from notify
      if (this.user) {
        const channel = `user:${this.user.id}:notifications`
        eventBus.$emit('subscribe-notify', channel)
        eventBus.$on(channel, notification => {
          if (sound) sound.play()
          if (this.notifications) {
            notification.new = true
            this.notifications.unshift(notification)
            // TODO: replace this with a endpoint simply to reset pointer
            this.$axios.$get(`${this.notifyUrl}/api/v1/notifications`, { params: { size: 1 } })
          }

          if (this.countNew !== null) {
            this.countNew += 1
          }
        })
      }
    },
    methods: {
      async countNotifications() {
        const res = await this.$axios.$get(`${this.notifyUrl}/api/v1/notifications`, { params: { size: 0 } })
        this.countNew = res.countNew
      },
      async fetchNotifications() {
        this.loading = true
        const res = await this.$axios.$get(`${this.notifyUrl}/api/v1/notifications`, { params: { size: this.size } })
        this.countNew = res.countNew
        this.notifications = res.results
        this.loading = false
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
