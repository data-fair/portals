<template lang="html">
  <v-jsf-original
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

    <template
      slot="custom-df-image"
      slot-scope="context"
    >
      <df-image
        :line="{assetId: context.schema.properties.assetId.const, assetTitle: context.schema.properties.assetTitle.const, pageId: vjsfOptions.context.page.id, pageTitle: vjsfOptions.context.page.title}"
        :value="context.value"
        :disabled="context.disabled"
        :label="context.label"
        v-on="context.on"
      />
    </template>
  </v-jsf-original>
</template>

<script>
import VJsfOriginal from '@koumoul/vjsf/lib/VJsf.js'
import '@koumoul/vjsf/lib/deps/third-party.js'
import '@koumoul/vjsf/dist/main.css'
import MarkdownEditor from '~/components/markdown-editor.vue'

export default {
  components: {
    VJsfOriginal,
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
        colorPickerProps: { showSwatches: true },
        ...this.options
      }
    }
  }

}
</script>

<style>
.vjsf-property .v-alert__content {
  max-width: 100%;
}
</style>
