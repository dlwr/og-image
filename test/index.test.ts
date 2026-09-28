import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'
import { network } from './network'

const pageUrl = 'https://example.com/album/1'
const imageUrl = 'https://img.example.com/cover.jpg'

const html = (head: string) =>
  `<!doctype html><html><head>${head}</head><body></body></html>`

const request = (path: string, init?: RequestInit) =>
  worker.fetch(new Request(`https://og-image.test${path}`, init))

const servePage = (head: string) =>
  network.use(
    http.get(pageUrl, () => HttpResponse.html(html(head))),
    http.get(imageUrl, () =>
      HttpResponse.arrayBuffer(new Uint8Array([1, 2, 3]).buffer, {
        headers: { 'Content-Type': 'image/png' }
      })
    )
  )

describe('GET /:url', () => {
  it('returns the og:image url of the encoded page url', async () => {
    servePage(`<meta property="og:image" content="${imageUrl}">`)

    const response = await request(`/${encodeURIComponent(pageUrl)}`)

    expect(await response.json()).toEqual({ ogImage: imageUrl })
  })

  it('returns the first og:image when several exist', async () => {
    servePage(
      `<meta property="og:image" content="${imageUrl}"><meta property="og:image" content="https://img.example.com/other.jpg">`
    )

    const response = await request(`/${encodeURIComponent(pageUrl)}`)

    expect(await response.json()).toEqual({ ogImage: imageUrl })
  })

  it('omits ogImage when the page has no og:image', async () => {
    servePage('<title>no image</title>')

    const response = await request(`/${encodeURIComponent(pageUrl)}`)

    expect(await response.json()).toEqual({})
  })
})

describe('GET /image.jpg', () => {
  it('proxies the og:image body', async () => {
    servePage(`<meta property="og:image" content="${imageUrl}">`)

    const response = await request(
      `/image.jpg?url=${encodeURIComponent(pageUrl)}`
    )

    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3])
    )
  })

  it('responds as image/jpeg', async () => {
    servePage(`<meta property="og:image" content="${imageUrl}">`)

    const response = await request(
      `/image.jpg?url=${encodeURIComponent(pageUrl)}`
    )
    await response.arrayBuffer()

    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
  })

  it('allows any origin', async () => {
    servePage(`<meta property="og:image" content="${imageUrl}">`)

    const response = await request(
      `/image.jpg?url=${encodeURIComponent(pageUrl)}`
    )
    await response.arrayBuffer()

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('returns null when the page has no og:image', async () => {
    servePage('<title>no image</title>')

    const response = await request(
      `/image.jpg?url=${encodeURIComponent(pageUrl)}`
    )

    expect(await response.text()).toBe('null')
  })
})

describe('OPTIONS /image.jpg', () => {
  it('allows any origin', async () => {
    const response = await request('/image.jpg', { method: 'OPTIONS' })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe('GET /', () => {
  it('shows usage', async () => {
    const response = await request('/')

    expect(await response.text()).toMatch(/^pass encoded url/)
  })
})
