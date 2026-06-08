<template>
  <Card :class="cn(size === 'sm' && 'py-4')">
    <CardHeader :class="cn(size === 'sm' && 'gap-1 px-4')">
      <CardTitle :class="cn('flex items-center gap-2', size === 'sm' && 'text-sm')">
        <FlameIcon :class="cn(size === 'sm' ? 'size-4' : 'size-5')" />
        {{ title }}
      </CardTitle>
      <CardDescription
        v-if="description"
        :class="cn(size === 'sm' && 'text-xs')"
      >
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent :class="cn(size === 'sm' && 'px-4 pt-0')">
      <dl :class="cn('grid grid-cols-2 gap-3 sm:grid-cols-5', size === 'sm' && 'gap-2')">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          :class="cn('bg-muted/50 rounded-lg p-3 text-center', size === 'sm' && 'rounded-md p-2', statusBg[metric.status])"
        >
          <dt class="text-muted-foreground text-xs font-medium">{{ metric.label }}</dt>
          <dd :class="cn('mt-1 text-xl font-semibold', size === 'sm' && 'text-lg', statusText[metric.status])">
            {{ round(metric.value) }}<span class="text-muted-foreground ml-0.5 text-xs">{{ metric.unit }}</span>
          </dd>
          <dd
            v-if="metric.target != null"
            class="text-muted-foreground mt-0.5 text-[11px] leading-tight"
          >
            / {{ round(metric.target) }} {{ metric.unit }}
          </dd>
        </div>
      </dl>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { MacroStatus } from '~/utils/macros'
import type { MacroTotals } from '~/types/food'
import { FlameIcon } from '@lucide/vue'
import { cn } from '~/utils/shadcn'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    totals: MacroTotals
    targets?: Partial<MacroTotals> | null
    title?: string
    description?: string
  }>(),
  {
    size: 'md',
    targets: null,
    title: 'Total macronutrients',
    description: ''
  }
)

// Subtle tint + text colour per comparison status. 'none' stays neutral.
const statusBg: Record<MacroStatus, string> = {
  none: '',
  green: 'bg-green-500/10',
  yellow: 'bg-yellow-500/10',
  red: 'bg-red-500/10'
}
const statusText: Record<MacroStatus, string> = {
  none: '',
  green: 'text-green-600 dark:text-green-400',
  yellow: 'text-yellow-600 dark:text-yellow-500',
  red: 'text-red-600 dark:text-red-400'
}

const metrics = computed(() => {
  const t = props.targets
  return (
    [
      { label: 'Calories', key: 'calories', unit: 'kcal' },
      { label: 'Protein', key: 'protein', unit: 'g' },
      { label: 'Carbs', key: 'carbs', unit: 'g' },
      { label: 'Fat', key: 'fat', unit: 'g' },
      { label: 'Sugar', key: 'sugar', unit: 'g' }
    ] as const
  ).map((m) => {
    const value = props.totals[m.key]
    const target = t?.[m.key] ?? null
    return { ...m, value, target, status: compareMacro(value, target) }
  })
})
</script>
