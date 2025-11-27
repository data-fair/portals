<template>
  <div>
    <v-app-bar flat>
      <v-toolbar-items>
        <v-btn
          variant="text"
          href="/portals-manager/pages"
        >
          Pages
        </v-btn>
        <v-btn
          variant="text"
          href="/portals-manager/portals"
        >
          Portals
        </v-btn>
        <v-btn
          variant="text"
          href="/simple-directory"
          color="primary"
        >
          Simple Directory
        </v-btn>
        <v-btn
          variant="text"
          href="/data-fair/portals"
          color="primary"
        >
          Data Fair
        </v-btn>
      </v-toolbar-items>
      <v-spacer />
      <personal-menu />
    </v-app-bar>

    <p>
      Session :
    </p>
    <pre>{{ session }}</pre>
  </div>
</template>

<script setup lang="ts">
import personalMenu from '@data-fair/lib-vuetify/personal-menu.vue'

const session = useSession()
</script>
