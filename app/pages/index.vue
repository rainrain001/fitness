<template>
  <ClientOnly>
    <div v-if="!idUser">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold">Fitness Food Tracker</h1>
        <p class="text-muted-foreground mt-2">Know what you eat — and remember it.</p>
      </div>
      <NoProfile />
    </div>

    <div
      v-else
      class="grid gap-6"
    >
      <div>
        <h1 class="text-2xl font-semibold">Welcome back, {{ profile?.name }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">Here's a snapshot of your portfolio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <UserIcon class="size-5" />
            Your profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              v-for="metric in profileMetrics"
              :key="metric.label"
              class="bg-muted/50 rounded-lg p-3"
            >
              <dt class="text-muted-foreground text-xs font-medium">{{ metric.label }}</dt>
              <dd class="mt-1 text-lg font-semibold">{{ metric.value }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <MacroSummary
        :totals="todayTotals"
        title="Today's target"
        :description="todayDescription"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/foods">
          <Card class="h-full transition-shadow hover:shadow-md">
            <CardContent class="flex items-center justify-between py-6">
              <div>
                <p class="text-2xl font-bold">{{ foods?.length ?? 0 }}</p>
                <p class="text-muted-foreground text-sm">Saved foods</p>
              </div>
              <SaladIcon class="text-muted-foreground size-8" />
            </CardContent>
          </Card>
        </NuxtLink>

        <NuxtLink to="/plans">
          <Card class="h-full transition-shadow hover:shadow-md">
            <CardContent class="flex items-center justify-between py-6">
              <div>
                <p class="text-2xl font-bold">{{ plans?.length ?? 0 }}</p>
                <p class="text-muted-foreground text-sm">Plans · {{ completedCount }} completed</p>
              </div>
              <ClipboardListIcon class="text-muted-foreground size-8" />
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Plan } from '~/types/plan'
import { ClipboardListIcon, SaladIcon, UserIcon } from '@lucide/vue'

const http = useHttpRequest()
const { idUser, profile } = useCurrentUser()
const { fetchFoods, foods } = useFoods()

const { execute: fetchPlans, data: plans } = http.get<Plan[]>(() => `/plans?idUser=${idUser.value}`, {
  key: 'plans',
  immediate: false,
  default: () => []
})

const today = new Date().toISOString().slice(0, 10)

const completedCount = computed(() => (plans.value ?? []).filter((plan) => plan.completed).length)

// A plan covers today when today falls inside its window: a day plan is just its
// own date, a week plan spans the 7 days starting on its date. ISO date strings
// compare correctly lexically.
function coversToday(plan: Plan) {
  if (plan.date > today) return false
  if (plan.period === 'day') return plan.date === today
  const end = new Date(`${plan.date}T00:00:00`)
  end.setDate(end.getDate() + 6)
  return today <= end.toISOString().slice(0, 10)
}

const todayPlans = computed(() => (plans.value ?? []).filter(coversToday))

const todayTotals = computed(() =>
  sumMacros(todayPlans.value.flatMap((plan) => plan.foods.map((food) => scaleFood(food, food.amount))))
)

const todayDescription = computed(() =>
  todayPlans.value.length ? `Across ${todayPlans.value.length} plan(s) covering today` : 'No plans covering today yet'
)

const profileMetrics = computed(() => [
  { label: 'Age', value: profile.value?.age ?? '—' },
  { label: 'Height', value: profile.value?.height ? `${profile.value.height} cm` : '—' },
  { label: 'Weight', value: profile.value?.weight ? `${profile.value.weight} kg` : '—' },
  { label: 'Body fat', value: profile.value?.bodyFat != null ? `${profile.value.bodyFat}%` : '—' }
])

onMounted(() => {
  if (!idUser.value) return
  fetchFoods()
  fetchPlans()
})
</script>
