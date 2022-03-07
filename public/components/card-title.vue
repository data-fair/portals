<template>
  <v-card-title>
    <v-tooltip top>
      <template #activator="{ on, attrs }">
        <h3
          class="title grey--text text--darken-2 font-weight-bold"
          style="height:40px;line-height: 1.1;"
          v-bind="attrs"
          v-on="on"
        >
          <v-clamp
            :max-lines="2"
            autoresize
          >
            {{ title }}
          </v-clamp>
        </h3>
      </template>
      <span>{{ title }}</span>
    </v-tooltip>
  </v-card-title>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true }
  }
}
</script>

<style>

</style>
