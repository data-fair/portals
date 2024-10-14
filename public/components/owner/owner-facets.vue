<template>
  <v-select
    :value="values"
    :loading="loading"
    :items="owners"
    :item-text="itemText"
    :item-value="itemValue"
    multiple
    clearable
    outlined
    dense
    label="Filtrer par propriétaire"
    hide-details
    class="mb-2"
    :menu-props="{offsetY: true}"
    @input="e => $emit('input', fromValues(e))"
  >
    <template #item="{item, on , attrs}">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon v-if="values.includes(itemValue(item))">
            mdi-checkbox-marked
          </v-icon>
          <v-icon v-else>
            mdi-checkbox-blank-outline
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ itemText(item) }} ({{ item.count }})
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-avatar
          v-if="item.value.type"
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
        <v-avatar
          v-if="item.value.type"
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
        <template v-else>
          {{ itemText(item) }}
          {{ index < values.length - 1 ? ', ' : '' }}
        </template>
      </div>
    </template>
  </v-select>
</template>

<script>
const { mapState } = require('vuex')

export default {
  props: {
    loading: { type: Boolean, default: false },
    value: { type: Array, default: () => ([]) },
    items: { type: Array, required: true }
  },
  computed: {
    ...mapState(['config']),
    directoryUrl () {
      return this.$store.getters.directoryUrl
    },
    owners () {
      if (this.config.datasetsOwnerFilter && this.config.datasetsOwnerFilter.type === 'group' && this.config.datasetsOwnerFilter.groups.length) {
        return this.config.datasetsOwnerFilter.groups.map(g => ({
          value: { name: g.title, items: g.items },
          count: this.items.filter(item => {
            let key = `${item.value.type}:${item.value.id}`
            if (item.value.department) key += ':' + item.value.department
            else key += ':-'
            return g.items.includes(key)
          }).map(item => item.count).reduce((acc, v) => acc + v, 0)
        }))
      } else return this.items
    },
    values () {
      if (this.config.datasetsOwnerFilter && this.config.datasetsOwnerFilter.type === 'group' && this.config.datasetsOwnerFilter.groups.length) {
        return this.config.datasetsOwnerFilter.groups.filter(g => !g.items.find(item => !this.value.includes(item))).map(g => g.title)
      } else return this.value
    }
  },
  methods: {
    itemText (item) {
      return item.value.departmentName || item.value.department || item.value.name
    },
    itemValue (item) {
      if (item.value.items) return item.value.name
      else {
        let key = `${item.value.type}:${item.value.id}`
        if (item.value.department) key += ':' + item.value.department
        else key += ':-'
        return key
      }
    },
    fromValues (values) {
      if (this.config.datasetsOwnerFilter && this.config.datasetsOwnerFilter.type === 'group' && this.config.datasetsOwnerFilter.groups.length) {
        return [].concat(...this.config.datasetsOwnerFilter.groups.filter(g => values.includes(g.title)).map(g => g.items))
      } else return values
    }
  }
}
</script>

<style>

</style>
