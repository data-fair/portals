<template>
  <v-input
    v-observe-visibility="{callback: visibilityChanged, once: true}"
    :value="value"
    :label="label"
    :disabled="disabled"
    hide-details
    class="markdown-editor"
  >
    <v-card
      v-if="!disabled"
      outlined
    >
      <textarea />
    </v-card>
    <v-card
      v-else-if="value"
      flat
      class="px-0"
    >
      <v-card-text
        class="px-0 pb-0 pt-2"
        v-html="marked(value)"
      />
    </v-card>
  </v-input>
</template>

<script>
import Vue from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import 'easymde/dist/easymde.min.css'
import marked from 'marked'
const sanitizeHtml = require('../../shared/sanitize-html.js')

Vue.directive('observe-visibility', ObserveVisibility)

export default {
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    minHeight: { type: String, default: '300px' }
  },
  data () {
    return { visible: false }
  },
  methods: {
    marked (markdown) {
      return marked.parse(markdown)
    },
    visibilityChanged (visible) {
      if (visible) this.renderEasyMDE()
    },
    async renderEasyMDE () {
      if (this.disabled) return
      const EasyMDE = (await import('easymde/src/js/easymde.js')).default

      // cf https://github.com/Ionaru/easy-markdown-editor#configuration
      const config = {
        element: this.$el.querySelector('textarea'),
        initialValue: this.value,
        renderingConfig: {
          sanitizerFunction: sanitizeHtml
        },
        status: false,
        autoDownloadFontAwesome: false,
        spellChecker: false,
        minHeight: this.minHeight,
        insertTexts: {
          link: ['[titre du lien', '](adresse du lien)'],
          image: ['![](', 'adresse de l\'image)'],
          table: ['', '\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n| -------- | -------- | -------- |\n| Texte     | Texte     | Texte     |\n\n'],
          horizontalRule: ['', '\n\n-----\n\n']
        },
        // cf https://github.com/Ionaru/easy-markdown-editor/blob/master/src/js/easymde.js#L1380
        toolbar: [{
          name: 'bold',
          action: EasyMDE.toggleBold,
          // className: 'fa fa-bold',
          className: 'mdi mdi-format-bold',
          title: 'Gras'
        }, {
          name: 'italic',
          action: EasyMDE.toggleItalic,
          className: 'mdi mdi-format-italic',
          title: 'Italique'
        }, /*, {
                    name: 'heading',
                    action: EasyMDE.toggleHeadingSmaller,
                    className: 'mdi mdi-title',
                    title: 'Heading',
                    default: true,
                  } */ {
        // starting at heading 2.. h1 is reserved to the wrapping page
          name: 'heading-2',
          action: EasyMDE.toggleHeading2,
          className: 'mdi mdi-format-title',
          title: 'Titre 1'
        }, {
          name: 'heading-3',
          action: EasyMDE.toggleHeading3,
          className: 'mdi mdi-format-title',
          title: 'Titre 2'
        },
        '|',
        {
          name: 'quote',
          action: EasyMDE.toggleBlockquote,
          className: 'mdi mdi-format-quote-open',
          title: 'Citation'
        },
        {
          name: 'unordered-list',
          action: EasyMDE.toggleUnorderedList,
          className: 'mdi mdi-format-list-bulleted',
          title: 'Liste à puce'
        },
        {
          name: 'ordered-list',
          action: EasyMDE.toggleOrderedList,
          className: 'mdi mdi-format-list-numbered',
          title: 'Liste numérotée'
        },
        '|',
        {
          name: 'link',
          action: EasyMDE.drawLink,
          className: 'mdi mdi-link',
          title: 'Créer un lien'
        },
        {
          name: 'image',
          action: EasyMDE.drawImage,
          className: 'mdi mdi-image',
          title: 'Insérer une image'
        },
        {
          name: 'table',
          action: EasyMDE.drawTable,
          className: 'mdi mdi-table',
          title: 'Insérer un tableau'
        },
        '|',
        {
          name: 'preview',
          action: EasyMDE.togglePreview,
          className: 'mdi mdi-eye accent--text',
          title: 'Aperçu du rendu',
          noDisable: true
        },
        /* '|',
                  {
                    name: 'undo',
                    action: EasyMDE.undo,
                    className: 'mdi mdi-undo',
                    title: 'Défaire',
                    noDisable: true,
                  },
                  {
                    name: 'redo',
                    action: EasyMDE.redo,
                    className: 'mdi mdi-redo',
                    title: 'Refaire',
                    noDisable: true,
                  }, */
        '|',
        {
          name: 'guide',
          action: 'https://simplemde.com/markdown-guide',
          className: 'mdi mdi-help-circle success--text',
          title: 'Documentation de la syntaxe',
          noDisable: true
        }
        ]
      }
      this.easymde = new EasyMDE(config)

      let changed = false
      this.easymde.codemirror.on('change', () => {
        changed = true
        this.$emit('input', this.easymde.value())
      })
      this.easymde.codemirror.on('blur', () => {
        // timeout to prevent triggering save when clicking on a menu button
        clearTimeout(this.blurTimeout)
        this.blurTimeout = setTimeout(() => {
          if (changed) this.$emit('change')
          changed = false
        }, 500)
      })
      this.easymde.codemirror.on('focus', () => {
        clearTimeout(this.blurTimeout)
        this.$emit('focus')
      })
    }
  }
}
</script>

<style lang="css">
.markdown-editor .v-input__slot {
  display: block;
}
.markdown-editor .EasyMDEContainer .editor-toolbar {
  border: none;
  padding: 2px;
}

.markdown-editor .EasyMDEContainer .CodeMirror {
  border: none;
}

.markdown-editor p:last-child {
  margin-bottom: 0;
}
</style>
