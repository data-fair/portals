# AGENTS.md

## Useful script

```sh
npm run build-types    # build types from schemas
npm run lint       # Run eslint
npm run check-types  # Check typescript types
```

### Running Tests

```sh
npm run test-deps    # Start test dependencies
npm run test       # Run all tests
npm run test-base test-it/specific-test.ts  # Run specific test
```

### Test and dev environment

The environment allows for integration testing thanks to docker containers (see docker-compose.yml).
Random ports are allocated and defined in `.env`.
A nginx proxy is part of the containers and exposes all services, including the development API server (configured in dev/resources/nginx.conf.template).
Test users are defined in dev/resources/users.json