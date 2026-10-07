import * as footerElement from '#portal/app/utils/footer-element'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import
// also emits the vueTemplate (template-scope) declarations these helpers need
// when called inside the shared portal components' templates.
export const footerElementClasses = footerElement.footerElementClasses
export const footerJustifyClass = footerElement.footerJustifyClass
