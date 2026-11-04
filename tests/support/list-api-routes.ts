// Prints, as JSON, every route of the manager api with the scope guards of its handlers.
// Run in its own node process (the api modules need the config): see scopes-coverage.unit.spec.ts
import { app } from '../../api/src/app.ts'
import { apiRouters } from '../../api/src/routers.ts'
import testEnvRouter from '../../api/src/test-env.ts'
import { scopeGuardOf } from '../../api/src/scopes.ts'

const mounts = new Map<unknown, string>(Object.entries(apiRouters).map(([path, router]) => [router, path]))
mounts.set(testEnvRouter, '/test-env')

// express '/:id/data/:filename' -> OpenAPI '/{id}/data/{filename}', relative to /api, no trailing slash
const openapiPath = (path: string) => path.replace(/:(\w+)/g, '{$1}').replace(/(.)\/$/, '$1')

const routes: { method: string, path: string, guards: string[], lastIsGuard: boolean }[] = []
const errors: string[] = []
const addRoutes = (stack: any[], prefix: string) => {
  for (const layer of stack) {
    if (layer.route) {
      const handlers = layer.route.stack.map((l: any) => l.handle)
      const guards = handlers.map(scopeGuardOf).filter(Boolean)
      for (const method of Object.keys(layer.route.methods)) {
        routes.push({ method, path: openapiPath(prefix + layer.route.path), guards, lastIsGuard: !!scopeGuardOf(handlers[handlers.length - 1]) })
      }
    } else if (layer.handle?.stack) {
      const mount = mounts.get(layer.handle)
      if (mount === undefined) errors.push(`router mounted without a known path (${layer.name})`)
      else addRoutes(layer.handle.stack, mount)
    }
  }
}
// app level routes are declared with their /api prefix
addRoutes((app as any).router.stack.filter((l: any) => !l.route || l.route.path.startsWith('/api/')), '')
for (const route of routes) {
  if (route.path.startsWith('/api/')) route.path = route.path.slice(4)
}
console.log(JSON.stringify({ routes, errors }))
process.exit(0)
