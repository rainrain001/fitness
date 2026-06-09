import type { FileStorage } from './types'
import { SupabaseS3Storage } from './supabase-s3'

export type { FileStorage, UploadInput } from './types'

// The one place that knows which storage implementation is in use. To change
// providers later, construct a different `FileStorage` here — callers depend
// only on the interface and never need to change.
let storage: FileStorage | undefined

export function useFileStorage(): FileStorage {
  if (storage) return storage

  const { supabaseS3 } = useRuntimeConfig()
  if (!supabaseS3?.endpoint || !supabaseS3.accessKeyId || !supabaseS3.secretAccessKey) {
    throw createError({ statusCode: 500, statusMessage: 'File storage is not configured' })
  }

  storage = new SupabaseS3Storage({
    endpoint: supabaseS3.endpoint,
    region: supabaseS3.region,
    accessKeyId: supabaseS3.accessKeyId,
    secretAccessKey: supabaseS3.secretAccessKey,
    path: supabaseS3.foodPath
  })

  return storage
}
