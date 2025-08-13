import config from './config.ts'

export const uiConfig = {
  draftUrlPattern: config.draftUrlPattern,
  ingressControllers: config.ingressControllers
}
export type UiConfig = typeof uiConfig
export default uiConfig
