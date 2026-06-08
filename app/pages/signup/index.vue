<template>
  <div>
    <SignupStepper :current="0" />

    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>We'll email you a code to verify it's you.</CardDescription>
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
              autocomplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>

          <Button
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Sending code…' : 'Continue' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-muted-foreground text-sm">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

const http = useHttpRequest()
const router = useRouter()
const { notify } = useNotifications()
const { start } = useSignup()

const loading = ref(false)
const form = reactive({ email: '', password: '' })

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

async function submit() {
  const result = schema.safeParse({ email: form.email.trim(), password: form.password })
  if (!result.success) {
    notify({ type: 'error', title: 'Check the form', description: result.error.issues[0]?.message })
    return
  }

  loading.value = true
  try {
    const { devCode } = await http.addOrUpdate<{ email: string; devCode?: string }>('/auth/signup', 'POST', {
      body: result.data
    })
    start(result.data.email)
    if (devCode) notify({ type: 'info', title: 'Dev code', description: `Your verification code is ${devCode}` })
    router.push('/signup/verify')
  } catch (error) {
    notify({ type: 'error', title: 'Could not sign up', description: getErrorMessage(error, 'Please try again.') })
  } finally {
    loading.value = false
  }
}
</script>
