<template>
  <ClientOnly>
    <div class="mx-auto max-w-xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold">{{ isExisting ? 'Your profile' : 'Create your profile' }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          {{
            isExisting ? 'Update your details any time.' : 'Set up a profile to start your own food-tracking portfolio.'
          }}
        </p>
      </div>

      <Card>
        <CardContent class="pt-6">
          <form
            class="grid gap-4"
            @submit.prevent="submit"
          >
            <div class="grid gap-2">
              <Label for="name">Name</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="Your name"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-2">
                <Label for="age">Age</Label>
                <Input
                  id="age"
                  v-model="form.age"
                  type="number"
                  min="0"
                  placeholder="years"
                />
              </div>
              <div class="grid gap-2">
                <Label for="bodyFat">Body fat</Label>
                <Input
                  id="bodyFat"
                  v-model="form.bodyFat"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="%"
                />
              </div>
              <div class="grid gap-2">
                <Label for="height">Height</Label>
                <Input
                  id="height"
                  v-model="form.height"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="cm"
                />
              </div>
              <div class="grid gap-2">
                <Label for="weight">Weight</Label>
                <Input
                  id="weight"
                  v-model="form.weight"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="kg"
                />
              </div>
            </div>

            <div class="grid gap-3 border-t pt-4">
              <div>
                <h2 class="text-sm font-medium">Expected macronutrients</h2>
                <p class="text-muted-foreground text-xs">
                  Your daily targets. Plans you build are compared against these.
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div
                  v-for="field in targetFields"
                  :key="field.key"
                  class="grid gap-1.5"
                >
                  <Label
                    :for="`target-${field.key}`"
                    class="text-xs"
                  >
                    {{ field.label }}
                  </Label>
                  <Input
                    :id="`target-${field.key}`"
                    v-model="targets[field.key]"
                    type="number"
                    min="0"
                    step="any"
                    :placeholder="field.unit"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="saving"
              class="mt-2"
            >
              {{ saving ? 'Saving…' : isExisting ? 'Save changes' : 'Create profile' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { MacroTargets, UserProfile } from '~/types/user'
import { z } from 'zod'

const http = useHttpRequest()
const router = useRouter()
const { notify } = useNotifications()
const { idUser, profile, setUser } = useCurrentUser()
const { fetchTargets, saveTargets } = useMacroTargets()

const saving = ref(false)
const isExisting = computed(() => idUser.value !== null)
const form = reactive({ name: '', age: '', height: '', weight: '', bodyFat: '' })

// Expected daily macronutrients — kept separate from the profile form since they
// live in their own table, saved together for a single "Save" experience.
const targets = reactive({ calories: '', protein: '', carbs: '', fat: '', sugar: '' })

const targetFields = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' }
] as const

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0).max(150).nullable(),
  height: z.number().min(0).max(300).nullable(),
  weight: z.number().min(0).max(700).nullable(),
  bodyFat: z.number().min(0).max(100).nullable()
})

const targetSchema = z.object({
  calories: z.number().min(0).max(20000).nullable(),
  protein: z.number().min(0).max(2000).nullable(),
  carbs: z.number().min(0).max(2000).nullable(),
  fat: z.number().min(0).max(2000).nullable(),
  sugar: z.number().min(0).max(2000).nullable()
})

function fill(user: UserProfile) {
  form.name = user.name
  form.age = user.age?.toString() ?? ''
  form.height = user.height?.toString() ?? ''
  form.weight = user.weight?.toString() ?? ''
  form.bodyFat = user.bodyFat?.toString() ?? ''
}

function fillTargets(saved: MacroTargets | null) {
  for (const field of targetFields) {
    targets[field.key] = saved?.[field.key]?.toString() ?? ''
  }
}

function toNumber(value: unknown): number | null {
  const str = String(value ?? '').trim()
  return str === '' ? null : Number(str)
}

onMounted(async () => {
  if (!idUser.value) return

  try {
    const user = profile.value ?? (await http.request<UserProfile>(`/users/${idUser.value}`))
    setUser(user)
    fill(user)
    fillTargets(await fetchTargets())
  } catch (error) {
    notify({ type: 'error', title: 'Could not load profile', description: getErrorMessage(error) })
  }
})

async function submit() {
  const result = schema.safeParse({
    name: form.name.trim(),
    age: toNumber(form.age),
    height: toNumber(form.height),
    weight: toNumber(form.weight),
    bodyFat: toNumber(form.bodyFat)
  })

  const targetResult = targetSchema.safeParse({
    calories: toNumber(targets.calories),
    protein: toNumber(targets.protein),
    carbs: toNumber(targets.carbs),
    fat: toNumber(targets.fat),
    sugar: toNumber(targets.sugar)
  })

  if (!result.success || !targetResult.success) {
    const issue = result.error?.issues[0] ?? targetResult.error?.issues[0]
    notify({ type: 'error', title: 'Check the form', description: issue?.message ?? 'Invalid input.' })
    return
  }

  saving.value = true
  try {
    if (idUser.value) {
      const user = await http.addOrUpdate<UserProfile>(`/users/${idUser.value}`, 'PATCH', { body: result.data })
      setUser(user)
      await saveTargets(targetResult.data)
      notify({ type: 'success', title: 'Profile updated' })
    } else {
      const user = await http.addOrUpdate<UserProfile>('/users', 'POST', { body: result.data })
      setUser(user)
      await saveTargets(targetResult.data, user.id)
      notify({ type: 'success', title: 'Welcome!', description: 'Your portfolio is ready.' })
      router.push('/')
    }
  } catch (error) {
    notify({ type: 'error', title: 'Could not save profile', description: getErrorMessage(error) })
  } finally {
    saving.value = false
  }
}
</script>
