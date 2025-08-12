import config from './config.ts'

export const uiConfig = {
  draftUrlPattern: config.draftUrlPattern
}
export type UiConfig = typeof uiConfig
export default uiConfig
