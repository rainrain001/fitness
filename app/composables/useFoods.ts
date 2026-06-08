import type { Food } from '~/types/food'

/**
 * Food library API: retrieve the active user's saved foods.
 * Shared by the foods page and the plan dialog. Mirrors the backend `foods` module.
 */
export function useFoods() {
  const http = useHttpRequest()
  const { idUser } = useCurrentUser()

  const {
    execute: fetchFoods,
    refresh,
    data: foods,
    status,
    error
  } = http.get<Food[]>(() => `/foods?idUser=${idUser.value}`, {
    key: 'foods',
    immediate: false,
    default: () => []
  })

  return { fetchFoods, refresh, foods, status, error }
}
