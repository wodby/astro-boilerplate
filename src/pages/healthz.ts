import type { APIRoute } from 'astro'

// Lightweight health endpoint for deployment checks. It touches no external
// services, so it reports whether the server itself answers requests.
export const prerender = false

export const GET: APIRoute = () =>
  new Response('ok', {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  })
