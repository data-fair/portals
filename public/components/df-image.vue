<template>
  <v-input
    name="avatar"
    :label="line.assetTitle"
    :disabled="disabled"
    class="vjsf-crop-img"
  >
    <v-row class="mt-0 mx-0">
      <v-avatar
        v-if="value && value.attachmentPath"
        class="mt-1 mr-1"
        tile
      >
        <v-img
          v-if="!loading"
          :src="`${imagesDatasetUrl}/attachments/${value.attachmentPath}`"
        />
      </v-avatar>
      <v-file-input
        v-if="!disabled"
        v-model="file"
        type="file"
        class="pt-2"
        accept="image/png, image/jpeg"
        placeholder="chargez une image"
        outlined
        dense
        prepend-icon=""
        @change="change"
      />
    </v-row>
  </v-input>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { nanoid } from 'nanoid'

export default {
  inject: ['form'],
  props: {
    value: { type: Object, required: false, default: null },
    line: { type: Object, required: true },
    disabled: { type: Boolean, default: false }
  },
  data () {
    return {
      dialog: false,
      loading: false,
      file: null
    }
  },
  computed: {
    ...mapState(['env', 'portal']),
    ...mapGetters(['imagesDatasetUrl'])
  },
  mounted () {
    console.log(this.form.getExprNode())
  },
  methods: {
    async change (event) {
      console.log('change !', this.file)
      if (!this.file) return
      this.loading = true
      const formData = new FormData()
      formData.append('attachment', this.file)
      const fullLine = { ...this.line }
      fullLine.assetId = fullLine.assetId || this.value.assetId || this.nanoid()
      if (!fullLine.assetTitle) {
        const parentValue = this.form.getExprNode().parent.value
        fullLine.assetTitle = parentValue.title || this.file.name
      }

      Object.keys(fullLine).forEach(key => {
        formData.append(key, fullLine[key])
      })

      const res = await this.$axios.$post(`${this.imagesDatasetUrl}/lines`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      this.$emit('input', {
        ...fullLine,
        _id: res._id,
        _updatedAt: res._updatedAt,
        attachmentPath: res.attachmentPath
      })
      this.$emit('change')
      this.loading = false
      this.file = null
    },
    nanoid () {
      return nanoid()
    }
  }
}
</script>

<style lang="css">
.vjsf-crop-img>.v-input__control>.v-input__slot {
  display: block;
}
</style>
