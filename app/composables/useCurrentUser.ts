import type { UserProfile } from '~/types/user'

const STORAGE_KEY = 'fitness:idUser'

/**
 * Shared identity for the active portfolio. The selected profile id is persisted
 * to localStorage so the user stays "signed in" across reloads; the profile
 * object itself is cached in shared state once fetched.
 */
export function useCurrentUser() {
  const idUser = useState<number | null>('current-user-id', () => null)
  const profile = useState<UserProfile | null>('current-user-profile', () => null)

  // Restore the active profile id from localStorage (client only).
  function init() {
    if (import.meta.client && idUser.value === null) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) idUser.value = Number(stored)
    }
  }

  function setUser(user: UserProfile) {
    profile.value = user
    idUser.value = user.id
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, String(user.id))
  }

  function clear() {
    profile.value = null
    idUser.value = null
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  return { idUser, profile, init, setUser, clear }
}
