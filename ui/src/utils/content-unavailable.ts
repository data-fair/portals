import * as contentUnavailable from '../../../portal/app/utils/content-unavailable'

// Local const re-declaration (not `export ... from`) so unplugin-auto-import also emits the
// template-scope declaration, cf utils/hover.ts
export const isContentUnavailable = contentUnavailable.isContentUnavailable
