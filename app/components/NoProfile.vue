<template>
  <Card class="mx-auto max-w-md text-center">
    <CardHeader>
      <CardTitle class="flex items-center justify-center gap-2">
        <UserIcon class="size-5" />
        Get started
      </CardTitle>
      <CardDescription> Sign in or create an account to start tracking your food and macronutrients. </CardDescription>
    </CardHeader>
    <CardContent class="flex justify-center gap-3">
      <Button as-child>
        <NuxtLink to="/signup">Create account</NuxtLink>
      </Button>
      <Button
        as-child
        variant="outline"
      >
        <NuxtLink to="/login">Sign in</NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { UserIcon } from '@lucide/vue'
</script>
