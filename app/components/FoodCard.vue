<template>
  <Card
    :class="
      cn(
        'overflow-hidden transition-shadow',
        selectable && 'cursor-pointer hover:shadow-md',
        selected && 'ring-primary ring-2'
      )
    "
    @click="selectable && emit('toggle')"
  >
    <div class="flex gap-4 p-4">
      <Checkbox
        v-if="selectable"
        :model-value="selected"
        class="mt-1"
        @click.stop
        @update:model-value="emit('toggle')"
      />

      <div class="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <img
          v-if="food.picture"
          :src="food.picture"
          :alt="food.name"
          class="size-full object-cover"
        />
        <SaladIcon
          v-else
          class="text-muted-foreground size-7"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="truncate font-medium">{{ food.name }}</h3>
            <p
              v-if="food.perAmount"
              class="text-muted-foreground text-xs"
            >
              per {{ round(food.perAmount) }} {{ food.perUnit }}
            </p>
          </div>

          <div
            v-if="showActions"
            class="flex shrink-0 gap-1"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit"
              @click.stop="emit('edit')"
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete"
              @click.stop="emit('delete')"
            >
              <Trash2Icon class="text-destructive" />
            </Button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary">{{ round(food.calories) }} kcal</Badge>
          <Badge variant="outline">P {{ round(food.protein) }}g</Badge>
          <Badge variant="outline">C {{ round(food.carbs) }}g</Badge>
          <Badge variant="outline">F {{ round(food.fat) }}g</Badge>
          <Badge variant="outline">Sugar {{ round(food.sugar) }}g</Badge>
        </div>

        <div
          v-if="selectable && selected && food.perAmount"
          class="mt-3 flex items-center gap-2"
          @click.stop
        >
          <Label
            :for="`amount-${food.id}`"
            class="text-muted-foreground text-xs"
          >
            Amount
          </Label>
          <Input
            :id="`amount-${food.id}`"
            :model-value="amount ?? ''"
            type="number"
            min="0"
            step="any"
            class="h-8 w-28"
            @update:model-value="onAmount"
          />
          <span class="text-muted-foreground text-xs">{{ food.perUnit }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Food } from '~/types/food'
import { PencilIcon, SaladIcon, Trash2Icon } from '@lucide/vue'
import { cn } from '~/utils/shadcn'

withDefaults(
  defineProps<{
    food: Food
    selectable?: boolean
    selected?: boolean
    showActions?: boolean
    amount?: number | null
  }>(),
  { showActions: false, amount: null }
)
const emit = defineEmits<{ toggle: []; edit: []; delete: []; 'update:amount': [value: number | null] }>()

function onAmount(value: string | number) {
  const n = Number(value)
  emit('update:amount', value === '' || !Number.isFinite(n) ? null : n)
}
</script>
