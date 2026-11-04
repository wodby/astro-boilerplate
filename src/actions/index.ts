import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  // Called by the form on the home page. Form submissions to pages rendered on
  // demand are checked against the page's origin (security.checkOrigin).
  greet: defineAction({
    accept: 'form',
    input: z.object({ name: z.string().trim().min(1).max(100) }),
    handler: ({ name }) => `Hello, ${name}!`,
  }),
}
