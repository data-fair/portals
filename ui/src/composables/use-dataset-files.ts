// Re-export of the portal composable: unimport registers the name from this file
// and the portal source resolves its own auto-imports (useLocalFetch) against the
// manager registry.
export { useDatasetFiles } from '#portal/app/composables/use-dataset-files'
