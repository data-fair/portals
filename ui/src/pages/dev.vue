<template>
  <div>
    <v-app-bar density="comfortable">
      <v-spacer />
      <personal-menu dark-mode-switch />
    </v-app-bar>

    <p>
      <ul>
        <li
          v-for="(link,i) in links"
          :key="i"
        >
          <a :href="link[0]">{{ link[1] }}</a>
        </li>
      </ul>
    </p>
    <p>
      Session : <pre>{{ session.state }}</pre>
    </p>
  </div>
</template>

<script setup lang="ts">
import personalMenu from '@data-fair/lib-vuetify/personal-menu.vue'

const session = useSession()

const links = [
  ['/simple-directory', 'User management'],
  ['/events/embed/events', 'Account events'],
  ['/events/embed/subscribe?key=topic1,topic2&title=Topic 1,Topic 2&sender=organization:orga1', 'Subscribe to a topic'],
  ['/events/embed/subscriptions', 'User subscriptions'],
  ['/events/embed/subscribe-webhooks?key=topic&title=Topic', 'Subscribe webhooks to a topic'],
  ['/events/embed/notifications', 'User notifications'],
  ['/events/embed/devices', 'User devices'],
  ['/built/events/embed/devices', 'Built version']
]
</script>

  <style>

  </style>
