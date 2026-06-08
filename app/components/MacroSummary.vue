<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <FlameIcon class="size-5" />
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <dl class="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="bg-muted/50 rounded-lg p-3 text-center"
        >
          <dt class="text-muted-foreground text-xs font-medium">{{ metric.label }}</dt>
          <dd class="mt-1 text-xl font-semibold">
            {{ round(metric.value) }}<span class="text-muted-foreground ml-0.5 text-xs">{{ metric.unit }}</span>
          </dd>
        </div>
      </dl>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { MacroTotals } from '~/types/food'
import { FlameIcon } from '@lucide/vue'

const props = withDefaults(defineProps<{ totals: MacroTotals; title?: string; description?: string }>(), {
  title: 'Total macronutrients',
  description: ''
})

const metrics = computed(() => [
  { label: 'Calories', value: props.totals.calories, unit: 'kcal' },
  { label: 'Protein', value: props.totals.protein, unit: 'g' },
  { label: 'Carbs', value: props.totals.carbs, unit: 'g' },
  { label: 'Fat', value: props.totals.fat, unit: 'g' },
  { label: 'Sugar', value: props.totals.sugar, unit: 'g' }
])
</script>
