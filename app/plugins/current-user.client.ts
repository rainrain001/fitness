import type { UserProfile } from '~/types/user'

// Restore the active profile before any page renders, so reads can be scoped to it.
export default defineNuxtPlugin(async () => {
  const { idUser, profile, setUser, clear, init } = useCurrentUser()
  init()

  if (idUser.value && !profile.value) {
    try {
      const http = useHttpRequest()
      const user = await http.request<UserProfile>(`/users/${idUser.value}`)
      setUser(user)
    } catch {
      // Stored id no longer maps to a profile (e.g. the database was reset).
      clear()
    }
  }
})
