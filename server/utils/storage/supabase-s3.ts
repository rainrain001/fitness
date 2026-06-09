import { randomUUID } from 'node:crypto'
import { AwsClient } from 'aws4fetch'
import type { FileStorage, UploadInput } from './types'

export interface SupabaseS3Config {
  endpoint: string // e.g. https://<ref>.storage.supabase.co/storage/v1/s3
  region: string
  accessKeyId: string
  secretAccessKey: string
  // Bucket + folder the files live under, e.g. "/fitness/foods".
  path: string
}

// Map a few common image types to an extension when the original name has none.
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

// How long a generated display URL stays valid, in seconds.
const SIGNED_URL_TTL = 60 * 60 // 1 hour

// Supabase Storage exposes an S3-compatible API, so any S3 client works. We use
// aws4fetch (a tiny fetch-based Signature V4 signer) to stay dependency-light and
// edge/Nitro friendly. Everything Supabase-specific is contained in this file.
export class SupabaseS3Storage implements FileStorage {
  private readonly client: AwsClient
  private readonly endpoint: string
  private readonly bucket: string
  private readonly prefix: string

  constructor(config: SupabaseS3Config) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      service: 's3'
    })
    this.endpoint = config.endpoint.replace(/\/+$/, '')

    // "/fitness/foods" -> bucket "fitness", key prefix "foods".
    const [bucket, ...rest] = config.path.split('/').filter(Boolean)
    if (!bucket) throw new Error('Supabase S3 path must include a bucket, e.g. "/fitness/foods"')
    this.bucket = bucket
    this.prefix = rest.join('/')
  }

  async upload(input: UploadInput): Promise<string> {
    const filename = this.makeFilename(input)
    const response = await this.client.fetch(this.objectUrl(filename), {
      method: 'PUT',
      headers: { 'Content-Type': input.contentType },
      body: input.data
    })

    if (!response.ok) {
      throw new Error(`Storage upload failed (${response.status}): ${await response.text()}`)
    }

    return filename
  }

  async remove(filename: string): Promise<void> {
    const response = await this.client.fetch(this.objectUrl(filename), { method: 'DELETE' })
    // 204/200 on success, 404 when already gone — both are fine.
    if (!response.ok && response.status !== 404) {
      throw new Error(`Storage delete failed (${response.status}): ${await response.text()}`)
    }
  }

  // Presigned GET URL so private buckets are still viewable in the browser.
  async getUrl(filename: string): Promise<string> {
    const url = `${this.objectUrl(filename)}?X-Amz-Expires=${SIGNED_URL_TTL}`
    const signed = await this.client.sign(url, { aws: { signQuery: true } })
    return signed.url
  }

  // ---- internals -------------------------------------------------------------

  private objectKey(filename: string): string {
    return this.prefix ? `${this.prefix}/${filename}` : filename
  }

  private objectUrl(filename: string): string {
    return `${this.endpoint}/${this.bucket}/${this.objectKey(filename)}`
  }

  private makeFilename(input: UploadInput): string {
    const fromName = input.originalName?.split('.').pop()?.toLowerCase()
    const ext = (fromName && /^[a-z0-9]+$/.test(fromName) ? fromName : EXTENSION_BY_TYPE[input.contentType]) || 'bin'
    return `${randomUUID()}.${ext}`
  }
}
