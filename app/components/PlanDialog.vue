<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ plan ? 'Edit plan' : 'New plan' }}</DialogTitle>
        <DialogDescription> Pick the foods you plan to eat for a day or a week. </DialogDescription>
      </DialogHeader>

      <div class="grid max-h-[70vh] gap-4 overflow-y-auto">
        <div class="grid gap-2">
          <Label for="plan-title">Title (optional)</Label>
          <Input
            id="plan-title"
            v-model="title"
            placeholder="e.g. High-protein Monday"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-2">
            <Label>Period</Label>
            <div class="flex gap-2">
              <Button
                v-for="option in periods"
                :key="option"
                type="button"
                size="sm"
                class="flex-1 capitalize"
                :variant="period === option ? 'default' : 'outline'"
                @click="period = option"
              >
                {{ option }}
              </Button>
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="plan-date">{{ period === 'week' ? 'Week starting' : 'Date' }}</Label>
            <Input
              id="plan-date"
              v-model="date"
              type="date"
            />
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Foods ({{ selectedIds.size }} selected)</Label>
          <p
            v-if="!foods.length"
            class="text-muted-foreground text-sm"
          >
            No foods yet — add some in your library first.
          </p>
          <div class="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            <div
              v-for="food in foods"
              :key="food.id"
              :class="
                cn(
                  'flex cursor-pointer flex-col gap-2 rounded-md border p-2.5 transition-colors',
                  selectedIds.has(food.id) ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                )
              "
              @click="toggle(food.id)"
            >
              <div class="flex items-center gap-2.5">
                <Checkbox
                  :model-value="selectedIds.has(food.id)"
                  @click.stop
                  @update:model-value="toggle(food.id)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-medium">{{ food.name }}</span>
                    <span class="text-muted-foreground shrink-0 text-xs">{{ round(food.calories) }} kcal</span>
                  </div>
                  <p class="text-muted-foreground truncate text-xs">
                    P {{ round(food.protein) }} · C {{ round(food.carbs) }} · F {{ round(food.fat) }} · S
                    {{ round(food.sugar)
                    }}<span v-if="food.perAmount"> · per {{ round(food.perAmount) }} {{ food.perUnit }}</span>
                  </p>
                </div>
              </div>

              <div
                v-if="selectedIds.has(food.id) && food.perAmount"
                class="flex items-center gap-2 pl-[26px]"
                @click.stop
              >
                <Label
                  :for="`plan-amount-${food.id}`"
                  class="text-muted-foreground text-xs"
                >
                  Amount
                </Label>
                <Input
                  :id="`plan-amount-${food.id}`"
                  :model-value="amounts[food.id] ?? ''"
                  type="number"
                  min="0"
                  step="any"
                  class="h-7 w-24"
                  @update:model-value="(v) => setAmount(food.id, v)"
                />
                <span class="text-muted-foreground text-xs">{{ food.perUnit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="flex flex-col sm:flex-col gap-2">
        <MacroSummary
          size="sm"
          :totals="totals"
          :targets="targets"
          title="Plan totals"
          :description="summaryDescription"
        />
        <div class="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            @click="open = false"
          >
            Cancel
          </Button>
          <Button
            :disabled="saving"
            class="bg-green-600 hover:bg-green-600/80"
            @click="submit"
          >
            {{ saving ? 'Saving…' : 'Save plan' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { MacroTotals } from '~/types/food'
import type { Plan, PlanPeriod } from '~/types/plan'
import { cn } from '~/utils/shadcn'

const props = defineProps<{ plan?: Plan | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [] }>()

const http = useHttpRequest()
const { notify } = useNotifications()
const { idUser } = useCurrentUser()
const { fetchFoods, foods } = useFoods()
const { targets: macroTargets, fetchTargets } = useMacroTargets()

const periods: PlanPeriod[] = ['day', 'week']

const saving = ref(false)
const title = ref('')
const period = ref<PlanPeriod>('day')
const date = ref(today())
const selectedIds = ref<Set<number>>(new Set())
const amounts = ref<Record<number, number | null>>({})

const totals = computed(() =>
  sumMacros(
    (foods.value ?? [])
      .filter((food) => selectedIds.value.has(food.id))
      .map((food) => scaleFood(food, amounts.value[food.id]))
  )
)

// The user's expected macronutrients, surfaced so the plan can be compared
// against them. Null entries (unset targets) are simply not compared.
const targets = computed<Partial<MacroTotals> | null>(() => {
  const t = macroTargets.value
  if (!t) return null
  const out: Partial<MacroTotals> = {}
  if (t.calories != null) out.calories = t.calories
  if (t.protein != null) out.protein = t.protein
  if (t.carbs != null) out.carbs = t.carbs
  if (t.fat != null) out.fat = t.fat
  if (t.sugar != null) out.sugar = t.sugar
  return Object.keys(out).length ? out : null
})

const summaryDescription = computed(() => {
  const count = selectedIds.value.size
  const base = `${count} food${count === 1 ? '' : 's'} selected`
  return targets.value ? `${base} · compared to your targets` : base
})

watch(open, async (isOpen) => {
  if (!isOpen) return
  await Promise.all([fetchFoods(), fetchTargets()])
  title.value = props.plan?.title ?? ''
  period.value = props.plan?.period ?? 'day'
  date.value = props.plan?.date ?? today()
  selectedIds.value = new Set(props.plan?.foods.map((food) => food.id) ?? [])
  amounts.value = Object.fromEntries((props.plan?.foods ?? []).map((food) => [food.id, food.amount]))
})

function today() {
  return new Date().toISOString().slice(0, 10)
}

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

function setAmount(id: number, value: string | number) {
  const n = Number(value)
  amounts.value[id] = value === '' || !Number.isFinite(n) ? null : n
}

async function submit() {
  if (!date.value) {
    notify({ type: 'error', title: 'Pick a date', description: 'A plan needs a date.' })
    return
  }

  const amountsBody: Record<string, number> = {}
  for (const id of selectedIds.value) {
    const value = amounts.value[id]
    if (value != null) amountsBody[String(id)] = value
  }

  const body = {
    title: title.value.trim() || null,
    period: period.value,
    date: date.value,
    idFoods: [...selectedIds.value],
    amounts: amountsBody
  }

  saving.value = true
  try {
    if (props.plan) {
      await http.addOrUpdate<Plan>(`/plans/${props.plan.id}`, 'PATCH', { body })
    } else {
      await http.addOrUpdate<Plan>('/plans', 'POST', { body: { ...body, idUser: idUser.value } })
    }

    notify({ type: 'success', title: props.plan ? 'Plan updated' : 'Plan created' })
    open.value = false
    emit('saved')
  } catch (error) {
    notify({ type: 'error', title: 'Could not save plan', description: getErrorMessage(error) })
  } finally {
    saving.value = false
  }
}
</script>
