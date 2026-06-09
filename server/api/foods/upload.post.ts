import { useFileStorage } from '~~/server/utils/storage'

// Upload a food picture to the configured storage bucket and return its
// filename (persisted on the food) plus a public URL (for immediate preview).
// The image bytes never touch the database.
export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find((part) => part.name === 'file' && part.filename)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const contentType = file.type ?? ''
  if (!contentType.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'File must be an image' })
  }

  if (file.data.length > MAX_FOOD_IMAGE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Image must be 1MB or smaller' })
  }

  const storage = useFileStorage()
  const filename = await storage.upload({
    data: file.data,
    contentType,
    originalName: file.filename
  })

  setResponseStatus(event, 201)
  return { filename, url: await storage.getUrl(filename) }
})
