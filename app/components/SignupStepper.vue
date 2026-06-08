<template>
  <ol class="mb-6 flex items-center">
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="flex items-center"
      :class="index < steps.length - 1 ? 'flex-1' : ''"
    >
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors"
          :class="circleClass(index)"
        >
          <CheckIcon
            v-if="index < current"
            class="size-4"
          />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span
          class="text-xs font-medium"
          :class="index <= current ? 'text-foreground' : 'text-muted-foreground'"
        >
          {{ step.label }}
        </span>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="mx-2 mb-5 h-px flex-1 transition-colors"
        :class="index < current ? 'bg-primary' : 'bg-border'"
      />
    </li>
  </ol>
</template>

<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'

// Which step is active (0 = Sign up, 1 = Verify, 2 = Done).
const props = defineProps<{ current: number }>()

const steps = [{ label: 'Sign up' }, { label: 'Verify' }, { label: 'Done' }]

function circleClass(index: number): string {
  if (index < props.current) return 'border-primary bg-primary text-primary-foreground'
  if (index === props.current) return 'border-primary text-primary'
  return 'border-border text-muted-foreground'
}
</script>
