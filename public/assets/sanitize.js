import sanitizeHtml from 'sanitize-html'

// WARNING, synced with server/router/portals
const styledSanitizeOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style', 'class'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    img: ['title', 'alt', 'src', 'style', 'class', 'height', 'width', 'sizes'],
  },
  allowedStyles: {
    '*': {
      // Match HEX and RGB
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/],
      // Match any number with px, em, or %
      'font-size': [/^\d+(?:px|em|%)$/],
      // manage absolute and relative positioning
      position: [/^(absolute|relative)$/],
      width: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      height: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      top: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      right: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      bottom: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      left: [/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)(?:px|em|%)$/],
      float: [/^(left|right)$/],
      // manage simple flex layouts
      // https://css-tricks.com/snippets/css/a-guide-to-flexbox/
      display: [/^(flex|inline-flex|block|inline|inline-block)$/i],
      'flex-direction': [/^(row|row-reverse|column|column-reverse)$/i],
      'flex-wrap': [/^(nowrap|wrap|wrap-reverse)$/i],
      order: [/^\d+$/],
      'flex-shrink': [/^\d+$/],
      'flex-grow': [/^\d+$/],
      'flex-basis': [/^(auto)$/i],
      flex: [/^(none)$/, /^\d+(?: \d+)(?: auto)$/i],
      'justify-content': [/^(flex-start|flex-end|center|space-between|space-around|space-evenly|start|end|left|right)$/i],
      'align-self': [/^(auto|flex-start|flex-end|center|baseline|stretch)$/i],
      'align-items': [/^(stretch|flex-start|flex-end|center|baseline|first baseline|last baseline|start|end|self-start|self-end)$/i],
      'align-content': [/^(flex-start|flex-end|center|stretch|space-between|space-around)$/i],
      gap: [/^\d+(?:px)$/, /^\d+(?:px) \d+(?:px)$/],
      'row-gap': [/^\d+(?:px)$/, /^\d+(?:px) \d+(?:px)$/],
      'column-gap': [/^\d+(?:px)$/, /^\d+(?:px) \d+(?:px)$/],
    },
  },
}

export default (html) => sanitizeHtml(html, styledSanitizeOpts)
