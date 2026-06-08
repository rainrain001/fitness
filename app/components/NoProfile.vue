<template>
  <Card class="mx-auto max-w-md text-center">
    <CardHeader>
      <CardTitle class="flex items-center justify-center gap-2">
        <UserIcon class="size-5" />
        Set up your profile
      </CardTitle>
      <CardDescription> Create a profile to start tracking your food and macronutrients. </CardDescription>
    </CardHeader>
    <CardContent>
      <Button as-child>
        <NuxtLink to="/profile">Create profile</NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { UserIcon } from '@lucide/vue'
</script>
