<template>
  <div>
    <SignupStepper :current="2" />

    <Card class="text-center">
      <CardHeader>
        <div class="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
          <CheckIcon class="size-6" />
        </div>
        <CardTitle>You're all set</CardTitle>
        <CardDescription>Your email is verified and your portfolio is ready.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3">
        <Button as-child>
          <NuxtLink to="/profile">Set up your profile</NuxtLink>
        </Button>
        <Button
          as-child
          variant="outline"
        >
          <NuxtLink to="/">Go to dashboard</NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'

definePageMeta({ layout: 'auth', middleware: 'signup-guard' })

const { reset } = useSignup()

// The flow is complete — clear the in-progress state so the guarded steps lock
// again. The user is already signed in via useCurrentUser.
onBeforeUnmount(reset)
</script>
