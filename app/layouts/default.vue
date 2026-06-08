<template>
  <div class="bg-background text-foreground min-h-screen">
    <header class="bg-card sticky top-0 z-10 border-b">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold"
        >
          <UtensilsCrossedIcon class="size-5" />
          <span>Food Tracker</span>
        </NuxtLink>

        <nav class="flex items-center gap-1">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            active-class="bg-accent text-accent-foreground"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <ClientOnly>
          <NuxtLink
            to="/profile"
            class="text-muted-foreground hover:text-foreground text-sm"
          >
            {{ profile?.name ?? 'Set up profile' }}
          </NuxtLink>
        </ClientOnly>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { UtensilsCrossedIcon } from '@lucide/vue'

const { profile } = useCurrentUser()

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/foods', label: 'Foods' },
  { to: '/plans', label: 'Plans' },
  { to: '/profile', label: 'Profile' }
]
</script>
