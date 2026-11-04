# Astro starter for Wodby

A starter for the [Wodby Astro service](https://github.com/wodby/service-astro) and
[Astro stack](https://github.com/wodby/stack-astro).

It includes:

- [Astro](https://astro.build) with the [Node.js adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
  in standalone mode, started with `node ./dist/server/entry.mjs`
- a page rendered on demand that reads server data, an API endpoint the page
  calls from the browser, and a form that submits to an Astro Action
- a lightweight health endpoint at `/healthz`
- Wodby CI build, push, deployment and a post-deployment health check

## Local development

```shell
npm install
npm run dev
```

Open http://localhost:3000. Edit `src/pages/index.astro`; the page updates as
you save. Add a page by creating a file in `src/pages`.

Check types and run the production build locally:

```shell
npm run check
npm run build
HOST=0.0.0.0 PORT=3000 npm run start
```

Pages are prerendered at build time unless they set
`export const prerender = false`, as `src/pages/index.astro`,
`src/pages/api/server-info.ts` and `src/pages/healthz.ts` do. Prerendered pages
and the files in `public/` are served by the same Node.js server.

## On Wodby

The pipeline in `.wodby/pipeline.yml` installs dependencies with `npm ci`, then
the service's image build runs `npm run build`. The container starts with
`npm run start` and listens on port 3000: the service sets `HOST=0.0.0.0` and
`PORT=3000`, which the standalone server reads at startup.

### Environment variables

Runtime variables, including the database, Redis and mail variables of linked
services, are not available during the build. Read them on the server when a
request is handled, in one of two ways:

- `process.env`, as `src/lib/server-info.ts` does.
- [`astro:env`](https://docs.astro.build/en/guides/environment-variables/#type-safe-environment-variables)
  with `context: 'server'` and `access: 'secret'`, for example
  `DB_PASSWORD: envField.string({ context: 'server', access: 'secret' })` in
  `astro.config.mjs` and `import { DB_PASSWORD } from 'astro:env/server'`.

`import.meta.env` and `astro:env` variables with `access: 'public'` are
replaced with their build-time values, so they never see the container's
variables. Only `PUBLIC_` variables reach the browser.

### Domains and form submissions

The gateway terminates TLS and passes the original `Host` header with
`X-Forwarded-Proto: https`. `security.allowedDomains` in `astro.config.mjs` lets
Astro use them, so `Astro.url` is `https://<your domain>/...`. Because the
domains are not known when the image is built, it accepts every domain, and
`src/middleware.ts` rejects a request whose `X-Forwarded-Host` is not one of the
environment's domains from `WODBY_HOSTS`.

Astro rejects form submissions from another origin to pages rendered on demand
(`security.checkOrigin`, on by default). Keep both files when you change the
configuration.

### Sessions

The Node.js adapter stores [sessions](https://docs.astro.build/en/guides/sessions/)
in the container's file system by default. They are lost on every deployment
and are not shared between replicas. Configure a Redis session driver with the
stack's Valkey service before you use `Astro.session`.

## In a development workspace

Wodby starts `astro dev` on `0.0.0.0:3000` with this project's
`astro.config.mjs`. That file adds the environment's host names from
`WODBY_HOSTS` to `server.allowedHosts`; the development server answers only
for the host names it knows. The workspace polls for file changes, so saved
files and new pages are picked up without a restart. `dist/` and `.astro/`
are generated and stay out of Git.
