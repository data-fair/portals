<template lang="html">
  <v-jsf
    :value="value"
    :schema="schema"
    :options="vjsfOptions"
    @input="val => $emit('input', val)"
    @change="$emit('change')"
  >
    <template
      slot="custom-markdown"
      slot-scope="{value: val, on, disabled, label}"
    >
      <markdown-editor
        :value="val"
        :disabled="disabled"
        :label="label"
        min-height="200px"
        @input="v => on.input(v)"
        @change="on.change()"
      />
    </template>
  </v-jsf>
</template>

<script>
import VJsf from '@koumoul/vjsf/lib/VJsf.js'
import '@koumoul/vjsf/lib/deps/third-party.js'
import '@koumoul/vjsf/dist/main.css'
import MarkdownEditor from '~/components/markdown-editor.vue'

export default {
  components: {
    VJsf,
    MarkdownEditor
  },
  props: {
    value: { type: Object, default: null },
    options: { type: Object, default: null },
    schema: { type: Object, required: true }
  },
  computed: {
    vjsfOptions () {
      return {
        editMode: 'inline',
        arrayItemCardProps: { outlined: true },
        ...this.options
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
