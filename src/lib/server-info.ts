// Server-only data for the home page and the /api/server-info endpoint.
// process.env is read when a request is handled, so it sees the variables of
// the running container, not the ones present when the image was built.
export function getServerInfo() {
  return {
    node: process.version,
    environment: process.env.WODBY_ENV_TYPE || 'local',
    renderedAt: new Date().toISOString(),
  }
}

export type ServerInfo = ReturnType<typeof getServerInfo>
