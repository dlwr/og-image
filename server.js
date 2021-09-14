/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/

import fetch from 'node-fetch';
import path from 'path';
import { JSDOM } from 'jsdom';

// Require the fastify framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

fastify.get("/album/:album", async function(request, reply) {
  console.log(request.params.album);
  console.log(`https://open.spotify.com/album/${request.params.album}`);
  const response = await fetch(`https://open.spotify.com/album/${request.params.album}`);
  const { document } = new JSDOM(response.body).window;
  const jacketUrl = document.querySelector('meta[property="og:image"]').content;
  reply.sent = true;
  reply.raw.end(`${request.params.album}`);
  return Promise.resolve();
})

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
