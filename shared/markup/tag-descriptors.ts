// GENERATED FILE — DO NOT EDIT
// Run "node --import tsx build/markup/generate-descriptors.ts" to regenerate.

import type { TagDescriptor } from './types.ts'

export const tagDescriptors: Record<string, TagDescriptor> = {
  "title": {
    "tagName": "title",
    "contentProperty": "content",
    "childrenSlots": [],
    "attributes": [
      {
        "name": "bold",
        "jsonPath": [
          "bold"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "icon.color",
        "jsonPath": [
          "icon",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.name",
        "jsonPath": [
          "icon",
          "mdi",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svg",
        "jsonPath": [
          "icon",
          "mdi",
          "svg"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svgPath",
        "jsonPath": [
          "icon",
          "mdi",
          "svgPath"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "line.color",
        "jsonPath": [
          "line",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "line.position",
        "jsonPath": [
          "line",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "left",
          "bottom-small",
          "bottom-medium",
          "bottom-large"
        ],
        "default": "none"
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group._id",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.title",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.title",
        "jsonPath": [
          "link",
          "pageRef",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.subtype",
        "jsonPath": [
          "link",
          "subtype"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "home",
          "contact",
          "accessibility",
          "terms-of-service",
          "legal-notice",
          "privacy-policy",
          "cookie-policy",
          "datasets",
          "applications",
          "reuses",
          "event-catalog",
          "news-catalog",
          "sitemap",
          "catalog-api-doc"
        ],
        "default": "home"
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.type",
        "jsonPath": [
          "link",
          "type"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "titleSize",
        "jsonPath": [
          "titleSize"
        ],
        "type": "string",
        "required": true,
        "enumValues": [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6"
        ],
        "default": "h3"
      },
      {
        "name": "titleTag",
        "jsonPath": [
          "titleTag"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "div"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "text": {
    "tagName": "text",
    "contentProperty": "content",
    "childrenSlots": [],
    "attributes": [
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": [
      "_html"
    ]
  },
  "alert": {
    "tagName": "alert",
    "contentProperty": "content",
    "childrenSlots": [],
    "attributes": [
      {
        "name": "icon.color",
        "jsonPath": [
          "icon",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.name",
        "jsonPath": [
          "icon",
          "mdi",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svg",
        "jsonPath": [
          "icon",
          "mdi",
          "svg"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svgPath",
        "jsonPath": [
          "icon",
          "mdi",
          "svgPath"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "alertType",
        "jsonPath": [
          "alertType"
        ],
        "type": "string",
        "required": true,
        "enumValues": [
          "none",
          "info",
          "success",
          "error",
          "warning"
        ],
        "default": "info"
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": [
      "_html"
    ]
  },
  "image": {
    "tagName": "image",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "banner",
        "jsonPath": [
          "banner"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cover",
        "jsonPath": [
          "cover"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "height",
        "jsonPath": [
          "height"
        ],
        "type": "integer",
        "required": false
      },
      {
        "name": "image._id",
        "jsonPath": [
          "image",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "image.mimeType",
        "jsonPath": [
          "image",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "image.mobileAlt",
        "jsonPath": [
          "image",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "image.name",
        "jsonPath": [
          "image",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "isPresentation",
        "jsonPath": [
          "isPresentation"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "legend",
        "jsonPath": [
          "legend"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group._id",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.title",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.title",
        "jsonPath": [
          "link",
          "pageRef",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.subtype",
        "jsonPath": [
          "link",
          "subtype"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "home",
          "contact",
          "accessibility",
          "terms-of-service",
          "legal-notice",
          "privacy-policy",
          "cookie-policy",
          "datasets",
          "applications",
          "reuses",
          "event-catalog",
          "news-catalog",
          "sitemap",
          "catalog-api-doc"
        ],
        "default": "home"
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.type",
        "jsonPath": [
          "link",
          "type"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "url",
        "jsonPath": [
          "url"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "wideImage._id",
        "jsonPath": [
          "wideImage",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "wideImage.mimeType",
        "jsonPath": [
          "wideImage",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "wideImage.mobileAlt",
        "jsonPath": [
          "wideImage",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "wideImage.name",
        "jsonPath": [
          "wideImage",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "zoomable",
        "jsonPath": [
          "zoomable"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "iframe": {
    "tagName": "iframe",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "scroll",
        "jsonPath": [
          "scroll"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "url",
        "jsonPath": [
          "url"
        ],
        "type": "string",
        "required": true
      }
    ],
    "hiddenProperties": []
  },
  "icon": {
    "tagName": "icon",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "icon.color",
        "jsonPath": [
          "icon",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.name",
        "jsonPath": [
          "icon",
          "mdi",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svg",
        "jsonPath": [
          "icon",
          "mdi",
          "svg"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "icon.mdi.svgPath",
        "jsonPath": [
          "icon",
          "mdi",
          "svgPath"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "size",
        "jsonPath": [
          "size"
        ],
        "type": "integer",
        "required": false,
        "default": 48
      }
    ],
    "hiddenProperties": []
  },
  "button": {
    "tagName": "button",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.icon.color",
        "jsonPath": [
          "link",
          "icon",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "link.icon.custom",
        "jsonPath": [
          "link",
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.icon.mdi.name",
        "jsonPath": [
          "link",
          "icon",
          "mdi",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.icon.mdi.svg",
        "jsonPath": [
          "link",
          "icon",
          "mdi",
          "svg"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.icon.mdi.svgPath",
        "jsonPath": [
          "link",
          "icon",
          "mdi",
          "svgPath"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group._id",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.title",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.title",
        "jsonPath": [
          "link",
          "pageRef",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.subtype",
        "jsonPath": [
          "link",
          "subtype"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "home",
          "contact",
          "accessibility",
          "terms-of-service",
          "legal-notice",
          "privacy-policy",
          "cookie-policy",
          "datasets",
          "applications",
          "reuses",
          "event-catalog",
          "news-catalog",
          "sitemap",
          "catalog-api-doc"
        ],
        "default": "home"
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.type",
        "jsonPath": [
          "link",
          "type"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.color",
        "jsonPath": [
          "config",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "config.density",
        "jsonPath": [
          "config",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "config.elevation",
        "jsonPath": [
          "config",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "config.rounded",
        "jsonPath": [
          "config",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "config.showIcon",
        "jsonPath": [
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.uppercase",
        "jsonPath": [
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.variant",
        "jsonPath": [
          "config",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "menu": {
    "tagName": "menu",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "links",
        "virtualTag": "link",
        "kind": "link",
        "itemAttributes": [
          {
            "name": "type",
            "jsonPath": [
              "type"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "subtype",
            "jsonPath": [
              "subtype"
            ],
            "type": "string",
            "required": true,
            "enumValues": [
              "home",
              "contact",
              "accessibility",
              "terms-of-service",
              "legal-notice",
              "privacy-policy",
              "cookie-policy",
              "datasets",
              "applications",
              "reuses",
              "event-catalog",
              "news-catalog",
              "sitemap",
              "catalog-api-doc"
            ],
            "default": "home"
          },
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "target",
            "jsonPath": [
              "target"
            ],
            "type": "boolean",
            "required": false
          },
          {
            "name": "icon.mdi.name",
            "jsonPath": [
              "icon",
              "mdi",
              "name"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svg",
            "jsonPath": [
              "icon",
              "mdi",
              "svg"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svgPath",
            "jsonPath": [
              "icon",
              "mdi",
              "svgPath"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.custom",
            "jsonPath": [
              "icon",
              "custom"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.color",
            "jsonPath": [
              "icon",
              "color"
            ],
            "type": "string",
            "required": false,
            "enumValues": [
              "primary",
              "secondary",
              "accent",
              "info",
              "success",
              "error",
              "warning"
            ]
          },
          {
            "name": "pageRef.slug",
            "jsonPath": [
              "pageRef",
              "slug"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "pageRef.title",
            "jsonPath": [
              "pageRef",
              "title"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "pageRef.group._id",
            "jsonPath": [
              "pageRef",
              "group",
              "_id"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "pageRef.group.title",
            "jsonPath": [
              "pageRef",
              "group",
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "pageRef.group.slug",
            "jsonPath": [
              "pageRef",
              "group",
              "slug"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "href",
            "jsonPath": [
              "href"
            ],
            "type": "string",
            "required": true
          }
        ]
      }
    ],
    "attributes": [
      {
        "name": "label",
        "jsonPath": [
          "label"
        ],
        "type": "string",
        "required": false,
        "default": "Menu"
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.color",
        "jsonPath": [
          "config",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "config.density",
        "jsonPath": [
          "config",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "config.elevation",
        "jsonPath": [
          "config",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "config.rounded",
        "jsonPath": [
          "config",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "config.showIcon",
        "jsonPath": [
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.uppercase",
        "jsonPath": [
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "config.variant",
        "jsonPath": [
          "config",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "breadcrumbs": {
    "tagName": "breadcrumbs",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "divider": {
    "tagName": "divider",
    "contentProperty": "content",
    "childrenSlots": [],
    "attributes": [
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "inset",
        "jsonPath": [
          "inset"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "opacity",
        "jsonPath": [
          "opacity"
        ],
        "type": "number",
        "required": true,
        "default": 0.1
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "thickness",
        "jsonPath": [
          "thickness"
        ],
        "type": "integer",
        "required": true,
        "default": 1
      }
    ],
    "hiddenProperties": []
  },
  "banner": {
    "tagName": "banner",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "children",
        "virtualTag": null,
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "fullWidth",
        "jsonPath": [
          "fullWidth"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "background.color",
        "jsonPath": [
          "background",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "background.image._id",
        "jsonPath": [
          "background",
          "image",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.image.mimeType",
        "jsonPath": [
          "background",
          "image",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.image.mobileAlt",
        "jsonPath": [
          "background",
          "image",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "background.image.name",
        "jsonPath": [
          "background",
          "image",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.tintStrength",
        "jsonPath": [
          "background",
          "tintStrength"
        ],
        "type": "number",
        "required": false,
        "default": 0.8
      },
      {
        "name": "pt",
        "jsonPath": [
          "pt"
        ],
        "type": "integer",
        "required": false
      },
      {
        "name": "pb",
        "jsonPath": [
          "pb"
        ],
        "type": "integer",
        "required": false
      },
      {
        "name": "pl",
        "jsonPath": [
          "pl"
        ],
        "type": "integer",
        "required": false
      },
      {
        "name": "pr",
        "jsonPath": [
          "pr"
        ],
        "type": "integer",
        "required": false
      },
      {
        "name": "overflowTop",
        "jsonPath": [
          "overflowTop"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "overflowBottom",
        "jsonPath": [
          "overflowBottom"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "card": {
    "tagName": "card",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "children",
        "virtualTag": null,
        "kind": "direct"
      },
      {
        "property": "actions",
        "virtualTag": "action",
        "kind": "link",
        "itemAttributes": [
          {
            "name": "type",
            "jsonPath": [
              "type"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "subtype",
            "jsonPath": [
              "subtype"
            ],
            "type": "string",
            "required": true,
            "enumValues": [
              "home",
              "contact",
              "accessibility",
              "terms-of-service",
              "legal-notice",
              "privacy-policy",
              "cookie-policy",
              "datasets",
              "applications",
              "reuses",
              "event-catalog",
              "news-catalog",
              "sitemap",
              "catalog-api-doc"
            ],
            "default": "home"
          },
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "target",
            "jsonPath": [
              "target"
            ],
            "type": "boolean",
            "required": false
          },
          {
            "name": "icon.mdi.name",
            "jsonPath": [
              "icon",
              "mdi",
              "name"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svg",
            "jsonPath": [
              "icon",
              "mdi",
              "svg"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svgPath",
            "jsonPath": [
              "icon",
              "mdi",
              "svgPath"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.custom",
            "jsonPath": [
              "icon",
              "custom"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.color",
            "jsonPath": [
              "icon",
              "color"
            ],
            "type": "string",
            "required": false,
            "enumValues": [
              "primary",
              "secondary",
              "accent",
              "info",
              "success",
              "error",
              "warning"
            ]
          },
          {
            "name": "pageRef.slug",
            "jsonPath": [
              "pageRef",
              "slug"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "pageRef.title",
            "jsonPath": [
              "pageRef",
              "title"
            ],
            "type": "string",
            "required": true
          },
          {
            "name": "pageRef.group._id",
            "jsonPath": [
              "pageRef",
              "group",
              "_id"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "pageRef.group.title",
            "jsonPath": [
              "pageRef",
              "group",
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "pageRef.group.slug",
            "jsonPath": [
              "pageRef",
              "group",
              "slug"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "href",
            "jsonPath": [
              "href"
            ],
            "type": "string",
            "required": true
          }
        ]
      }
    ],
    "attributes": [
      {
        "name": "actionStyle.config.color",
        "jsonPath": [
          "actionStyle",
          "config",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "actionStyle.config.density",
        "jsonPath": [
          "actionStyle",
          "config",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "actionStyle.config.elevation",
        "jsonPath": [
          "actionStyle",
          "config",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "actionStyle.config.rounded",
        "jsonPath": [
          "actionStyle",
          "config",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "actionStyle.config.showIcon",
        "jsonPath": [
          "actionStyle",
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "actionStyle.config.uppercase",
        "jsonPath": [
          "actionStyle",
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "actionStyle.config.variant",
        "jsonPath": [
          "actionStyle",
          "config",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "actionStyle.usePortalConfig",
        "jsonPath": [
          "actionStyle",
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "background.color",
        "jsonPath": [
          "background",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "background.image._id",
        "jsonPath": [
          "background",
          "image",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.image.mimeType",
        "jsonPath": [
          "background",
          "image",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.image.mobileAlt",
        "jsonPath": [
          "background",
          "image",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "background.image.name",
        "jsonPath": [
          "background",
          "image",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "background.tintStrength",
        "jsonPath": [
          "background",
          "tintStrength"
        ],
        "type": "number",
        "required": false,
        "default": 0.8
      },
      {
        "name": "background.tonal",
        "jsonPath": [
          "background",
          "tonal"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "contentAlign",
        "jsonPath": [
          "contentAlign"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "start",
          "center",
          "end"
        ]
      },
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group._id",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.group.title",
        "jsonPath": [
          "link",
          "pageRef",
          "group",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.slug",
        "jsonPath": [
          "link",
          "pageRef",
          "slug"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.pageRef.title",
        "jsonPath": [
          "link",
          "pageRef",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.subtype",
        "jsonPath": [
          "link",
          "subtype"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "home",
          "contact",
          "accessibility",
          "terms-of-service",
          "legal-notice",
          "privacy-policy",
          "cookie-policy",
          "datasets",
          "applications",
          "reuses",
          "event-catalog",
          "news-catalog",
          "sitemap",
          "catalog-api-doc"
        ],
        "default": "home"
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "link.type",
        "jsonPath": [
          "link",
          "type"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "thumbnail.crop",
        "jsonPath": [
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "thumbnail.image._id",
        "jsonPath": [
          "thumbnail",
          "image",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "thumbnail.image.mimeType",
        "jsonPath": [
          "thumbnail",
          "image",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "thumbnail.image.mobileAlt",
        "jsonPath": [
          "thumbnail",
          "image",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "thumbnail.image.name",
        "jsonPath": [
          "thumbnail",
          "image",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "thumbnail.location",
        "jsonPath": [
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "two-columns": {
    "tagName": "two-columns",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "children",
        "virtualTag": "left",
        "kind": "direct"
      },
      {
        "property": "children2",
        "virtualTag": "right",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "align.left",
        "jsonPath": [
          "align",
          "left"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "start",
          "center",
          "end",
          "stretch"
        ]
      },
      {
        "name": "align.right",
        "jsonPath": [
          "align",
          "right"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "start",
          "center",
          "end",
          "stretch"
        ]
      },
      {
        "name": "disposition",
        "jsonPath": [
          "disposition"
        ],
        "type": "string",
        "required": true,
        "enumValues": [
          "equal",
          "left",
          "right"
        ],
        "default": "equal"
      },
      {
        "name": "gutter",
        "jsonPath": [
          "gutter"
        ],
        "type": "string",
        "required": true,
        "enumValues": [
          "none",
          "dense",
          "default"
        ],
        "default": "default"
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "responsive-grid": {
    "tagName": "responsive-grid",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "children",
        "virtualTag": null,
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "align",
        "jsonPath": [
          "align"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "start",
          "center",
          "end",
          "stretch"
        ]
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          2,
          3,
          4,
          6
        ],
        "default": 2
      },
      {
        "name": "gutter",
        "jsonPath": [
          "gutter"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "dense",
          "default"
        ],
        "default": "default"
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "tabs": {
    "tagName": "tabs",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "tabs",
        "virtualTag": "tab",
        "kind": "structured",
        "itemAttributes": [
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.name",
            "jsonPath": [
              "icon",
              "mdi",
              "name"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svg",
            "jsonPath": [
              "icon",
              "mdi",
              "svg"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svgPath",
            "jsonPath": [
              "icon",
              "mdi",
              "svgPath"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.custom",
            "jsonPath": [
              "icon",
              "custom"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.color",
            "jsonPath": [
              "icon",
              "color"
            ],
            "type": "string",
            "required": false,
            "enumValues": [
              "primary",
              "secondary",
              "accent",
              "info",
              "success",
              "error",
              "warning"
            ]
          }
        ]
      }
    ],
    "attributes": [
      {
        "name": "align",
        "jsonPath": [
          "align"
        ],
        "type": "string",
        "required": true,
        "enumValues": [
          "start",
          "center",
          "end"
        ],
        "default": "start"
      },
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "grow",
        "jsonPath": [
          "grow"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "expansion-panels": {
    "tagName": "expansion-panels",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "panels",
        "virtualTag": "panel",
        "kind": "structured",
        "itemAttributes": [
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.name",
            "jsonPath": [
              "icon",
              "mdi",
              "name"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svg",
            "jsonPath": [
              "icon",
              "mdi",
              "svg"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.mdi.svgPath",
            "jsonPath": [
              "icon",
              "mdi",
              "svgPath"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.custom",
            "jsonPath": [
              "icon",
              "custom"
            ],
            "type": "string",
            "required": false
          },
          {
            "name": "icon.color",
            "jsonPath": [
              "icon",
              "color"
            ],
            "type": "string",
            "required": false,
            "enumValues": [
              "primary",
              "secondary",
              "accent",
              "info",
              "success",
              "error",
              "warning"
            ]
          }
        ]
      }
    ],
    "attributes": [
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "multiple",
        "jsonPath": [
          "multiple"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "openAll",
        "jsonPath": [
          "openAll"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "openFirst",
        "jsonPath": [
          "openFirst"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "textBackgroundColor",
        "jsonPath": [
          "textBackgroundColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "titleBackgroundColor",
        "jsonPath": [
          "titleBackgroundColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "search": {
    "tagName": "search",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "btnPosition",
        "jsonPath": [
          "btnPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "included",
          "attached",
          "spaced"
        ],
        "default": "included"
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "density",
        "jsonPath": [
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "fullWidth",
        "jsonPath": [
          "fullWidth"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "hideLabel",
        "jsonPath": [
          "hideLabel"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "label",
        "jsonPath": [
          "label"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "redirectPage",
        "jsonPath": [
          "redirectPage"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "topics": {
    "tagName": "topics",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "density",
        "jsonPath": [
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "iconColor",
        "jsonPath": [
          "iconColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "datasets",
          "applications"
        ],
        "default": "datasets"
      },
      {
        "name": "redirectPage",
        "jsonPath": [
          "redirectPage"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "showIcon",
        "jsonPath": [
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "variant",
        "jsonPath": [
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "metrics": {
    "tagName": "metrics",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "color",
        "jsonPath": [
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning",
          "surface",
          "surface-inverse",
          "background"
        ]
      },
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "fullWidth",
        "jsonPath": [
          "fullWidth"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "metrics",
        "jsonPath": [
          "metrics"
        ],
        "type": "string",
        "required": true,
        "default": [
          "datasets",
          "records",
          "applications"
        ]
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl",
          "shaped"
        ],
        "default": "default"
      }
    ],
    "hiddenProperties": []
  },
  "contact": {
    "tagName": "contact",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "defaultFields.enableMessage",
        "jsonPath": [
          "defaultFields",
          "enableMessage"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "defaultFields.enableSubject",
        "jsonPath": [
          "defaultFields",
          "enableSubject"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "defaultFields.messageMaxLength",
        "jsonPath": [
          "defaultFields",
          "messageMaxLength"
        ],
        "type": "integer",
        "required": false,
        "default": 2000
      },
      {
        "name": "defaultFields.messageMinLength",
        "jsonPath": [
          "defaultFields",
          "messageMinLength"
        ],
        "type": "integer",
        "required": false,
        "default": 50
      },
      {
        "name": "defaultFields.requiredMessage",
        "jsonPath": [
          "defaultFields",
          "requiredMessage"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "defaultFields.requiredSubject",
        "jsonPath": [
          "defaultFields",
          "requiredSubject"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "subjectTemplate",
        "jsonPath": [
          "subjectTemplate"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "bodyTemplate",
        "jsonPath": [
          "bodyTemplate"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "elevation",
        "jsonPath": [
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "showInfo",
        "jsonPath": [
          "showInfo"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showSocial",
        "jsonPath": [
          "showSocial"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "sendButton.config.color",
        "jsonPath": [
          "sendButton",
          "config",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "sendButton.config.density",
        "jsonPath": [
          "sendButton",
          "config",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "sendButton.config.elevation",
        "jsonPath": [
          "sendButton",
          "config",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "sendButton.config.rounded",
        "jsonPath": [
          "sendButton",
          "config",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "sendButton.config.showIcon",
        "jsonPath": [
          "sendButton",
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "sendButton.config.uppercase",
        "jsonPath": [
          "sendButton",
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "sendButton.config.variant",
        "jsonPath": [
          "sendButton",
          "config",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "sendButton.usePortalConfig",
        "jsonPath": [
          "sendButton",
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "hiddenProperties": [
      "bodyTemplate_html"
    ]
  },
  "datasets-catalog": {
    "tagName": "datasets-catalog",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "advancedFilters",
        "virtualTag": "filters",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "default": 2
      },
      {
        "name": "countPosition",
        "jsonPath": [
          "countPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "top",
          "bottom"
        ],
        "default": "top"
      },
      {
        "name": "defaultSort",
        "jsonPath": [
          "defaultSort"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "createdAt:-1",
          "dataUpdatedAt:-1",
          "title:1",
          "owner.departmentName:1"
        ],
        "default": "createdAt:-1"
      },
      {
        "name": "filters.density",
        "jsonPath": [
          "filters",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "filters.position",
        "jsonPath": [
          "filters",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "left"
        ],
        "default": "top"
      },
      {
        "name": "filters.rounded",
        "jsonPath": [
          "filters",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "pagination.alignment",
        "jsonPath": [
          "pagination",
          "alignment"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "center",
          "right"
        ],
        "default": "center"
      },
      {
        "name": "pagination.position",
        "jsonPath": [
          "pagination",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "before",
          "after",
          "both"
        ],
        "default": "none"
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showApiButton",
        "jsonPath": [
          "showApiButton"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "datasets-list": {
    "tagName": "datasets-list",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "lastUpdated",
          "lastCreated",
          "custom"
        ],
        "default": "lastUpdated"
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "cardConfig.actionsLocation",
        "jsonPath": [
          "cardConfig",
          "actionsLocation"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "right",
          "bottom",
          "none"
        ],
        "default": "bottom"
      },
      {
        "name": "cardConfig.actionsStyle",
        "jsonPath": [
          "cardConfig",
          "actionsStyle"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "icon",
          "full",
          "text"
        ],
        "default": "full"
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.keywords.color",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "cardConfig.keywords.density",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "cardConfig.keywords.elevation",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.keywords.rounded",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.keywords.show",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "show"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.keywords.variant",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.useApplication",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "useApplication"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "cardConfig.thumbnail.useTopic",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "useTopic"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      },
      {
        "name": "cardConfig.topics.color",
        "jsonPath": [
          "cardConfig",
          "topics",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.density",
        "jsonPath": [
          "cardConfig",
          "topics",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "cardConfig.topics.elevation",
        "jsonPath": [
          "cardConfig",
          "topics",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.topics.iconColor",
        "jsonPath": [
          "cardConfig",
          "topics",
          "iconColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.rounded",
        "jsonPath": [
          "cardConfig",
          "topics",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.topics.showIcon",
        "jsonPath": [
          "cardConfig",
          "topics",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.topics.variant",
        "jsonPath": [
          "cardConfig",
          "topics",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "dataset-card": {
    "tagName": "dataset-card",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "dataset.id",
        "jsonPath": [
          "dataset",
          "id"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "dataset.title",
        "jsonPath": [
          "dataset",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "cardConfig.actionsLocation",
        "jsonPath": [
          "cardConfig",
          "actionsLocation"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "right",
          "bottom",
          "none"
        ],
        "default": "bottom"
      },
      {
        "name": "cardConfig.actionsStyle",
        "jsonPath": [
          "cardConfig",
          "actionsStyle"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "icon",
          "full",
          "text"
        ],
        "default": "full"
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.keywords.color",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "primary",
          "secondary",
          "accent",
          "info",
          "success",
          "error",
          "warning"
        ]
      },
      {
        "name": "cardConfig.keywords.density",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "cardConfig.keywords.elevation",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.keywords.rounded",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.keywords.show",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "show"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.keywords.variant",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.useApplication",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "useApplication"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "cardConfig.thumbnail.useTopic",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "useTopic"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      },
      {
        "name": "cardConfig.topics.color",
        "jsonPath": [
          "cardConfig",
          "topics",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.density",
        "jsonPath": [
          "cardConfig",
          "topics",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "cardConfig.topics.elevation",
        "jsonPath": [
          "cardConfig",
          "topics",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.topics.iconColor",
        "jsonPath": [
          "cardConfig",
          "topics",
          "iconColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.rounded",
        "jsonPath": [
          "cardConfig",
          "topics",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.topics.showIcon",
        "jsonPath": [
          "cardConfig",
          "topics",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.topics.variant",
        "jsonPath": [
          "cardConfig",
          "topics",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "dataset-table": {
    "tagName": "dataset-table",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "uuid",
        "jsonPath": [
          "uuid"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cols",
        "jsonPath": [
          "cols"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "dataset.href",
        "jsonPath": [
          "dataset",
          "href"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "dataset.id",
        "jsonPath": [
          "dataset",
          "id"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "dataset.title",
        "jsonPath": [
          "dataset",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "display",
        "jsonPath": [
          "display"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "table",
          "table-dense",
          "list"
        ]
      },
      {
        "name": "interactions",
        "jsonPath": [
          "interactions"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "syncParams",
        "jsonPath": [
          "syncParams"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "sandboxed",
          "shared-filters"
        ],
        "default": "none"
      }
    ],
    "hiddenProperties": []
  },
  "dataset-form": {
    "tagName": "dataset-form",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "dataset.id",
        "jsonPath": [
          "dataset",
          "id"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "dataset.title",
        "jsonPath": [
          "dataset",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "dataset-download": {
    "tagName": "dataset-download",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "dataset.id",
        "jsonPath": [
          "dataset",
          "id"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "dataset.title",
        "jsonPath": [
          "dataset",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      }
    ],
    "hiddenProperties": []
  },
  "applications-catalog": {
    "tagName": "applications-catalog",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "advancedFilters",
        "virtualTag": "filters",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "default": 2
      },
      {
        "name": "countPosition",
        "jsonPath": [
          "countPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "top",
          "bottom"
        ],
        "default": "top"
      },
      {
        "name": "defaultSort",
        "jsonPath": [
          "defaultSort"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "createdAt:-1",
          "updatedAt:-1",
          "title:1"
        ],
        "default": "createdAt:-1"
      },
      {
        "name": "filters.density",
        "jsonPath": [
          "filters",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "filters.position",
        "jsonPath": [
          "filters",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "left"
        ],
        "default": "top"
      },
      {
        "name": "filters.rounded",
        "jsonPath": [
          "filters",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "pagination.alignment",
        "jsonPath": [
          "pagination",
          "alignment"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "center",
          "right"
        ],
        "default": "center"
      },
      {
        "name": "pagination.position",
        "jsonPath": [
          "pagination",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "before",
          "after",
          "both"
        ],
        "default": "none"
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "applications-list": {
    "tagName": "applications-list",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "lastUpdated",
          "lastCreated",
          "custom"
        ],
        "default": "lastUpdated"
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.actionsLocation",
        "jsonPath": [
          "cardConfig",
          "actionsLocation"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "right",
          "bottom",
          "none"
        ],
        "default": "bottom"
      },
      {
        "name": "cardConfig.actionsStyle",
        "jsonPath": [
          "cardConfig",
          "actionsStyle"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "icon",
          "full",
          "text"
        ],
        "default": "full"
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.useTopic",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "useTopic"
        ],
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      },
      {
        "name": "cardConfig.topics.color",
        "jsonPath": [
          "cardConfig",
          "topics",
          "color"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.density",
        "jsonPath": [
          "cardConfig",
          "topics",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "cardConfig.topics.elevation",
        "jsonPath": [
          "cardConfig",
          "topics",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.topics.iconColor",
        "jsonPath": [
          "cardConfig",
          "topics",
          "iconColor"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "primary",
          "secondary",
          "accent"
        ]
      },
      {
        "name": "cardConfig.topics.rounded",
        "jsonPath": [
          "cardConfig",
          "topics",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.topics.showIcon",
        "jsonPath": [
          "cardConfig",
          "topics",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.topics.variant",
        "jsonPath": [
          "cardConfig",
          "topics",
          "variant"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "outlined",
          "tonal"
        ]
      }
    ],
    "hiddenProperties": []
  },
  "application": {
    "tagName": "application",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "uuid",
        "jsonPath": [
          "uuid"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "application.id",
        "jsonPath": [
          "application",
          "id"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "application.slug",
        "jsonPath": [
          "application",
          "slug"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "application.title",
        "jsonPath": [
          "application",
          "title"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "syncParams",
        "jsonPath": [
          "syncParams"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "sandboxed",
          "shared-filters"
        ],
        "default": "none"
      }
    ],
    "hiddenProperties": []
  },
  "reuses-catalog": {
    "tagName": "reuses-catalog",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "advancedFilters",
        "virtualTag": "filters",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "default": 2
      },
      {
        "name": "countPosition",
        "jsonPath": [
          "countPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "top",
          "bottom"
        ],
        "default": "top"
      },
      {
        "name": "defaultSort",
        "jsonPath": [
          "defaultSort"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "createdAt:-1",
          "updatedAt:-1",
          "title:1"
        ],
        "default": "updatedAt:-1"
      },
      {
        "name": "filters.density",
        "jsonPath": [
          "filters",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "filters.position",
        "jsonPath": [
          "filters",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "left"
        ],
        "default": "top"
      },
      {
        "name": "filters.rounded",
        "jsonPath": [
          "filters",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "pagination.alignment",
        "jsonPath": [
          "pagination",
          "alignment"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "center",
          "right"
        ],
        "default": "center"
      },
      {
        "name": "pagination.position",
        "jsonPath": [
          "pagination",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "before",
          "after",
          "both"
        ],
        "default": "none"
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "reuses-list": {
    "tagName": "reuses-list",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "lastUpdated",
          "lastCreated",
          "custom"
        ],
        "default": "lastUpdated"
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showAuthor",
        "jsonPath": [
          "cardConfig",
          "showAuthor"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  },
  "reuse-card": {
    "tagName": "reuse-card",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "reuse.slug",
        "jsonPath": [
          "reuse",
          "slug"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "reuse.title",
        "jsonPath": [
          "reuse",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showAuthor",
        "jsonPath": [
          "cardConfig",
          "showAuthor"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  },
  "event-catalog": {
    "tagName": "event-catalog",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "advancedFilters",
        "virtualTag": "filters",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "default": 2
      },
      {
        "name": "countPosition",
        "jsonPath": [
          "countPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "top",
          "bottom"
        ],
        "default": "top"
      },
      {
        "name": "defaultSort",
        "jsonPath": [
          "defaultSort"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "startDate:1",
          "title:1"
        ],
        "default": "startDate:1"
      },
      {
        "name": "filters.density",
        "jsonPath": [
          "filters",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "filters.position",
        "jsonPath": [
          "filters",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "left"
        ],
        "default": "top"
      },
      {
        "name": "filters.rounded",
        "jsonPath": [
          "filters",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "includePast",
        "jsonPath": [
          "includePast"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "pagination.alignment",
        "jsonPath": [
          "pagination",
          "alignment"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "center",
          "right"
        ],
        "default": "center"
      },
      {
        "name": "pagination.position",
        "jsonPath": [
          "pagination",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "before",
          "after",
          "both"
        ],
        "default": "none"
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "event-list": {
    "tagName": "event-list",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "upcoming",
          "custom"
        ],
        "default": "upcoming"
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  },
  "event-card": {
    "tagName": "event-card",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "event.slug",
        "jsonPath": [
          "event",
          "slug"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "event.title",
        "jsonPath": [
          "event",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  },
  "news-catalog": {
    "tagName": "news-catalog",
    "contentProperty": null,
    "childrenSlots": [
      {
        "property": "advancedFilters",
        "virtualTag": "filters",
        "kind": "direct"
      }
    ],
    "attributes": [
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": false,
        "default": 2
      },
      {
        "name": "countPosition",
        "jsonPath": [
          "countPosition"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "top",
          "bottom"
        ],
        "default": "top"
      },
      {
        "name": "defaultSort",
        "jsonPath": [
          "defaultSort"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "date:-1",
          "date:1",
          "title:1"
        ],
        "default": "date:-1"
      },
      {
        "name": "filters.density",
        "jsonPath": [
          "filters",
          "density"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "default",
          "comfortable",
          "compact"
        ]
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "filters.position",
        "jsonPath": [
          "filters",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "top",
          "left"
        ],
        "default": "top"
      },
      {
        "name": "filters.rounded",
        "jsonPath": [
          "filters",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "pagination.alignment",
        "jsonPath": [
          "pagination",
          "alignment"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "center",
          "right"
        ],
        "default": "center"
      },
      {
        "name": "pagination.position",
        "jsonPath": [
          "pagination",
          "position"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "none",
          "before",
          "after",
          "both"
        ],
        "default": "none"
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false
      }
    ],
    "hiddenProperties": []
  },
  "news-list": {
    "tagName": "news-list",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "mode",
        "jsonPath": [
          "mode"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "upcoming",
          "custom"
        ],
        "default": "upcoming"
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  },
  "news-card": {
    "tagName": "news-card",
    "contentProperty": null,
    "childrenSlots": [],
    "attributes": [
      {
        "name": "news.slug",
        "jsonPath": [
          "news",
          "slug"
        ],
        "type": "string",
        "required": true
      },
      {
        "name": "news.title",
        "jsonPath": [
          "news",
          "title"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true
      },
      {
        "name": "cardConfig.elevation",
        "jsonPath": [
          "cardConfig",
          "elevation"
        ],
        "type": "integer",
        "required": false,
        "enumValues": [
          0,
          1,
          2,
          3
        ]
      },
      {
        "name": "cardConfig.rounded",
        "jsonPath": [
          "cardConfig",
          "rounded"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "0",
          "default",
          "lg",
          "xl"
        ]
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.crop",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.thumbnail.default._id",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "_id"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mimeType",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mimeType"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.mobileAlt",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "mobileAlt"
        ],
        "type": "boolean",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.default.name",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "default",
          "name"
        ],
        "type": "string",
        "required": false
      },
      {
        "name": "cardConfig.thumbnail.location",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "location"
        ],
        "type": "string",
        "required": false,
        "enumValues": [
          "left",
          "top",
          "center"
        ],
        "default": "center"
      },
      {
        "name": "cardConfig.thumbnail.show",
        "jsonPath": [
          "cardConfig",
          "thumbnail",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "cardConfig.titleLinesCount",
        "jsonPath": [
          "cardConfig",
          "titleLinesCount"
        ],
        "type": "number",
        "required": false,
        "enumValues": [
          1,
          2,
          0
        ],
        "default": 2
      }
    ],
    "hiddenProperties": []
  }
}
