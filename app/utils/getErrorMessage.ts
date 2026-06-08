// Derive a human-readable message from an unknown error (typically an ofetch error).
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error && typeof error === 'object') {
    const e = error as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }
    return e.data?.statusMessage || e.data?.message || e.statusMessage || e.message || fallback
  }
  return fallback
}
