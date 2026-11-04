// @ts-check
import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

// Host names the development server answers for. Wodby sets WODBY_HOSTS to a
// JSON array of the environment's domains and WODBY_APP_SERVICE_NAME to the
// internal service name. Vite always allows localhost and IP addresses.
function allowedHosts() {
  /** @type {string[]} */
  const hosts = []
  try {
    const parsed = JSON.parse(process.env.WODBY_HOSTS || '[]')
    if (Array.isArray(parsed)) {
      hosts.push(...parsed.filter((host) => typeof host === 'string'))
    }
  } catch {
    console.warn('WODBY_HOSTS is not a JSON array; ignoring it')
  }
  if (process.env.WODBY_APP_SERVICE_NAME) {
    hosts.push(process.env.WODBY_APP_SERVICE_NAME)
  }
  return hosts
}

export default defineConfig({
  // The standalone server serves the built assets from dist/client and renders
  // pages on demand. It listens on the HOST and PORT variables.
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 3000,
    allowedHosts: allowedHosts(),
  },
  security: {
    // The gateway terminates TLS and passes the original Host header with
    // X-Forwarded-Proto. Astro trusts both only for the domains listed here,
    // and the image is built before the environment's domains are known, so
    // every domain is accepted. src/middleware.ts then rejects an
    // X-Forwarded-Host that is not one of the environment's domains at runtime.
    // With this, Astro.url is https://<domain>/..., and the origin check of
    // form submissions (security.checkOrigin, on by default) compares against it.
    allowedDomains: [{}],
  },
})
