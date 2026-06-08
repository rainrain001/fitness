<template>
  <ClientOnly>
    <NoProfile v-if="!idUser" />

    <div v-else>
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Plans</h1>
          <p class="text-muted-foreground mt-1 text-sm">
            Set your food choices per day or week and mark them completed.
          </p>
        </div>
        <Button @click="openCreate">
          <PlusIcon />
          New plan
        </Button>
      </div>

      <p
        v-if="status === 'pending'"
        class="text-muted-foreground text-sm"
      >
        Loading…
      </p>

      <Card
        v-else-if="!plans?.length"
        class="text-center"
      >
        <CardContent class="py-12">
          <ClipboardListIcon class="text-muted-foreground mx-auto mb-3 size-8" />
          <p class="font-medium">No plans yet</p>
          <p class="text-muted-foreground mt-1 text-sm">Create a plan to map out your day or week.</p>
        </CardContent>
      </Card>

      <div
        v-else
        class="grid gap-4"
      >
        <Card
          v-for="plan in plans"
          :key="plan.id"
          :class="cn(plan.completed && 'border-primary/40 bg-primary/5')"
        >
          <CardHeader>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle class="flex items-center gap-2">
                  {{ plan.title || formatDate(plan.date) }}
                  <Badge
                    variant="secondary"
                    class="capitalize"
                    >{{ plan.period }}</Badge
                  >
                  <Badge
                    v-if="plan.completed"
                    class="gap-1"
                  >
                    <CheckIcon class="size-3" />
                    Completed
                  </Badge>
                </CardTitle>
                <CardDescription class="mt-1 flex items-center gap-1">
                  <CalendarIcon class="size-3.5" />
                  {{ plan.period === 'week' ? 'Week of ' : '' }}{{ formatDate(plan.date) }} ·
                  {{ plan.foods.length }} food{{ plan.foods.length === 1 ? '' : 's' }}
                </CardDescription>
              </div>

              <div class="flex shrink-0 gap-1">
                <Button
                  :variant="plan.completed ? 'outline' : 'default'"
                  size="sm"
                  @click="toggleCompleted(plan)"
                >
                  <CheckIcon />
                  {{ plan.completed ? 'Undo' : 'Complete' }}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit"
                  @click="openEdit(plan)"
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  @click="remove(plan)"
                >
                  <Trash2Icon class="text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent class="grid gap-3">
            <div
              v-if="plan.foods.length"
              class="grid gap-2 sm:grid-cols-2"
            >
              <div
                v-for="food in plan.foods"
                :key="food.id"
                class="bg-muted/40 rounded-md border p-2.5"
              >
                <div class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm font-medium">{{ food.name }}</span>
                  <span
                    v-if="food.amount"
                    class="text-muted-foreground shrink-0 text-xs"
                  >
                    {{ round(food.amount) }} {{ food.perUnit }}
                  </span>
                </div>
                <p class="text-muted-foreground mt-1 text-xs">
                  <span class="text-foreground font-medium">{{ round(foodMacros(food).calories) }}</span> kcal · P
                  {{ round(foodMacros(food).protein) }}g · C {{ round(foodMacros(food).carbs) }}g · F
                  {{ round(foodMacros(food).fat) }}g · S {{ round(foodMacros(food).sugar) }}g
                </p>
              </div>
            </div>

            <div class="border-t pt-3">
              <p class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Total</p>
              <dl class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div>
                  <span class="text-foreground font-medium">{{ round(macros(plan).calories) }}</span> kcal
                </div>
                <div>
                  <span class="text-foreground font-medium">{{ round(macros(plan).protein) }}</span
                  >g protein
                </div>
                <div>
                  <span class="text-foreground font-medium">{{ round(macros(plan).carbs) }}</span
                  >g carbs
                </div>
                <div>
                  <span class="text-foreground font-medium">{{ round(macros(plan).fat) }}</span
                  >g fat
                </div>
                <div>
                  <span class="text-foreground font-medium">{{ round(macros(plan).sugar) }}</span
                  >g sugar
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <PlanDialog
      v-model:open="dialogOpen"
      :plan="editing"
      @saved="refresh"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Plan, PlanFood } from '~/types/plan'
import { CalendarIcon, CheckIcon, ClipboardListIcon, PencilIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { cn } from '~/utils/shadcn'

const http = useHttpRequest()
const { notify } = useNotifications()
const { idUser } = useCurrentUser()

const {
  execute: fetchPlans,
  refresh,
  data: plans,
  status
} = http.get<Plan[]>(() => `/plans?idUser=${idUser.value}`, {
  key: 'plans',
  immediate: false,
  default: () => []
})

const dialogOpen = ref(false)
const editing = ref<Plan | null>(null)

onMounted(() => {
  if (idUser.value) fetchPlans()
})

function macros(plan: Plan) {
  return sumMacros(plan.foods.map((food) => scaleFood(food, food.amount)))
}

function foodMacros(food: PlanFood) {
  return scaleFood(food, food.amount)
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function openCreate() {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(plan: Plan) {
  editing.value = plan
  dialogOpen.value = true
}

async function toggleCompleted(plan: Plan) {
  try {
    await http.addOrUpdate<Plan>(`/plans/${plan.id}`, 'PATCH', { body: { completed: !plan.completed } })
    refresh()
  } catch (error) {
    notify({ type: 'error', title: 'Could not update plan', description: getErrorMessage(error) })
  }
}

async function remove(plan: Plan) {
  if (!confirm('Delete this plan?')) return

  try {
    await http.remove(`/plans/${plan.id}`)
    notify({ type: 'success', title: 'Plan deleted' })
    refresh()
  } catch (error) {
    notify({ type: 'error', title: 'Could not delete plan', description: getErrorMessage(error) })
  }
}
</script>
