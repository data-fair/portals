# Page elements

The page editor renders the element schema (`api/types/page-elements/schema.ts`, one `oneOf`
branch per element type, discriminated on `type`) with vjsf. A new element starts as a text
block (`getDefaultData` sets `type: 'text'`).

## Changing the type of an element

When the type of an element changes, json-layout removes the keys the new type does not have and
keeps the keys both types share (useful for `content`, `children`, `mb`). A kept value that is
invalid for the new type makes the form invalid: the draft is not saved, only the "last change
not saved" alert says so, while the preview already shows the new element.

- A new element key with a default value must not reuse a key name that another type already
  has with other values (text alignment is `textAlign` because `align` of the grid, tabs and two
  columns elements takes other values).
- Do not set `oneOfLayout.emptyData` on `$defs/element` to work around it: it wipes the content
  and the children of the element and regenerates its `uuid`.
