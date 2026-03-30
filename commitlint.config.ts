export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', [
      'api',
      'ui',
      'portal',
      'portal-config',
      'page-element',
      'types',
      'deps',
      'analytics',
      'reuses',
      'seo',
    ]],
  },
}
