const usage =
  'pass encoded url and return og-image as image/jpeg.\nusage: https://og-image.yuta25.workers.dev/image.jpg?url=https%3A%2F%2Fopen.spotify.com%2Falbum%2F063f8Ej8rLVTz9KkjQKEMa'

const findOgImage = async (url: string) => {
  let ogImage: string | undefined
  const rewriter = new HTMLRewriter().on('meta[property="og:image"]', {
    element(element) {
      ogImage ??= element.getAttribute('content') ?? undefined
    }
  })
  await rewriter.transform(await fetch(url)).arrayBuffer()
  return ogImage
}

const proxyOgImage = async (url: string) => {
  const ogImage = await findOgImage(url)
  if (!ogImage) {
    return Response.json(null)
  }
  const image = await fetch(ogImage)
  return new Response(image.body, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'image/jpeg'
    }
  })
}

export default {
  async fetch(request: Request) {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname === '/image.jpg') {
      if (request.method === 'OPTIONS') {
        return Response.json(null, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        })
      }
      return proxyOgImage(searchParams.get('url') ?? '')
    }

    if (pathname === '/') {
      return new Response(usage)
    }

    const ogImage = await findOgImage(decodeURIComponent(pathname.slice(1)))
    return Response.json({ ogImage })
  }
} satisfies ExportedHandler
