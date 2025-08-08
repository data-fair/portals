<template>
  <div>
    <v-app-bar density="comfortable">
      <v-spacer />
      <personal-menu dark-mode-switch />
    </v-app-bar>

    <ul>
      <li
        v-for="(link,i) in links"
        :key="i"
      >
        <a :href="link[0]">{{ link[1] }}</a>
      </li>
    </ul>
    <p>
      Session :
    </p>
    <pre>{{ session.state }}</pre>
  </div>
</template>

<script setup lang="ts">
import personalMenu from '@data-fair/lib-vuetify/personal-menu.vue'

const session = useSession()

const links = [
  ['/simple-directory', 'User management'],
  ['/portals-manager/portals', 'Portals'],
  ['/portals-manager/pages', 'Pages']
]
</script>

  <style>

  </style>
