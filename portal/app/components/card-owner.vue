<template>
  <div class="d-flex align-center ga-2">
    <!-- position-relative + z-index => sit above the card link overlay, otherwise the tooltip never opens -->
    <span
      v-if="display !== 'avatarName'"
      class="d-flex position-relative"
      style="z-index: 2"
    >
      <owner-avatar
        :owner="owner"
        omit-owner-name
      />
    </span>
    <template v-else>
      <owner-avatar
        :owner="owner"
        :show-tooltip="false"
        aria-hidden="true"
      />
      <span class="text-body-medium">{{ departmentLabel(owner.department, owner.departmentName) ?? owner.name }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-vue/session'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

defineProps<{
  owner: Account
  display?: 'none' | 'avatar' | 'avatarName'
}>()

const { departmentLabel } = useDisplayOwner()
</script>
