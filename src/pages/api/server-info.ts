import type { APIRoute } from 'astro'
import { getServerInfo } from '../../lib/server-info'

// Rendered on demand: the response is computed for every request.
export const prerender = false

export const GET: APIRoute = () =>
  Response.json(getServerInfo(), { headers: { 'Cache-Control': 'no-store' } })
