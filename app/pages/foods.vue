<template>
  <ClientOnly>
    <NoProfile v-if="!idUser" />

    <div v-else>
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Food library</h1>
          <p class="text-muted-foreground mt-1 text-sm">Save foods, then tick them to total up their macronutrients.</p>
        </div>
        <Button @click="openCreate">
          <PlusIcon />
          Add food
        </Button>
      </div>

      <div
        v-if="selectedIds.size"
        class="mb-6"
      >
        <MacroSummary
          :totals="totals"
          :description="`${selectedIds.size} food${selectedIds.size === 1 ? '' : 's'} selected`"
        />
        <Button
          variant="ghost"
          size="sm"
          class="mt-2"
          @click="selectedIds = new Set()"
        >
          Clear selection
        </Button>
      </div>

      <p
        v-if="status === 'pending'"
        class="text-muted-foreground text-sm"
      >
        Loading…
      </p>

      <Card
        v-else-if="!foods?.length"
        class="text-center"
      >
        <CardContent class="py-12">
          <SaladIcon class="text-muted-foreground mx-auto mb-3 size-8" />
          <p class="font-medium">No foods yet</p>
          <p class="text-muted-foreground mt-1 text-sm">Add your first food to get started.</p>
        </CardContent>
      </Card>

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2"
      >
        <FoodCard
          v-for="food in foods"
          :key="food.id"
          :food="food"
          selectable
          show-actions
          :selected="selectedIds.has(food.id)"
          :amount="amounts[food.id]"
          @toggle="toggle(food.id)"
          @update:amount="(v) => (amounts[food.id] = v)"
          @edit="openEdit(food)"
          @delete="remove(food)"
        />
      </div>
    </div>

    <FoodDialog
      v-model:open="dialogOpen"
      :food="editing"
      @saved="refresh"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Food } from '~/types/food'
import { PlusIcon, SaladIcon } from '@lucide/vue'

const http = useHttpRequest()
const { notify } = useNotifications()
const { idUser } = useCurrentUser()
const { fetchFoods, refresh, foods, status } = useFoods()

const dialogOpen = ref(false)
const editing = ref<Food | null>(null)
const selectedIds = ref<Set<number>>(new Set())
const amounts = ref<Record<number, number | null>>({})

const totals = computed(() =>
  sumMacros(
    (foods.value ?? [])
      .filter((food) => selectedIds.value.has(food.id))
      .map((food) => scaleFood(food, amounts.value[food.id]))
  )
)

onMounted(() => {
  if (idUser.value) fetchFoods()
})

function toggle(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
    const food = (foods.value ?? []).find((f) => f.id === id)
    if (food?.perAmount && amounts.value[id] == null) amounts.value[id] = food.perAmount
  }
  selectedIds.value = next
}

function openCreate() {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(food: Food) {
  editing.value = food
  dialogOpen.value = true
}

async function remove(food: Food) {
  if (!confirm(`Delete "${food.name}"?`)) return

  try {
    await http.remove(`/foods/${food.id}`)
    selectedIds.value.delete(food.id)
    notify({ type: 'success', title: 'Food deleted' })
    refresh()
  } catch (error) {
    notify({ type: 'error', title: 'Could not delete food', description: getErrorMessage(error) })
  }
}
</script>
