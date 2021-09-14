import fetch from "node-fetch";
import path from "path";
import { JSDOM } from "jsdom";
import Fastify from "fastify";
const fastify = Fastify({
  logger: false,
});

fastify.get("/:url", async function (request, reply) {
  const response = await fetch(
    decodeURI(request.params.url)
  );
  const { document } = new JSDOM(await response.text()).window;
  const ogImageUrl = document.querySelector('meta[property="og:image"]').content;
  reply.send({ogImage: ogImageUrl})
});

fastify.get("/", async function (request, reply) {
  reply.send({usage: "pass encoded url and reply og-image url\neg: og-image.glitch.me//https%3A%2F%2Fopen.spotify.com%2Falbum%2F063f8Ej8rLVTz9KkjQKEMa"});
});


// Run the server and report out to the logs
fastify.listen(process.env.PORT, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
