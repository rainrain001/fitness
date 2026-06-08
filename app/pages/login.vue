<template>
  <Card>
    <CardHeader>
      <CardTitle>Welcome back</CardTitle>
      <CardDescription>Sign in to your food-tracking portfolio.</CardDescription>
    </CardHeader>
    <CardContent>
      <form
        class="grid gap-4"
        @submit.prevent="submit"
      >
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Your password"
          />
        </div>

        <Button
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center">
      <p class="text-muted-foreground text-sm">
        No account?
        <NuxtLink
          to="/signup"
          class="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Create one
        </NuxtLink>
      </p>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

const http = useHttpRequest()
const router = useRouter()
const { notify } = useNotifications()
const { setUser } = useCurrentUser()

const loading = ref(false)
const form = reactive({ email: '', password: '' })

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

async function submit() {
  const result = schema.safeParse({ email: form.email.trim(), password: form.password })
  if (!result.success) {
    notify({ type: 'error', title: 'Check the form', description: result.error.issues[0]?.message })
    return
  }

  loading.value = true
  try {
    const user = await http.addOrUpdate<UserProfile>('/auth/login', 'POST', { body: result.data })
    setUser(user)
    notify({ type: 'success', title: `Welcome back, ${user.name}` })
    router.push('/')
  } catch (error) {
    notify({ type: 'error', title: 'Could not sign in', description: getErrorMessage(error, 'Please try again.') })
  } finally {
    loading.value = false
  }
}
</script>
