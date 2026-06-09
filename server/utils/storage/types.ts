// Storage abstraction (Dependency Inversion): the app depends on this interface,
// not on any concrete bucket provider. Swapping Supabase for another backend
// (S3, R2, GCS…) means writing a new implementation of `FileStorage` and wiring
// it up in ./index.ts — no caller changes.
export interface UploadInput {
  // Raw bytes of the file to store.
  data: Buffer | Uint8Array
  // MIME type, e.g. 'image/png'. Used to set the stored object's content type.
  contentType: string
  // Original filename, used only to derive a sensible extension.
  originalName?: string
}

export interface FileStorage {
  // Store a file and return the opaque filename to persist in the database.
  // The returned value is just the filename (no bucket/path), keeping the DB
  // decoupled from where and how the file is actually stored.
  upload(input: UploadInput): Promise<string>

  // Delete a previously stored file by its filename. A missing file is a no-op.
  remove(filename: string): Promise<void>

  // Resolve a stored filename to a temporary, reachable URL for display.
  // Implementations may return a signed (expiring) URL for private buckets.
  getUrl(filename: string): Promise<string>
}
