import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default function (fastify, options, done) {
  fastify.get("/:url", async function (request, reply) {
    const response = await fetch(decodeURI(request.params.url));
    const { document } = new JSDOM(await response.text()).window;
    const ogImageUrl = document.querySelector(
      'meta[property="og:image"]'
    ).content;
    reply.send({ ogImage: ogImageUrl });
  });

  fastify.get("/image.jpg", async function (request, reply) {
    const response = await fetch(decodeURI(request.query.url));
    const { document } = new JSDOM(await response.text()).window;
    const ogImageUrl = document.querySelector(
      'meta[property="og:image"]'
    ).content;
    const imageResponse = await fetch(ogImageUrl);
    const buffer = await imageResponse.buffer();
    reply.header("Access-Control-Allow-Origin", "*");
    reply.type("image/jpeg");
    reply.send(buffer);
  });

  fastify.options("/image.jpg", async function (request, reply) {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.send(null);
  });

  fastify.get("/", async function (request, reply) {
    reply.send(
      "pass encoded url and return og-image as image/jpeg.\nusage: https://og-image-dlwr.vercel.app/image.jpg?url=https%3A%2F%2Fopen.spotify.com%2Falbum%2F063f8Ej8rLVTz9KkjQKEMa"
    );
  });

  done();
}
