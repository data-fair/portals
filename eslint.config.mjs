import neostandard from 'neostandard'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'

export default [
  { ignores: ['ui/*', '**/.type/', 'portal/*'] },
  ...dfLibRecommended,
  ...neostandard({ ts: true })
]
