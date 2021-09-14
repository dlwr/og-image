import fetch from "node-fetch";
import path from "path";
import { JSDOM } from "jsdom";
import Fastify from "fastify";
const fastify = Fastify({
  logger: false,
});

fastify.get("/:url", async function (request, reply) {
  const response = await fetch(

  );
  const { document } = new JSDOM(await response.text()).window;
  const jacketUrl = document.querySelector('meta[property="og:image"]').content;
  reply.sent = true;
  reply.raw.end(jacketUrl);
  return Promise.resolve();
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
