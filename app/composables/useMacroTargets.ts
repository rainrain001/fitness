import type { MacroTargets } from '~/types/user'

/**
 * A user's expected macronutrient targets. Shared between the profile page
 * (where they're set) and the plan dialog (where a plan is compared against
 * them). The fetched row is cached in shared state so both surfaces agree.
 */
export function useMacroTargets() {
  const http = useHttpRequest()
  const { idUser } = useCurrentUser()
  const targets = useState<MacroTargets | null>('macro-targets', () => null)

  // Load the targets once; pass `force` to refetch after a save.
  async function fetchTargets(force = false) {
    if (idUser.value == null) return null
    if (targets.value && !force) return targets.value
    targets.value = await http.request<MacroTargets | null>(`/targets?idUser=${idUser.value}`)
    return targets.value
  }

  async function saveTargets(macros: Omit<MacroTargets, 'id' | 'idUser' | 'createdAt' | 'updatedAt'>, id = idUser.value) {
    if (id == null) return null
    targets.value = await http.addOrUpdate<MacroTargets>('/targets', 'PUT', { body: { idUser: id, ...macros } })
    return targets.value
  }

  return { targets, fetchTargets, saveTargets }
}
