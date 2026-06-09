import { useFileStorage } from '~~/server/utils/storage'

// The DB stores only a picture's filename. Display URLs are resolved at read
// time so the storage backend/location can change without a data migration.
export async function withPictureUrl<T extends { picture: string | null }>(
  food: T
): Promise<T & { pictureUrl: string | null }> {
  const picture = food.picture
  if (!picture) return { ...food, pictureUrl: null }

  // Legacy rows stored a data URL or absolute URL directly — display as-is.
  if (picture.startsWith('data:') || picture.startsWith('http')) {
    return { ...food, pictureUrl: picture }
  }

  return { ...food, pictureUrl: await useFileStorage().getUrl(picture) }
}
