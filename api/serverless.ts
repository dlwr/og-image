import Fastify from 'fastify'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const app = Fastify({
  logger: true
})

app.register(import('../app.js'), {
  prefix: '/'
})

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready()
  app.server.emit('request', req, res)
}
