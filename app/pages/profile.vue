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
import type { UserProfile } from '~/types/user'
import { z } from 'zod'

const http = useHttpRequest()
const router = useRouter()
const { notify } = useNotifications()
const { idUser, profile, setUser } = useCurrentUser()

const saving = ref(false)
const isExisting = computed(() => idUser.value !== null)
const form = reactive({ name: '', age: '', height: '', weight: '', bodyFat: '' })

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0).max(150).nullable(),
  height: z.number().min(0).max(300).nullable(),
  weight: z.number().min(0).max(700).nullable(),
  bodyFat: z.number().min(0).max(100).nullable()
})

function fill(user: UserProfile) {
  form.name = user.name
  form.age = user.age?.toString() ?? ''
  form.height = user.height?.toString() ?? ''
  form.weight = user.weight?.toString() ?? ''
  form.bodyFat = user.bodyFat?.toString() ?? ''
}

function toNumber(value: unknown): number | null {
  const str = String(value ?? '').trim()
  return str === '' ? null : Number(str)
}

onMounted(async () => {
  if (!idUser.value) return

  if (profile.value) {
    fill(profile.value)
    return
  }

  try {
    const user = await http.request<UserProfile>(`/users/${idUser.value}`)
    setUser(user)
    fill(user)
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

  if (!result.success) {
    notify({ type: 'error', title: 'Check the form', description: result.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }

  saving.value = true
  try {
    if (idUser.value) {
      const user = await http.addOrUpdate<UserProfile>(`/users/${idUser.value}`, 'PATCH', { body: result.data })
      setUser(user)
      notify({ type: 'success', title: 'Profile updated' })
    } else {
      const user = await http.addOrUpdate<UserProfile>('/users', 'POST', { body: result.data })
      setUser(user)
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
