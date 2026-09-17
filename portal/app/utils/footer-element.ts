import type { FooterElement } from '#api/types/footer-elements/index.ts'

export const footerElementClasses = (element: FooterElement) => [
  element.mb ? `mb-${element.mb}` : undefined,
  `text-${element.align}`
]

export const footerJustifyClass = (align: FooterElement['align']) =>
  ({ left: 'justify-start', center: 'justify-center', right: 'justify-end' })[align]
