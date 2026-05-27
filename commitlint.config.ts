export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
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
    'scope-empty': [1, 'never'],
  },
}
