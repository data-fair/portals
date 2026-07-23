// Re-export of the portal composable: unimport registers the name from this file
// and the portal source resolves its own auto-imports (usePortalStore, hover
// helpers) against the manager registry.
export { useButtonHover } from '#portal/app/composables/use-button-hover'
