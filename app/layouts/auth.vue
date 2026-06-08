<template>
  <div class="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 py-12">
    <NuxtLink
      to="/"
      class="mb-8 flex items-center gap-2 text-lg font-semibold"
    >
      <UtensilsCrossedIcon class="size-6" />
      <span>Food Tracker</span>
    </NuxtLink>

    <div class="w-full max-w-sm">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UtensilsCrossedIcon } from '@lucide/vue'
</script>
