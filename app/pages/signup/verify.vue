<template>
  <div>
    <SignupStepper :current="1" />

    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to
          <span class="text-foreground font-medium">{{ pendingEmail }}</span>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          class="grid gap-4"
          @submit.prevent="submit"
        >
          <div class="grid gap-2">
            <Label for="code">Verification code</Label>
            <Input
              id="code"
              v-model="code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="000000"
              class="text-center text-lg tracking-[0.5em]"
            />
          </div>

          <Button
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Verifying…' : 'Verify' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-muted-foreground text-sm">
          Didn't get it?
          <button
            type="button"
            class="text-foreground font-medium underline-offset-4 hover:underline disabled:opacity-50"
            :disabled="resending"
            @click="resend"
          >
            {{ resending ? 'Resending…' : 'Resend code' }}
          </button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'
import { z } from 'zod'

definePageMeta({ layout: 'auth', middleware: 'signup-guard' })

const http = useHttpRequest()
const router = useRouter()
const { notify } = useNotifications()
const { setUser } = useCurrentUser()
const { pendingEmail, markVerified } = useSignup()

const loading = ref(false)
const resending = ref(false)
const code = ref('')

const schema = z.object({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') })

async function submit() {
  const result = schema.safeParse({ code: code.value.trim() })
  if (!result.success) {
    notify({ type: 'error', title: 'Check the code', description: result.error.issues[0]?.message })
    return
  }

  loading.value = true
  try {
    const user = await http.addOrUpdate<UserProfile>('/auth/verify', 'POST', {
      body: { email: pendingEmail.value, code: result.data.code }
    })
    setUser(user)
    markVerified()
    router.push('/signup/done')
  } catch (error) {
    notify({ type: 'error', title: 'Could not verify', description: getErrorMessage(error, 'Please try again.') })
  } finally {
    loading.value = false
  }
}

async function resend() {
  resending.value = true
  try {
    const { devCode } = await http.addOrUpdate<{ email: string; devCode?: string }>('/auth/resend', 'POST', {
      body: { email: pendingEmail.value }
    })
    notify({ type: 'success', title: 'Code sent', description: 'Check your inbox for a new code.' })
    if (devCode) notify({ type: 'info', title: 'Dev code', description: `Your verification code is ${devCode}` })
  } catch (error) {
    notify({ type: 'error', title: 'Could not resend', description: getErrorMessage(error, 'Please try again.') })
  } finally {
    resending.value = false
  }
}
</script>
