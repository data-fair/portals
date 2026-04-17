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
        "required": false,
        "titles": {
          "en": "Bold text",
          "fr": "Texte en gras"
        }
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Center the title",
          "fr": "Centrer le titre"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Custom icon",
          "fr": "Icône personnalisée"
        }
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
        ],
        "titles": {
          "en": "Line color",
          "fr": "Couleur du trait"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Display a line",
          "fr": "Afficher un trait"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun trait"
          },
          "left": {
            "en": "Trait à gauche du titre"
          },
          "bottom-small": {
            "en": "Petit trait sous le titre"
          },
          "bottom-medium": {
            "en": "Trait sous le titre (largeur du texte)"
          },
          "bottom-large": {
            "en": "Trait pleine largeur sous le titre"
          }
        }
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "URL"
        }
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
        "default": "home",
        "titles": {
          "en": "Type de page"
        },
        "enumTitles": {
          "home": {
            "en": "Accueil"
          },
          "contact": {
            "en": "Contact"
          },
          "accessibility": {
            "en": "Accessibilité"
          },
          "terms-of-service": {
            "en": "Conditions générales d'utilisation"
          },
          "legal-notice": {
            "en": "Mentions légales"
          },
          "privacy-policy": {
            "en": "Politique de confidentialité"
          },
          "cookie-policy": {
            "en": "Politique de cookies"
          },
          "datasets": {
            "en": "Catalogue de données"
          },
          "applications": {
            "en": "Catalogue de visualisations"
          },
          "reuses": {
            "en": "Catalogue de réutilisations"
          },
          "event-catalog": {
            "en": "Catalogue d'événements"
          },
          "news-catalog": {
            "en": "Catalogue d'actualités"
          },
          "sitemap": {
            "en": "Plan du site"
          },
          "catalog-api-doc": {
            "en": "Documentation d'API"
          }
        }
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir dans un nouvel onglet"
        }
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Texte alternatif"
        }
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
        "default": "h3",
        "titles": {
          "en": "Title size",
          "fr": "Taille du titre"
        },
        "enumTitles": {
          "h1": {
            "en": "Titre principal"
          },
          "h2": {
            "en": "Très grand"
          },
          "h3": {
            "en": "Grand"
          },
          "h4": {
            "en": "Moyen"
          },
          "h5": {
            "en": "Petit"
          },
          "h6": {
            "en": "Très petit"
          }
        }
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
        ],
        "titles": {
          "en": "Heading tag",
          "fr": "Balise"
        },
        "enumTitles": {
          "h1": {
            "en": "H1"
          },
          "h2": {
            "en": "H2"
          },
          "h3": {
            "en": "H3"
          },
          "h4": {
            "en": "H4"
          },
          "h5": {
            "en": "H5"
          },
          "h6": {
            "en": "H6"
          },
          "div": {
            "en": "Div"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Title",
      "fr": "Titre"
    }
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
        "default": false,
        "titles": {
          "en": "Centrer le contenu"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [
      "_html"
    ],
    "titles": {
      "en": "Texte"
    }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Custom icon",
          "fr": "Icône personnalisée"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
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
        "default": "info",
        "titles": {
          "en": "Type prédéfini"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "info": {
            "en": "Information"
          },
          "success": {
            "en": "Succès"
          },
          "error": {
            "en": "Erreur"
          },
          "warning": {
            "en": "Avertissement"
          }
        }
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Titre"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [
      "_html"
    ],
    "titles": {
      "en": "Accented text",
      "fr": "Texte accentué"
    }
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
        "required": false,
        "titles": {
          "en": "Pleine largeur"
        }
      },
      {
        "name": "cover",
        "jsonPath": [
          "cover"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Recadrer l'image pour remplir l'espace"
        }
      },
      {
        "name": "height",
        "jsonPath": [
          "height"
        ],
        "type": "integer",
        "required": false,
        "titles": {
          "en": "Hauteur fixe (px)"
        }
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
        "required": false,
        "titles": {
          "en": "Image de présentation (décorative)"
        }
      },
      {
        "name": "legend",
        "jsonPath": [
          "legend"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Légende de l'image"
        }
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "URL"
        }
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
        "default": "home",
        "titles": {
          "en": "Type de page"
        },
        "enumTitles": {
          "home": {
            "en": "Accueil"
          },
          "contact": {
            "en": "Contact"
          },
          "accessibility": {
            "en": "Accessibilité"
          },
          "terms-of-service": {
            "en": "Conditions générales d'utilisation"
          },
          "legal-notice": {
            "en": "Mentions légales"
          },
          "privacy-policy": {
            "en": "Politique de confidentialité"
          },
          "cookie-policy": {
            "en": "Politique de cookies"
          },
          "datasets": {
            "en": "Catalogue de données"
          },
          "applications": {
            "en": "Catalogue de visualisations"
          },
          "reuses": {
            "en": "Catalogue de réutilisations"
          },
          "event-catalog": {
            "en": "Catalogue d'événements"
          },
          "news-catalog": {
            "en": "Catalogue d'actualités"
          },
          "sitemap": {
            "en": "Plan du site"
          },
          "catalog-api-doc": {
            "en": "Documentation d'API"
          }
        }
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir dans un nouvel onglet"
        }
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Texte alternatif"
        }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Titre de l'image (Accessibilité)"
        }
      },
      {
        "name": "url",
        "jsonPath": [
          "url"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "URL vers l'image"
        }
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
        "required": false,
        "titles": {
          "en": "Zoom au clic"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Image",
      "fr": "Image"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "scroll",
        "jsonPath": [
          "scroll"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer le scroll"
        }
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Titre de l'iframe"
        }
      },
      {
        "name": "url",
        "jsonPath": [
          "url"
        ],
        "type": "string",
        "required": true,
        "titles": {
          "en": "URL de l'iframe"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "IFrame"
    }
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
        "default": false,
        "titles": {
          "en": "Center the icon",
          "fr": "Centrer l'icône"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
      },
      {
        "name": "icon.custom",
        "jsonPath": [
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Custom icon",
          "fr": "Icône personnalisée"
        }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "size",
        "jsonPath": [
          "size"
        ],
        "type": "integer",
        "required": false,
        "default": 48,
        "titles": {
          "en": "Size (px)",
          "fr": "Taille (px)"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Icon",
      "fr": "Icône"
    }
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
        "required": false,
        "titles": {
          "en": "URL"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
      },
      {
        "name": "link.icon.custom",
        "jsonPath": [
          "link",
          "icon",
          "custom"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Custom icon",
          "fr": "Icône personnalisée"
        }
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
        "default": "home",
        "titles": {
          "en": "Type de page"
        },
        "enumTitles": {
          "home": {
            "en": "Accueil"
          },
          "contact": {
            "en": "Contact"
          },
          "accessibility": {
            "en": "Accessibilité"
          },
          "terms-of-service": {
            "en": "Conditions générales d'utilisation"
          },
          "legal-notice": {
            "en": "Mentions légales"
          },
          "privacy-policy": {
            "en": "Politique de confidentialité"
          },
          "cookie-policy": {
            "en": "Politique de cookies"
          },
          "datasets": {
            "en": "Catalogue de données"
          },
          "applications": {
            "en": "Catalogue de visualisations"
          },
          "reuses": {
            "en": "Catalogue de réutilisations"
          },
          "event-catalog": {
            "en": "Catalogue d'événements"
          },
          "news-catalog": {
            "en": "Catalogue d'actualités"
          },
          "sitemap": {
            "en": "Plan du site"
          },
          "catalog-api-doc": {
            "en": "Documentation d'API"
          }
        }
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir dans un nouvel onglet"
        }
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Libellé"
        }
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
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "config.showIcon",
        "jsonPath": [
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
      },
      {
        "name": "config.uppercase",
        "jsonPath": [
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Texte en majuscules"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Centré"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Navigation button",
      "fr": "Bouton de navigation"
    }
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
            "default": "home",
            "titles": {
              "en": "Type de page"
            },
            "enumTitles": {
              "home": {
                "en": "Accueil"
              },
              "contact": {
                "en": "Contact"
              },
              "accessibility": {
                "en": "Accessibilité"
              },
              "terms-of-service": {
                "en": "Conditions générales d'utilisation"
              },
              "legal-notice": {
                "en": "Mentions légales"
              },
              "privacy-policy": {
                "en": "Politique de confidentialité"
              },
              "cookie-policy": {
                "en": "Politique de cookies"
              },
              "datasets": {
                "en": "Catalogue de données"
              },
              "applications": {
                "en": "Catalogue de visualisations"
              },
              "reuses": {
                "en": "Catalogue de réutilisations"
              },
              "event-catalog": {
                "en": "Catalogue d'événements"
              },
              "news-catalog": {
                "en": "Catalogue d'actualités"
              },
              "sitemap": {
                "en": "Plan du site"
              },
              "catalog-api-doc": {
                "en": "Documentation d'API"
              }
            }
          },
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false,
            "titles": {
              "en": "Libellé"
            }
          },
          {
            "name": "target",
            "jsonPath": [
              "target"
            ],
            "type": "boolean",
            "required": false,
            "titles": {
              "en": "Ouvrir dans un nouvel onglet"
            }
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
            "required": false,
            "titles": {
              "en": "Custom icon",
              "fr": "Icône personnalisée"
            }
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
            ],
            "titles": {
              "en": "Color",
              "fr": "Couleur"
            },
            "enumTitles": {
              "primary": {
                "en": "Primary",
                "fr": "Primaire"
              },
              "secondary": {
                "en": "Secondary",
                "fr": "Secondaire"
              },
              "accent": {
                "en": "Accent",
                "fr": "Accentuée"
              },
              "info": {
                "en": "Info",
                "fr": "Information"
              },
              "success": {
                "en": "Success",
                "fr": "Succès"
              },
              "error": {
                "en": "Error",
                "fr": "Erreur"
              },
              "warning": {
                "en": "Warning",
                "fr": "Avertissement"
              }
            }
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
            "required": true,
            "titles": {
              "en": "URL"
            }
          }
        ],
        "titles": {
          "en": "Liens"
        }
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
        "default": "Menu",
        "titles": {
          "en": "Libellé du menu"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "config.showIcon",
        "jsonPath": [
          "config",
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
      },
      {
        "name": "config.uppercase",
        "jsonPath": [
          "config",
          "uppercase"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Texte en majuscules"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Centré"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Navigation menu",
      "fr": "Menu de navigation"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Breadcrumbs",
      "fr": "Fil d'Ariane"
    }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
      },
      {
        "name": "inset",
        "jsonPath": [
          "inset"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ajouter une indentation"
        }
      },
      {
        "name": "opacity",
        "jsonPath": [
          "opacity"
        ],
        "type": "number",
        "required": true,
        "default": 0.1,
        "titles": {
          "en": "Opacité"
        }
      },
      {
        "name": "rounded",
        "jsonPath": [
          "rounded"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Bords arrondis"
        }
      },
      {
        "name": "thickness",
        "jsonPath": [
          "thickness"
        ],
        "type": "integer",
        "required": true,
        "default": 1,
        "titles": {
          "en": "Épaisseur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Divider",
      "fr": "Séparateur horizontal"
    }
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
        "required": false,
        "titles": {
          "en": "Pleine largeur"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
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
        "default": 0.8,
        "titles": {
          "en": "Intensité de la teinte"
        }
      },
      {
        "name": "pt",
        "jsonPath": [
          "pt"
        ],
        "type": "integer",
        "required": false,
        "titles": {
          "en": "Marge supérieur"
        }
      },
      {
        "name": "pb",
        "jsonPath": [
          "pb"
        ],
        "type": "integer",
        "required": false,
        "titles": {
          "en": "Marge inférieur"
        }
      },
      {
        "name": "pl",
        "jsonPath": [
          "pl"
        ],
        "type": "integer",
        "required": false,
        "titles": {
          "en": "Marge gauche"
        }
      },
      {
        "name": "pr",
        "jsonPath": [
          "pr"
        ],
        "type": "integer",
        "required": false,
        "titles": {
          "en": "Marge droite"
        }
      },
      {
        "name": "overflowTop",
        "jsonPath": [
          "overflowTop"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Débordement supérieur"
        }
      },
      {
        "name": "overflowBottom",
        "jsonPath": [
          "overflowBottom"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Débordement inférieur"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Colored background section",
      "fr": "Section sur fond coloré"
    }
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
            "default": "home",
            "titles": {
              "en": "Type de page"
            },
            "enumTitles": {
              "home": {
                "en": "Accueil"
              },
              "contact": {
                "en": "Contact"
              },
              "accessibility": {
                "en": "Accessibilité"
              },
              "terms-of-service": {
                "en": "Conditions générales d'utilisation"
              },
              "legal-notice": {
                "en": "Mentions légales"
              },
              "privacy-policy": {
                "en": "Politique de confidentialité"
              },
              "cookie-policy": {
                "en": "Politique de cookies"
              },
              "datasets": {
                "en": "Catalogue de données"
              },
              "applications": {
                "en": "Catalogue de visualisations"
              },
              "reuses": {
                "en": "Catalogue de réutilisations"
              },
              "event-catalog": {
                "en": "Catalogue d'événements"
              },
              "news-catalog": {
                "en": "Catalogue d'actualités"
              },
              "sitemap": {
                "en": "Plan du site"
              },
              "catalog-api-doc": {
                "en": "Documentation d'API"
              }
            }
          },
          {
            "name": "title",
            "jsonPath": [
              "title"
            ],
            "type": "string",
            "required": false,
            "titles": {
              "en": "Libellé"
            }
          },
          {
            "name": "target",
            "jsonPath": [
              "target"
            ],
            "type": "boolean",
            "required": false,
            "titles": {
              "en": "Ouvrir dans un nouvel onglet"
            }
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
            "required": false,
            "titles": {
              "en": "Custom icon",
              "fr": "Icône personnalisée"
            }
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
            ],
            "titles": {
              "en": "Color",
              "fr": "Couleur"
            },
            "enumTitles": {
              "primary": {
                "en": "Primary",
                "fr": "Primaire"
              },
              "secondary": {
                "en": "Secondary",
                "fr": "Secondaire"
              },
              "accent": {
                "en": "Accent",
                "fr": "Accentuée"
              },
              "info": {
                "en": "Info",
                "fr": "Information"
              },
              "success": {
                "en": "Success",
                "fr": "Succès"
              },
              "error": {
                "en": "Error",
                "fr": "Erreur"
              },
              "warning": {
                "en": "Warning",
                "fr": "Avertissement"
              }
            }
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
            "required": true,
            "titles": {
              "en": "URL"
            }
          }
        ],
        "titles": {
          "en": "Boutons de navigation"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        "default": true,
        "titles": {
          "en": "Texte en majuscules"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      },
      {
        "name": "actionStyle.usePortalConfig",
        "jsonPath": [
          "actionStyle",
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
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
        "default": 0.8,
        "titles": {
          "en": "Intensité de la teinte"
        }
      },
      {
        "name": "background.tonal",
        "jsonPath": [
          "background",
          "tonal"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Utiliser une variante tonale de la couleur de fond"
        }
      },
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Bordure"
        }
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
        ],
        "titles": {
          "en": "Alignement vertical des blocs dans la boite"
        },
        "enumTitles": {
          "start": {
            "en": "En haut"
          },
          "center": {
            "en": "Au centre"
          },
          "end": {
            "en": "En bas"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
      },
      {
        "name": "link.href",
        "jsonPath": [
          "link",
          "href"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "URL"
        }
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
        "default": "home",
        "titles": {
          "en": "Type de page"
        },
        "enumTitles": {
          "home": {
            "en": "Accueil"
          },
          "contact": {
            "en": "Contact"
          },
          "accessibility": {
            "en": "Accessibilité"
          },
          "terms-of-service": {
            "en": "Conditions générales d'utilisation"
          },
          "legal-notice": {
            "en": "Mentions légales"
          },
          "privacy-policy": {
            "en": "Politique de confidentialité"
          },
          "cookie-policy": {
            "en": "Politique de cookies"
          },
          "datasets": {
            "en": "Catalogue de données"
          },
          "applications": {
            "en": "Catalogue de visualisations"
          },
          "reuses": {
            "en": "Catalogue de réutilisations"
          },
          "event-catalog": {
            "en": "Catalogue d'événements"
          },
          "news-catalog": {
            "en": "Catalogue d'actualités"
          },
          "sitemap": {
            "en": "Plan du site"
          },
          "catalog-api-doc": {
            "en": "Documentation d'API"
          }
        }
      },
      {
        "name": "link.target",
        "jsonPath": [
          "link",
          "target"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir dans un nouvel onglet"
        }
      },
      {
        "name": "link.title",
        "jsonPath": [
          "link",
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Texte alternatif"
        }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "thumbnail.crop",
        "jsonPath": [
          "thumbnail",
          "crop"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "top": {
            "en": "En haut"
          },
          "center": {
            "en": "Sous le titre"
          }
        }
      },
      {
        "name": "title",
        "jsonPath": [
          "title"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Titre"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Card",
      "fr": "Boite"
    }
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
        ],
        "titles": {
          "en": "Colonne 1"
        },
        "enumTitles": {
          "start": {
            "en": "Aligné en haut"
          },
          "center": {
            "en": "Aligné au centre"
          },
          "end": {
            "en": "Aligné en bas"
          },
          "stretch": {
            "en": "Étendre les éléments"
          }
        }
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
        ],
        "titles": {
          "en": "Colonne 2"
        },
        "enumTitles": {
          "start": {
            "en": "Aligné en haut"
          },
          "center": {
            "en": "Aligné au centre"
          },
          "end": {
            "en": "Aligné en bas"
          },
          "stretch": {
            "en": "Étendre les éléments"
          }
        }
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
        "default": "equal",
        "titles": {
          "en": "Disposition"
        },
        "enumTitles": {
          "equal": {
            "en": "Largeur de même taille"
          },
          "left": {
            "en": "Colonne gauche large"
          },
          "right": {
            "en": "Colonne droite large"
          }
        }
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
        "default": "default",
        "titles": {
          "en": "Espacement entre les colonnes"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun espacement"
          },
          "dense": {
            "en": "Petit espacement"
          },
          "default": {
            "en": "Espacement normal"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Two columns",
      "fr": "Deux colonnes"
    }
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
        ],
        "titles": {
          "en": "Alignement vertical des blocs"
        },
        "enumTitles": {
          "start": {
            "en": "Aligné en haut"
          },
          "center": {
            "en": "Aligné au centre"
          },
          "end": {
            "en": "Aligné en bas"
          },
          "stretch": {
            "en": "Étendre les blocs"
          }
        }
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Centrer les blocs sur les lignes incomplètes"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        },
        "enumTitles": {
          "2": {
            "en": "2"
          },
          "3": {
            "en": "3"
          },
          "4": {
            "en": "4"
          },
          "6": {
            "en": "6"
          }
        }
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
        "default": "default",
        "titles": {
          "en": "Espacement entre les blocs"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun espacement"
          },
          "dense": {
            "en": "Petit espacement"
          },
          "default": {
            "en": "Espacement normal"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Responsive Grid",
      "fr": "Grille responsive"
    }
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
            "required": false,
            "titles": {
              "en": "Titre onglet"
            }
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
            "required": false,
            "titles": {
              "en": "Custom icon",
              "fr": "Icône personnalisée"
            }
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
            ],
            "titles": {
              "en": "Color",
              "fr": "Couleur"
            },
            "enumTitles": {
              "primary": {
                "en": "Primary",
                "fr": "Primaire"
              },
              "secondary": {
                "en": "Secondary",
                "fr": "Secondaire"
              },
              "accent": {
                "en": "Accent",
                "fr": "Accentuée"
              },
              "info": {
                "en": "Info",
                "fr": "Information"
              },
              "success": {
                "en": "Success",
                "fr": "Succès"
              },
              "error": {
                "en": "Error",
                "fr": "Erreur"
              },
              "warning": {
                "en": "Warning",
                "fr": "Avertissement"
              }
            }
          }
        ],
        "titles": {
          "en": "Onglets"
        }
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
        "default": "start",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "start": {
            "en": "Début"
          },
          "center": {
            "en": "Centre"
          },
          "end": {
            "en": "Fin"
          }
        }
      },
      {
        "name": "border",
        "jsonPath": [
          "border"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Bordure"
        }
      },
      {
        "name": "grow",
        "jsonPath": [
          "grow"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Étendre"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Tabs",
      "fr": "Onglets"
    }
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
            "required": false,
            "titles": {
              "en": "Titre du panneau"
            }
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
            "required": false,
            "titles": {
              "en": "Custom icon",
              "fr": "Icône personnalisée"
            }
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
            ],
            "titles": {
              "en": "Color",
              "fr": "Couleur"
            },
            "enumTitles": {
              "primary": {
                "en": "Primary",
                "fr": "Primaire"
              },
              "secondary": {
                "en": "Secondary",
                "fr": "Secondaire"
              },
              "accent": {
                "en": "Accent",
                "fr": "Accentuée"
              },
              "info": {
                "en": "Info",
                "fr": "Information"
              },
              "success": {
                "en": "Success",
                "fr": "Succès"
              },
              "error": {
                "en": "Error",
                "fr": "Erreur"
              },
              "warning": {
                "en": "Warning",
                "fr": "Avertissement"
              }
            }
          }
        ],
        "titles": {
          "en": "Panneaux"
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "multiple",
        "jsonPath": [
          "multiple"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Permettre l'ouverture multiple"
        }
      },
      {
        "name": "openAll",
        "jsonPath": [
          "openAll"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir tous les panneaux par défaut"
        }
      },
      {
        "name": "openFirst",
        "jsonPath": [
          "openFirst"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Ouvrir le premier panneau par défaut"
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de fond du contenu",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de fond des titres",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Expansion panels",
      "fr": "Accordéons"
    }
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
        "required": false,
        "titles": {
          "en": "Bordure"
        }
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
        "default": "included",
        "titles": {
          "en": "Position du bouton"
        },
        "enumTitles": {
          "included": {
            "en": "Included",
            "fr": "Inclus"
          },
          "attached": {
            "en": "Attached",
            "fr": "Collé"
          },
          "spaced": {
            "en": "Spaced",
            "fr": "Espacé"
          }
        }
      },
      {
        "name": "centered",
        "jsonPath": [
          "centered"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Centrer le champ de recherche"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Élévation du bouton",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
      },
      {
        "name": "fullWidth",
        "jsonPath": [
          "fullWidth"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Pleine largeur"
        }
      },
      {
        "name": "hideLabel",
        "jsonPath": [
          "hideLabel"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Masquer le label au focus"
        }
      },
      {
        "name": "label",
        "jsonPath": [
          "label"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Texte du label"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "redirectPage",
        "jsonPath": [
          "redirectPage"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Rediriger vers la page de jeux de données"
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Search",
      "fr": "Barre de recherche"
    }
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
        "required": false,
        "titles": {
          "en": "Centrer les thématiques"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de l'icône",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "datasets",
        "titles": {
          "en": "Source des thématiques"
        },
        "enumTitles": {
          "datasets": {
            "en": "Jeux de données"
          },
          "applications": {
            "en": "Visualisations"
          }
        }
      },
      {
        "name": "redirectPage",
        "jsonPath": [
          "redirectPage"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Rediriger vers le catalogue"
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "showIcon",
        "jsonPath": [
          "showIcon"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Topics list",
      "fr": "Liste de thématiques"
    }
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
        "default": true,
        "titles": {
          "en": "Bordure"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          },
          "surface": {
            "en": "Surface color",
            "fr": "Couleur des surfaces"
          },
          "surface-inverse": {
            "en": "Inverse surface color",
            "fr": "Couleur inversée des surfaces"
          },
          "background": {
            "en": "Background color",
            "fr": "Couleur du fond de page"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
      },
      {
        "name": "fullWidth",
        "jsonPath": [
          "fullWidth"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Pleine largeur"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "metrics",
        "jsonPath": [
          "metrics"
        ],
        "type": "string-array",
        "required": true,
        "enumValues": [
          "datasets",
          "records",
          "applications"
        ],
        "default": [
          "datasets",
          "records",
          "applications"
        ],
        "titles": {
          "en": "Chiffres à afficher"
        },
        "enumTitles": {
          "datasets": {
            "en": "Jeux de données"
          },
          "records": {
            "en": "Enregistrements"
          },
          "applications": {
            "en": "Visualisations"
          }
        }
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
        "default": "default",
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          },
          "shaped": {
            "en": "Opposite corners",
            "fr": "Coins opposés"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Key metrics",
      "fr": "Chiffres clés"
    }
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
        "default": true,
        "titles": {
          "en": "Afficher le champ message"
        }
      },
      {
        "name": "defaultFields.enableSubject",
        "jsonPath": [
          "defaultFields",
          "enableSubject"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le champ sujet"
        }
      },
      {
        "name": "defaultFields.messageMaxLength",
        "jsonPath": [
          "defaultFields",
          "messageMaxLength"
        ],
        "type": "integer",
        "required": false,
        "default": 2000,
        "titles": {
          "en": "Max. caractères"
        }
      },
      {
        "name": "defaultFields.messageMinLength",
        "jsonPath": [
          "defaultFields",
          "messageMinLength"
        ],
        "type": "integer",
        "required": false,
        "default": 50,
        "titles": {
          "en": "Min. caractères"
        }
      },
      {
        "name": "defaultFields.requiredMessage",
        "jsonPath": [
          "defaultFields",
          "requiredMessage"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Message obligatoire"
        }
      },
      {
        "name": "defaultFields.requiredSubject",
        "jsonPath": [
          "defaultFields",
          "requiredSubject"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Sujet obligatoire"
        }
      },
      {
        "name": "subjectTemplate",
        "jsonPath": [
          "subjectTemplate"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Format de l'objet de l'email"
        }
      },
      {
        "name": "bodyTemplate",
        "jsonPath": [
          "bodyTemplate"
        ],
        "type": "string",
        "required": false,
        "titles": {
          "en": "Format du corps de l'email"
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "showInfo",
        "jsonPath": [
          "showInfo"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les informations de contact"
        }
      },
      {
        "name": "showSocial",
        "jsonPath": [
          "showSocial"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les liens de réseaux sociaux"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        "default": true,
        "titles": {
          "en": "Texte en majuscules"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      },
      {
        "name": "sendButton.usePortalConfig",
        "jsonPath": [
          "sendButton",
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
      }
    ],
    "hiddenProperties": [
      "bodyTemplate_html"
    ],
    "titles": {
      "en": "Contact form",
      "fr": "Formulaire de contact"
    }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
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
        "default": "top",
        "titles": {
          "en": "Position du nombre de résultats"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "top": {
            "en": "Au dessus des filtres"
          },
          "bottom": {
            "en": "Au dessus des résultats"
          }
        }
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
        "default": "createdAt:-1",
        "titles": {
          "en": "Tri par défaut"
        },
        "enumTitles": {
          "createdAt:-1": {
            "en": "Date de création (du plus récent au plus ancien)"
          },
          "dataUpdatedAt:-1": {
            "en": "Date de mise à jour (du plus récent au plus ancien)"
          },
          "title:1": {
            "en": "Ordre alphabétique (A à Z)"
          },
          "owner.departmentName:1": {
            "en": "Propriétaire"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string-array",
        "required": false,
        "enumValues": [
          "search",
          "concepts",
          "topics",
          "keywords",
          "owners",
          "sort"
        ],
        "titles": {
          "en": "Filtres à afficher"
        },
        "enumTitles": {
          "search": {
            "en": "Barre de recherche"
          },
          "concepts": {
            "en": "Filtres par concepts"
          },
          "topics": {
            "en": "Filtres par thématiques"
          },
          "keywords": {
            "en": "Filtres par mots-clés"
          },
          "owners": {
            "en": "Filtres par propriétaires"
          },
          "sort": {
            "en": "Tri"
          }
        }
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
        "default": "top",
        "titles": {
          "en": "Position des filtres"
        },
        "enumTitles": {
          "top": {
            "en": "Au dessus des résultats"
          },
          "left": {
            "en": "À gauche des résultats"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "center",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "left": {
            "en": "Gauche"
          },
          "center": {
            "en": "Centré"
          },
          "right": {
            "en": "Droite"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Position"
        },
        "enumTitles": {
          "none": {
            "en": "Scroll infini"
          },
          "before": {
            "en": "Avant les résultats"
          },
          "after": {
            "en": "Après les résultats"
          },
          "both": {
            "en": "Les deux"
          }
        }
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer les filtres avancés"
        }
      },
      {
        "name": "showApiButton",
        "jsonPath": [
          "showApiButton"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le bouton d'accès à la documentation API"
        }
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher le tri à droite du nombre de résultats."
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Datasets catalog",
      "fr": "Catalogue de données"
    }
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
        "default": "lastUpdated",
        "titles": {
          "en": "Type de liste"
        },
        "enumTitles": {
          "lastUpdated": {
            "en": "Last updated",
            "fr": "Les derniers modifiés"
          },
          "lastCreated": {
            "en": "Last created",
            "fr": "Les derniers créés"
          },
          "custom": {
            "en": "Custom list",
            "fr": "Liste libre"
          }
        }
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre de jeux de données"
        }
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre de colonnes"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        "default": "bottom",
        "titles": {
          "en": "Position des boutons d'actions sur la carte"
        },
        "enumTitles": {
          "right": {
            "en": "À droite"
          },
          "bottom": {
            "en": "En bas"
          },
          "none": {
            "en": "Aucun"
          }
        }
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
        "default": "full",
        "titles": {
          "en": "Style des boutons d'actions"
        },
        "enumTitles": {
          "icon": {
            "en": "Icône seulement"
          },
          "full": {
            "en": "Icône et texte"
          },
          "text": {
            "en": "Texte seulement"
          }
        }
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
        ],
        "titles": {
          "en": "Élévation de la carte",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.keywords.show",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les mots-clés"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
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
        ],
        "titles": {
          "en": "Arrondi de la carte",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le propriétaire"
        }
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le résumé"
        }
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
        "default": true,
        "titles": {
          "en": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "À gauche"
          },
          "top": {
            "en": "En haut"
          },
          "center": {
            "en": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'image"
        }
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
        "default": false,
        "titles": {
          "en": "Utiliser l'image de la première visualisation"
        }
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
        "default": false,
        "titles": {
          "en": "Utiliser l'image de la première thématique"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de l'icône",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les thématiques"
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Datasets list",
      "fr": "Liste de jeux de données"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        "default": "bottom",
        "titles": {
          "en": "Position des boutons d'actions sur la carte"
        },
        "enumTitles": {
          "right": {
            "en": "À droite"
          },
          "bottom": {
            "en": "En bas"
          },
          "none": {
            "en": "Aucun"
          }
        }
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
        "default": "full",
        "titles": {
          "en": "Style des boutons d'actions"
        },
        "enumTitles": {
          "icon": {
            "en": "Icône seulement"
          },
          "full": {
            "en": "Icône et texte"
          },
          "text": {
            "en": "Texte seulement"
          }
        }
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
        ],
        "titles": {
          "en": "Élévation de la carte",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          },
          "info": {
            "en": "Info",
            "fr": "Information"
          },
          "success": {
            "en": "Success",
            "fr": "Succès"
          },
          "error": {
            "en": "Error",
            "fr": "Erreur"
          },
          "warning": {
            "en": "Warning",
            "fr": "Avertissement"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.keywords.show",
        "jsonPath": [
          "cardConfig",
          "keywords",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les mots-clés"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
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
        ],
        "titles": {
          "en": "Arrondi de la carte",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le propriétaire"
        }
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le résumé"
        }
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
        "default": true,
        "titles": {
          "en": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "À gauche"
          },
          "top": {
            "en": "En haut"
          },
          "center": {
            "en": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'image"
        }
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
        "default": false,
        "titles": {
          "en": "Utiliser l'image de la première visualisation"
        }
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
        "default": false,
        "titles": {
          "en": "Utiliser l'image de la première thématique"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de l'icône",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les thématiques"
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Dataset card",
      "fr": "Vignette d'un jeu de données"
    }
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
        "type": "string-array",
        "required": false,
        "titles": {
          "en": "Colonnes visibles par défaut"
        }
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
        ],
        "titles": {
          "en": "Mode d'affichage par défaut"
        },
        "enumTitles": {
          "table": {
            "en": "Table"
          },
          "table-dense": {
            "en": "Table dense"
          },
          "list": {
            "en": "Liste de vignettes"
          }
        }
      },
      {
        "name": "interactions",
        "jsonPath": [
          "interactions"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Autoriser les interactions"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "none",
        "titles": {
          "en": "Synchronisation des paramètres d'URL"
        },
        "enumTitles": {
          "none": {
            "en": "Aucune synchronisation"
          },
          "sandboxed": {
            "en": "Synchronisation cloisonnée"
          },
          "shared-filters": {
            "en": "Synchronisation avec partage des filtres"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Dataset table",
      "fr": "Tableau d'un jeu de données"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Dataset form",
      "fr": "Formulaire d'un jeu de données"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Dataset download",
      "fr": "Téléchargement d'un jeu de données"
    }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
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
        "default": "top",
        "titles": {
          "en": "Position du nombre de résultats"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "top": {
            "en": "Au dessus des filtres"
          },
          "bottom": {
            "en": "Au dessus des résultats"
          }
        }
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
        "default": "createdAt:-1",
        "titles": {
          "en": "Tri par défaut"
        },
        "enumTitles": {
          "createdAt:-1": {
            "en": "Date de création (du plus récent au plus ancien)"
          },
          "updatedAt:-1": {
            "en": "Date de mise à jour (du plus récent au plus ancien)"
          },
          "title:1": {
            "en": "Ordre alphabétique (A à Z)"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string-array",
        "required": false,
        "enumValues": [
          "search",
          "base-application",
          "topics",
          "owners",
          "sort"
        ],
        "titles": {
          "en": "Filtres à afficher"
        },
        "enumTitles": {
          "search": {
            "en": "Barre de recherche"
          },
          "base-application": {
            "en": "Filtres par applications"
          },
          "topics": {
            "en": "Filtres par thématiques"
          },
          "owners": {
            "en": "Filtres par propriétaires"
          },
          "sort": {
            "en": "Tri"
          }
        }
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
        "default": "top",
        "titles": {
          "en": "Position des filtres"
        },
        "enumTitles": {
          "top": {
            "en": "Au dessus des résultats"
          },
          "left": {
            "en": "À gauche des résultats"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "center",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "left": {
            "en": "Gauche"
          },
          "center": {
            "en": "Centré"
          },
          "right": {
            "en": "Droite"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Position"
        },
        "enumTitles": {
          "none": {
            "en": "Scroll infini"
          },
          "before": {
            "en": "Avant les résultats"
          },
          "after": {
            "en": "Après les résultats"
          },
          "both": {
            "en": "Les deux"
          }
        }
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer les filtres avancés"
        }
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher le tri à droite du nombre de résultats."
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Applications catalog",
      "fr": "Catalogue de visualisations"
    }
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
        "default": "lastUpdated",
        "titles": {
          "en": "Type de liste"
        },
        "enumTitles": {
          "lastUpdated": {
            "en": "Last updated",
            "fr": "Les derniers modifiés"
          },
          "lastCreated": {
            "en": "Last created",
            "fr": "Les derniers créés"
          },
          "custom": {
            "en": "Custom list",
            "fr": "Liste libre"
          }
        }
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre de visualisations"
        }
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre de colonnes"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        "default": "bottom",
        "titles": {
          "en": "Position des boutons d'actions sur la carte"
        },
        "enumTitles": {
          "right": {
            "en": "À droite"
          },
          "bottom": {
            "en": "En bas"
          },
          "none": {
            "en": "Aucun"
          }
        }
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
        "default": "full",
        "titles": {
          "en": "Style des boutons d'actions"
        },
        "enumTitles": {
          "icon": {
            "en": "Icône seulement"
          },
          "full": {
            "en": "Icône et texte"
          },
          "text": {
            "en": "Texte seulement"
          }
        }
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
        ],
        "titles": {
          "en": "Élévation de la carte",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Arrondi de la carte",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDepartment",
        "jsonPath": [
          "cardConfig",
          "showDepartment"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le propriétaire"
        }
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Afficher le résumé"
        }
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
        "default": true,
        "titles": {
          "en": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "À gauche"
          },
          "top": {
            "en": "En haut"
          },
          "center": {
            "en": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'image"
        }
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
        "default": false,
        "titles": {
          "en": "Utiliser l'image de la première thématique"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
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
        ],
        "titles": {
          "en": "Color",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
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
        ],
        "titles": {
          "en": "Elevation",
          "fr": "Élévation"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Couleur de l'icône",
          "fr": "Couleur"
        },
        "enumTitles": {
          "default": {
            "en": "Default topic color",
            "fr": "Couleur de la thématique"
          },
          "primary": {
            "en": "Primary",
            "fr": "Primaire"
          },
          "secondary": {
            "en": "Secondary",
            "fr": "Secondaire"
          },
          "accent": {
            "en": "Accent",
            "fr": "Accentuée"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.topics.show",
        "jsonPath": [
          "cardConfig",
          "topics",
          "show"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher les thématiques"
        }
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
        "default": true,
        "titles": {
          "en": "Afficher l'icône"
        }
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
        ],
        "titles": {
          "en": "Variant",
          "fr": "Variante"
        },
        "enumTitles": {
          "default": {
            "en": "Default",
            "fr": "Avec fond coloré"
          },
          "outlined": {
            "en": "Outlined",
            "fr": "Avec bordure"
          },
          "tonal": {
            "en": "Tonal",
            "fr": "Tonale"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Applications list",
      "fr": "Liste de visualisations"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "none",
        "titles": {
          "en": "Synchronisation des paramètres d'URL"
        },
        "enumTitles": {
          "none": {
            "en": "Aucune synchronisation"
          },
          "sandboxed": {
            "en": "Synchronisation cloisonnée"
          },
          "shared-filters": {
            "en": "Synchronisation avec partage des filtres"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Application",
      "fr": "Visualisation"
    }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
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
        "default": "top",
        "titles": {
          "en": "Position du nombre de résultats"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "top": {
            "en": "Au dessus des filtres"
          },
          "bottom": {
            "en": "Au dessus des résultats"
          }
        }
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
        "default": "updatedAt:-1",
        "titles": {
          "en": "Tri par défaut"
        },
        "enumTitles": {
          "createdAt:-1": {
            "en": "Date de création (du plus récent au plus ancien)"
          },
          "updatedAt:-1": {
            "en": "Date de mise à jour (du plus récent au plus ancien)"
          },
          "title:1": {
            "en": "Ordre alphabétique (A à Z)"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string-array",
        "required": false,
        "enumValues": [
          "search",
          "sort"
        ],
        "titles": {
          "en": "Filtres à afficher"
        },
        "enumTitles": {
          "search": {
            "en": "Barre de recherche"
          },
          "sort": {
            "en": "Tri"
          }
        }
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
        "default": "top",
        "titles": {
          "en": "Position des filtres"
        },
        "enumTitles": {
          "top": {
            "en": "Au dessus des résultats"
          },
          "left": {
            "en": "À gauche des résultats"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "center",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "left": {
            "en": "Gauche"
          },
          "center": {
            "en": "Centré"
          },
          "right": {
            "en": "Droite"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Position"
        },
        "enumTitles": {
          "none": {
            "en": "Scroll infini"
          },
          "before": {
            "en": "Avant les résultats"
          },
          "after": {
            "en": "Après les résultats"
          },
          "both": {
            "en": "Les deux"
          }
        }
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer les filtres avancés"
        }
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher le tri à droite du nombre de résultats."
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Reuses catalog",
      "fr": "Catalogue de réutilisations"
    }
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
        "default": "lastUpdated",
        "titles": {
          "en": "Type de liste"
        },
        "enumTitles": {
          "lastUpdated": {
            "en": "Last updated",
            "fr": "Les derniers modifiés"
          },
          "lastCreated": {
            "en": "Last created",
            "fr": "Les derniers créés"
          },
          "custom": {
            "en": "Custom list",
            "fr": "Liste libre"
          }
        }
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre de réutilisations"
        }
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showAuthor",
        "jsonPath": [
          "cardConfig",
          "showAuthor"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show author",
          "fr": "Afficher l'auteur"
        }
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show summary on card",
          "fr": "Afficher le résumé"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Reuses list",
      "fr": "Liste de réutilisations"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showAuthor",
        "jsonPath": [
          "cardConfig",
          "showAuthor"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show author",
          "fr": "Afficher l'auteur"
        }
      },
      {
        "name": "cardConfig.showSummary",
        "jsonPath": [
          "cardConfig",
          "showSummary"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show summary on card",
          "fr": "Afficher le résumé"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Reuse card",
      "fr": "Vignette de réutilisation"
    }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
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
        "default": "top",
        "titles": {
          "en": "Position du nombre de résultats"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "top": {
            "en": "Au dessus des filtres"
          },
          "bottom": {
            "en": "Au dessus des résultats"
          }
        }
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
        "default": "startDate:1",
        "titles": {
          "en": "Tri par défaut"
        },
        "enumTitles": {
          "startDate:1": {
            "en": "Date de début (du plus ancien au plus récent)"
          },
          "title:1": {
            "en": "Ordre alphabétique (A à Z)"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string-array",
        "required": false,
        "enumValues": [
          "search",
          "include-past",
          "sort"
        ],
        "titles": {
          "en": "Filtres à afficher"
        },
        "enumTitles": {
          "search": {
            "en": "Barre de recherche"
          },
          "include-past": {
            "en": "Inclure les événements passés"
          },
          "sort": {
            "en": "Tri"
          }
        }
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
        "default": "top",
        "titles": {
          "en": "Position des filtres"
        },
        "enumTitles": {
          "top": {
            "en": "Au dessus des résultats"
          },
          "left": {
            "en": "À gauche des résultats"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "includePast",
        "jsonPath": [
          "includePast"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Inclure les évènements passés"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "center",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "left": {
            "en": "Gauche"
          },
          "center": {
            "en": "Centré"
          },
          "right": {
            "en": "Droite"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Position"
        },
        "enumTitles": {
          "none": {
            "en": "Scroll infini"
          },
          "before": {
            "en": "Avant les résultats"
          },
          "after": {
            "en": "Après les résultats"
          },
          "both": {
            "en": "Les deux"
          }
        }
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer les filtres avancés"
        }
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher le tri à droite du nombre de résultats."
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Events catalog",
      "fr": "Catalogue d'événements"
    }
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
        "default": "upcoming",
        "titles": {
          "en": "Type de liste"
        },
        "enumTitles": {
          "upcoming": {
            "en": "Upcoming",
            "fr": "Les prochains événements"
          },
          "custom": {
            "en": "Custom list",
            "fr": "Liste libre"
          }
        }
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre d'événements"
        }
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show description on card",
          "fr": "Afficher la description"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Events list",
      "fr": "Liste d'événements"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show description on card",
          "fr": "Afficher la description"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "Event card",
      "fr": "Vignette d'événement"
    }
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
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
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
        "default": "top",
        "titles": {
          "en": "Position du nombre de résultats"
        },
        "enumTitles": {
          "none": {
            "en": "Aucun"
          },
          "top": {
            "en": "Au dessus des filtres"
          },
          "bottom": {
            "en": "Au dessus des résultats"
          }
        }
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
        "default": "date:-1",
        "titles": {
          "en": "Tri par défaut"
        },
        "enumTitles": {
          "date:-1": {
            "en": "Date (du plus récent au plus ancien)"
          },
          "date:1": {
            "en": "Date (du plus ancien au plus récent)"
          },
          "title:1": {
            "en": "Ordre alphabétique (A à Z)"
          }
        }
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
        ],
        "titles": {
          "en": "Density",
          "fr": "Densité"
        },
        "enumTitles": {
          "default": {
            "en": "Normal",
            "fr": "Normale"
          },
          "comfortable": {
            "en": "Comfortable",
            "fr": "Confortable"
          },
          "compact": {
            "en": "Compact",
            "fr": "Compacte"
          }
        }
      },
      {
        "name": "filters.items",
        "jsonPath": [
          "filters",
          "items"
        ],
        "type": "string-array",
        "required": false,
        "enumValues": [
          "search",
          "sort"
        ],
        "titles": {
          "en": "Filtres à afficher"
        },
        "enumTitles": {
          "search": {
            "en": "Barre de recherche"
          },
          "sort": {
            "en": "Tri"
          }
        }
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
        "default": "top",
        "titles": {
          "en": "Position des filtres"
        },
        "enumTitles": {
          "top": {
            "en": "Au dessus des résultats"
          },
          "left": {
            "en": "À gauche des résultats"
          }
        }
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
        ],
        "titles": {
          "en": "Rounded",
          "fr": "Arrondi"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
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
        "default": "center",
        "titles": {
          "en": "Alignement"
        },
        "enumTitles": {
          "left": {
            "en": "Gauche"
          },
          "center": {
            "en": "Centré"
          },
          "right": {
            "en": "Droite"
          }
        }
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
        "default": "none",
        "titles": {
          "en": "Position"
        },
        "enumTitles": {
          "none": {
            "en": "Scroll infini"
          },
          "before": {
            "en": "Avant les résultats"
          },
          "after": {
            "en": "Après les résultats"
          },
          "both": {
            "en": "Les deux"
          }
        }
      },
      {
        "name": "showAdvancedFilters",
        "jsonPath": [
          "showAdvancedFilters"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Activer les filtres avancés"
        }
      },
      {
        "name": "showSortBesideCount",
        "jsonPath": [
          "showSortBesideCount"
        ],
        "type": "boolean",
        "required": false,
        "titles": {
          "en": "Afficher le tri à droite du nombre de résultats."
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "News catalog",
      "fr": "Catalogue d'actualités"
    }
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
        "default": "upcoming",
        "titles": {
          "en": "Type de liste"
        },
        "enumTitles": {
          "upcoming": {
            "en": "Upcoming",
            "fr": "À venir"
          },
          "custom": {
            "en": "Custom list",
            "fr": "Liste libre"
          }
        }
      },
      {
        "name": "limit",
        "jsonPath": [
          "limit"
        ],
        "type": "integer",
        "required": true,
        "default": 3,
        "titles": {
          "en": "Nombre d'actualités"
        }
      },
      {
        "name": "columns",
        "jsonPath": [
          "columns"
        ],
        "type": "integer",
        "required": true,
        "default": 2,
        "titles": {
          "en": "Nombre de colonnes"
        }
      },
      {
        "name": "mb",
        "jsonPath": [
          "mb"
        ],
        "type": "integer",
        "required": false,
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show description on card",
          "fr": "Afficher la description"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "News list",
      "fr": "Liste d'actualités"
    }
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
        "default": 0,
        "titles": {
          "en": "Espacement inférieur"
        }
      },
      {
        "name": "usePortalConfig",
        "jsonPath": [
          "usePortalConfig"
        ],
        "type": "boolean",
        "required": true,
        "default": true,
        "titles": {
          "en": "Utiliser la configuration du portail"
        }
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
        ],
        "titles": {
          "en": "Card elevation",
          "fr": "Élévation de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucune"
          },
          "1": {
            "en": "Light",
            "fr": "Légère"
          },
          "2": {
            "en": "Moderate",
            "fr": "Modérée"
          },
          "3": {
            "en": "Strong",
            "fr": "Forte"
          }
        }
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
        ],
        "titles": {
          "en": "Card rounded corners",
          "fr": "Arrondi de la carte"
        },
        "enumTitles": {
          "0": {
            "en": "None",
            "fr": "Aucun"
          },
          "default": {
            "en": "Normal",
            "fr": "Normal"
          },
          "lg": {
            "en": "Medium",
            "fr": "Moyen"
          },
          "xl": {
            "en": "Large",
            "fr": "Grand"
          }
        }
      },
      {
        "name": "cardConfig.showDescription",
        "jsonPath": [
          "cardConfig",
          "showDescription"
        ],
        "type": "boolean",
        "required": false,
        "default": true,
        "titles": {
          "en": "Show description on card",
          "fr": "Afficher la description"
        }
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
        "default": true,
        "titles": {
          "en": "Crop image for uniform appearance",
          "fr": "Recadrer l'image pour un rendu uniforme"
        }
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
        "default": "center",
        "titles": {
          "en": "Image position on card",
          "fr": "Position de l'image sur la carte"
        },
        "enumTitles": {
          "left": {
            "en": "Left",
            "fr": "À gauche"
          },
          "top": {
            "en": "Top",
            "fr": "En haut"
          },
          "center": {
            "en": "Below title",
            "fr": "Sous le titre"
          }
        }
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
        "default": true,
        "titles": {
          "en": "Show image",
          "fr": "Afficher l'image"
        }
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
        "default": 2,
        "titles": {
          "en": "Nombre de lignes pour le titre"
        },
        "enumTitles": {
          "0": {
            "en": "Sans limite de lignes"
          },
          "1": {
            "en": "1 ligne"
          },
          "2": {
            "en": "2 lignes"
          }
        }
      }
    ],
    "hiddenProperties": [],
    "titles": {
      "en": "News card",
      "fr": "Vignette d'actualité"
    }
  }
}
