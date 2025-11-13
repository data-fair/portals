import config from './config.ts'

export const uiConfig = {
  portalUrlPattern: config.portalUrlPattern,
  ingressControllers: config.ingressControllers
}
export type UiConfig = typeof uiConfig
export default uiConfig
