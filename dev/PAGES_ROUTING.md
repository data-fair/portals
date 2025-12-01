# Page Routing Architecture

This document describes the complete architecture of the portal's page system.

## Page Types

The system currently supports 6 page types:

1. **home** - Home page (unique per portal)
2. **contact** - Contact page (unique per portal)
3. **privacy-policy** - Privacy policy page (unique per portal)
4. **datasets** - Datasets Catalog page (unique per portal)
5. **event** - Event pages (multiple, with unique slug)
6. **news** - News pages (multiple, with unique slug)
7. **generic** - Generic pages (multiple, with or without group, with unique slug regardless of group)

### Organization in the Portals-Manager UI

In the portals-manager UI, page types are organized into groups (UI concept only):

- **'standard' Group**: Contains standard pages `home`, `contact` and `privacy-policy`
- **'default' Group**: Contains `generic` type pages that have no assigned group

## Portal Frontend Routes

### Unique Pages

- `/` → `home` type page
- `/contact` → `contact` type page
- `/privacy-policy` → `privacy-policy` type page
- `/datasets` → `datasets` type page

### Multiple Pages - Events

- `/event` → List of `event` type pages
- `/event/[slug]` → Detail of an `event` type page

### Multiple Pages - News

- `/news` → List of `news` type pages
- `/news/[slug]` → Detail of a `news` type page

### Generic Pages

- `/pages/[slug]` → `generic` type pages **without group**
- `/pages-[groupSlug]/[slug]` → `generic` type pages **with group**

## Portal Backend Routes

### File Structure

```text
portal/server/routes/portal/api/pages/
├── [type]/
│   ├── index.get.ts              ← List (event/news only)
│   └── [slug]/
│       ├── index.get.ts          ← Specific page (all types)
│       └── images/
│           └── [id].get.ts       ← Images (all types)
```

### Unique Pattern

All pages use **the same pattern**: `/portal/api/pages/[type]/[slug]`
For unique pages (home, contact, privacy-policy, datasets), the `slug` is repeated and identical to the `type`.

```text
/portal/api/pages/[type]          → Retrieves a list of pages (event/news only)
/portal/api/pages/[type]/[slug]   → Retrieves a specific page
/portal/api/pages/[type]/[slug]/images/[id] → Retrieves an image from this page
/portal/api/images                → Retrieves a portal image
/portal/api/portal                → Retrieves portal information
```

### 1. Route `/portal/api/pages/[type]` - GET

This route **lists only** pages of type `event` or `news`.

**Query Parameters:**

- `limit` (optional): Number of results (1-100, default: 10)
- `skip` (optional): Number of results to skip for pagination (default: 0)
- `sort` (optional): `"asc"` or `"desc"` (default: desc, by update date)
- `group` (optional): Group slug for filtering

### 2. Route `/portal/api/pages/[type]/[slug]` - GET

Retrieves the configuration of a specific page.

**Examples:**

**Unique pages** (slug = type):

- `GET /portal/api/pages/home/home` → Home page
- `GET /portal/api/pages/contact/contact` → Contact page
- `GET /portal/api/pages/privacy-policy/privacy-policy` → Privacy policy page
- `GET /portal/api/pages/datasets/datasets` → Datasets Catalog page

**Event/news pages**:

- `GET /portal/api/pages/event/mon-evenement` → Event page with slug "mon-evenement"
- `GET /portal/api/pages/news/actualite-2024` → News page with slug "actualite-2024"

**Generic pages**:

- `GET /portal/api/pages/generic/ma-page` → Generic page with or without group, as the slug is unique regardless of group
