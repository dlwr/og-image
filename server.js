import fetch from "node-fetch";
import path from "path";
import { JSDOM } from "jsdom";
import Fastify from "fastify";
const fastify = Fastify({
  logger: false
});

fastify.get("/:url", async function(request, reply) {
  const response = await fetch(decodeURI(request.params.url));
  const { document } = new JSDOM(await response.text()).window;
  const ogImageUrl = document.querySelector('meta[property="og:image"]')
    .content;
  reply.send({ ogImage: ogImageUrl });
});

fastify.get("/image.jpg", async function(request, reply) {
  console.log(request.query);
  console.log(request.query.url);
  const response = await fetch(decodeURI(request.query.url));
  const { document } = new JSDOM(await response.text()).window;
  const ogImageUrl = document.querySelector('meta[property="og:image"]')
    .content;
  console.log(ogImageUrl);
  const imageResponse = await fetch(ogImageUrl);
  const buffer = await imageResponse.buffer();
  reply.type("image/jpeg");
  reply.send(buffer);
});

fastify.get("/", async function(request, reply) {
  reply.send({
    usage:
      "pass encoded url and reply og-image url. example: https://og-image.glitch.me/https%3A%2F%2Fopen.spotify.com%2Falbum%2F063f8Ej8rLVTz9KkjQKEMa"
  });
});

fastify.options("*", async function(request, reply) {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.send(null);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
