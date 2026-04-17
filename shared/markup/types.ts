export interface TagDescriptor {
  tagName: string
  contentProperty: string | null
  childrenSlots: ChildrenSlot[]
  attributes: AttributeDescriptor[]
  hiddenProperties: string[]
  /** Locale → title, e.g. { en: "Banner", fr: "Bannière" }. Omitted when no title is declared in the schema. */
  titles?: Record<string, string>
  /** Objects under this tag that declare an image-upload slot. Drives inline widget rendering in markup mode. */
  imageUploadGroups?: ImageUploadGroup[]
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

/** A character-offset range in the markup document. */
export interface MarkupRange {
  from: number
  to: number
}

/**
 * Maps JSON pointers (relative to the elements-array root) to markup ranges.
 * - `byPointer`: tightest range for a given pointer — the attribute *value*
 *   span for attribute errors, the tag open-span for element-level errors.
 * - `byElementPointer`: keyed only by element pointers, used as a fallback
 *   for errors whose pointer doesn't match anything finer (e.g. ajv
 *   "required" errors whose instancePath points to the parent object).
 */
export interface MarkupSourceMap {
  byPointer: Map<string, MarkupRange>
  byElementPointer: Map<string, MarkupRange>
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

/**
 * Metadata for an object property whose schema declares an `image-upload`
 * slot. Emitted by the schema analyzer alongside (not instead of) the
 * flattened leaf attributes, so plain-text editing and validation still work.
 *
 * The markup image-upload widget uses this to group the `_id`, `name`,
 * `mimeType`, `mobileAlt` attributes under `jsonPath` into a single inline
 * file-input control in the editor.
 */
export interface ImageUploadGroup {
  /** Path to the image-upload object, e.g. ["image"], ["wideImage"], ["background","image"], ["thumbnail","image"], ["thumbnail","default"]. */
  jsonPath: string[]
  /** width prop from the slot (forwarded to the upload request). */
  width?: number
  /** height prop from the slot. */
  height?: number
  /** label prop from the slot (raw schema value — not localized today). */
  label?: string
}
