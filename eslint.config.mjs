import neostandard from 'neostandard'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'

export default [
  { ignores: ['ui/*', '**/.type/', 'portal/*', 'api/assets/*', 'google-fonts-complete/*', 'simulations/tmp/*'] },
  ...dfLibRecommended,
  ...neostandard({ ts: true })
]
