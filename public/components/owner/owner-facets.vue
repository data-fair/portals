<template>
  <v-select
    :value="value"
    :loading="loading"
    :items="items"
    :item-text="itemText"
    :item-value="itemValue"
    multiple
    clearable
    outlined
    dense
    label="Filter par propriétaire"
    hide-details
    class="mb-2"
    @input="e => $emit('input', e)"
  >
    <template #item="{item, on , attrs}">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon v-if="value.includes(itemValue(item))">
            mdi-checkbox-marked
          </v-icon>
          <v-icon v-else>
            mdi-checkbox-blank-outline
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ itemText(item) }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-avatar
          :height="28"
          :min-width="28"
          :width="28"
          class="my-1"
        >
          <img
            v-if="item.value.department"
            :src="`${directoryUrl}/api/avatars/${item.value.type}/${item.value.id}/${item.value.department}/avatar.png`"
          >
          <img
            v-else
            :src="`${directoryUrl}/api/avatars/${item.value.type}/${item.value.id}/avatar.png`"
          >
        </v-list-item-avatar>
      </v-list-item>
    </template>
    <template #selection="{item, index}">
      <div class="v-select__selection v-select__selection--comma">
        <!--{{ itemText(item) }}--><v-avatar
          :size="24"
        >
          <img
            v-if="item.value.department"
            :src="`${directoryUrl}/api/avatars/${item.value.type}/${item.value.id}/${item.value.department}/avatar.png`"
          >
          <img
            v-else
            :src="`${directoryUrl}/api/avatars/${item.value.type}/${item.value.id}/avatar.png`"
          >
        </v-avatar>
        <!--{{ index < value.length - 1 ? ', ' : '' }}-->
      </div>
    </template>
  </v-select>
</template>

<script>

export default {
  props: {
    loading: { type: Boolean, default: false },
    value: { type: Array, default: () => ([]) },
    items: { type: Array, required: true }
  },
  computed: {
    directoryUrl () {
      return this.$store.getters.directoryUrl
    }
  },
  methods: {
    itemText (item) {
      return item.value.departmentName || item.value.department || item.value.name
    },
    itemValue (item) {
      let key = `${item.value.type}:${item.value.id}`
      if (item.value.department) key += ':' + item.value.department
      else key += ':-'
      return key
    }
  }
}
</script>

<style>

</style>
