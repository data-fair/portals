export interface TagDescriptor {
  tagName: string
  contentProperty: string | null
  childrenSlots: ChildrenSlot[]
  attributes: AttributeDescriptor[]
  hiddenProperties: string[]
  /** Locale → title, e.g. { en: "Banner", fr: "Bannière" }. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
}

export interface ChildrenSlot {
  /** JSON property name: "children", "children2", "tabs", "panels", "advancedFilters", "actions", "links" */
  property: string
  /** Virtual tag name in markup, or null for direct nesting */
  virtualTag: string | null
  /** For structured containers (tabs, panels) and link containers (actions, links): attributes on each virtual tag item */
  itemAttributes?: AttributeDescriptor[]
  /** Whether items in this slot are page elements (true) or structured objects with a children sub-property (false for tabs/panels) or link items */
  kind: 'direct' | 'structured' | 'link'
  /** Locale → title, taken from the array property's schema when available. Omitted otherwise. */
  titles?: Record<string, string>
}

export interface AttributeDescriptor {
  /** Attribute name in markup, possibly with dots (e.g. "background.color") */
  name: string
  /** Path in the JSON object (e.g. ["background", "color"]) */
  jsonPath: string[]
  /** The JSON Schema type of the leaf value. `string-array` is a closed-enum
   * array of strings, encoded in markup as a comma-separated list. */
  type: 'string' | 'number' | 'integer' | 'boolean' | 'string-array'
  /** For enum attributes: the allowed values */
  enumValues?: (string | number)[]
  /** Whether the property is required */
  required: boolean
  /** Default value from the schema */
  default?: unknown
  /** Locale → title for the attribute itself. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
  /** For enum attributes: per-value localized titles, keyed by value coerced to string. Omitted when no branch carries a title. */
  enumTitles?: Record<string, Record<string, string>>
}
