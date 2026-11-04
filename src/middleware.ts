import { defineMiddleware } from 'astro:middleware'

// The environment's domains, read from WODBY_HOSTS (a JSON array) when the
// server starts. Undefined outside Wodby, where no domain list is enforced.
const environmentHosts = (() => {
  if (!process.env.WODBY_HOSTS) return undefined
  try {
    const parsed: unknown = JSON.parse(process.env.WODBY_HOSTS)
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((host): host is string => typeof host === 'string').map((host) => host.toLowerCase()))
    }
  } catch {
    // Fall through: a malformed value allows no forwarded host.
  }
  return new Set<string>()
})()

// astro.config.mjs lets Astro take the request's host from X-Forwarded-Host for
// any domain, because the domains are not known when the image is built. A
// client can send that header itself, so a forwarded host that is not one of
// the environment's domains is rejected before a page, endpoint or action can
// build a URL from it. Requests without the header are not affected, and
// prerendered pages have no request headers to check.
export const onRequest = defineMiddleware((context, next) => {
  if (context.isPrerendered) return next()
  const forwardedHost = context.request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (environmentHosts && forwardedHost) {
    const hostname = forwardedHost.replace(/:\d+$/, '').toLowerCase()
    if (!environmentHosts.has(hostname)) {
      return new Response('Unknown forwarded host', { status: 400 })
    }
  }
  return next()
})
