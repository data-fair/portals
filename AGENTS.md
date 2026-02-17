# AGENTS.md

Project-specific instructions for AI agents working with this codebase.

## Project Overview

**@data-fair/portals** is a Portals manager for [Data FAIR](https://github.com/data-fair/data-fair). It provides a web interface for managing data portals, including user authentication, page management, image handling, and reusables.

## Tech Stack

- **Runtime**: Node.js v24
- **API**: Express 5 with TypeScript
- **UI**: Vue 3 + Vuetify + Vite
- **Portal**: Nuxt 4 + Vue 3 + Vuetify
- **Database**: MongoDB
- **Search**: Elasticsearch
- **Package Manager**: npm workspaces

## Project Structure

```
.
├── api/                  # Express API (TypeScript)
│   ├── src/
│   │   ├── admin/        # Admin endpoints
│   │   ├── groups/       # Groups management
│   │   ├── identities/   # User identities/auth
│   │   ├── images/       # Image processing
│   │   ├── pages/        # Page management
│   │   ├── portals/      # Portal management
│   │   ├── reuses/       # Reusables handling
│   │   └── search-page-indexes/  # Search indexing
│   └── config/           # Configuration files
├── ui/                   # Vue 3 admin UI (Vite)
├── portal/               # Nuxt 4 portal frontend
├── shared/markdown/      # Shared markdown utilities
├── dev/                  # Development scripts
└── test-it/              # Integration tests
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev-deps` | Start Docker dev dependencies |
| `npm run dev-api` | Start API in development mode |
| `npm run dev-ui` | Start admin UI dev server |
| `npm run dev-portal` | Start portal dev server |
| `npm run dev-zellij` | Start all services in Zellij |
| `npm run build-types` | Build types from schemas |
| `npm run lint` | Run ESLint |
| `npm run test` | Run integration tests |
| `npm run check-types` | Run TypeScript type checking |

## Development

### Quick Start

```sh
npm install
npm run dev-zellij
```

This starts 4 panes: dev dependencies, API, UI, and Portal.

### Prerequisites

- Node.js v24+
- Docker for MongoDB and Elasticsearch

### Running Tests

```sh
npm run dev-deps    # Start test dependencies
npm run test       # Run all tests
npm run test-only test-it/specific-test.ts  # Run specific test
```

## Key Conventions

- **ESLint**: Uses neostandard with Vue plugin
- **TypeScript**: Strict mode enabled
- **Imports**: Path aliases defined in package.json (`#config`, `#mongo`, `#es`, `#doc`, `#types`)
- **Testing**: Node.js native test runner (`node:test`)
- **Linting**: ESLint 9 with flat config (`eslint.config.mjs`)

## Dependencies

Key external packages:
- `@data-fair/lib-express`, `@data-fair/lib-node`, `@data-fair/lib-vue` - Data Fair libraries
- `@koumoul/vjsf` - Vue JSON Schema Form
- `mongodb`, `@elastic/elasticsearch` - Database
- `express`, `vue`, `nuxt`, `vuetify` - Frameworks
