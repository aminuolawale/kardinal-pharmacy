import { readImage } from '@/lib/uploads'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[\w-]+$/.test(id)) return new Response('Not found', { status: 404 })

  const image = await readImage(id)
  if (!image) return new Response('Not found', { status: 404 })

  return new Response(new Uint8Array(image.data), {
    headers: {
      'Content-Type': image.contentType,
      // ids are unique per upload, so the content never changes
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
