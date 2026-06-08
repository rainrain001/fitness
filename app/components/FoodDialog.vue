<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ food ? 'Edit food' : 'Add food' }}</DialogTitle>
        <DialogDescription> Save a food and its macronutrients to your library. </DialogDescription>
      </DialogHeader>

      <form
        class="grid gap-4"
        @submit.prevent="submit"
      >
        <div class="grid gap-2">
          <Label for="food-name">Name</Label>
          <Input
            id="food-name"
            v-model="form.name"
            placeholder="e.g. Grilled chicken breast"
          />
        </div>

        <div class="grid gap-2">
          <Label>Picture</Label>
          <div class="flex items-center gap-3">
            <div class="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border">
              <img
                v-if="form.picture"
                :src="form.picture"
                alt=""
                class="size-full object-cover"
              />
              <ImageIcon
                v-else
                class="text-muted-foreground size-6"
              />
            </div>
            <div class="flex flex-col gap-2">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onPicture"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="fileInput?.click()"
              >
                Upload image
              </Button>
              <Button
                v-if="form.picture"
                type="button"
                variant="ghost"
                size="sm"
                @click="form.picture = null"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="field in macroFields"
            :key="field.key"
            class="grid gap-2"
          >
            <Label :for="`food-${field.key}`">{{ field.label }}</Label>
            <Input
              :id="`food-${field.key}`"
              v-model="form[field.key]"
              type="number"
              min="0"
              step="any"
            />
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Measured per (optional)</Label>
          <div class="grid grid-cols-2 gap-3">
            <Input
              id="food-perAmount"
              v-model="form.perAmount"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 100"
            />
            <Select v-model="form.perUnit">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="unit in perUnits"
                  :key="unit"
                  :value="unit"
                >
                  {{ unit }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p class="text-muted-foreground text-xs">
            Set this if the macros above are for a specific amount (e.g. per 100 grams). Totals scale to how much you
            select.
          </p>
        </div>
      </form>

      <DialogFooter>
        <Button
          variant="outline"
          @click="open = false"
        >
          Cancel
        </Button>
        <Button
          :disabled="saving"
          @click="submit"
        >
          {{ saving ? 'Saving…' : 'Save food' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Food, PerUnit } from '~/types/food'
import { ImageIcon } from '@lucide/vue'
import { z } from 'zod'

const props = defineProps<{ food?: Food | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [] }>()

const http = useHttpRequest()
const { notify } = useNotifications()
const { idUser } = useCurrentUser()

const macroFields = [
  { key: 'calories', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'sugar', label: 'Sugar (g)' }
] as const

type MacroKey = (typeof macroFields)[number]['key']

const perUnits: PerUnit[] = ['grams', 'ml', 'serving', 'lbs']

const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const form = reactive<
  { name: string; picture: string | null; perAmount: string; perUnit: PerUnit } & Record<MacroKey, string>
>({
  name: '',
  picture: null,
  perAmount: '',
  perUnit: 'grams',
  calories: '0',
  protein: '0',
  carbs: '0',
  fat: '0',
  sugar: '0'
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  calories: z.number().min(0, 'Calories must be 0 or more'),
  protein: z.number().min(0, 'Protein must be 0 or more'),
  carbs: z.number().min(0, 'Carbs must be 0 or more'),
  fat: z.number().min(0, 'Fat must be 0 or more'),
  sugar: z.number().min(0, 'Sugar must be 0 or more')
})

watch(open, (isOpen) => {
  if (!isOpen) return
  form.name = props.food?.name ?? ''
  form.picture = props.food?.picture ?? null
  form.perAmount = props.food?.perAmount?.toString() ?? ''
  form.perUnit = props.food?.perUnit ?? 'grams'
  for (const { key } of macroFields) {
    form[key] = String(props.food?.[key] ?? 0)
  }
})

function onPicture(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    form.picture = reader.result as string
  }
  reader.readAsDataURL(file)
}

async function submit() {
  const result = schema.safeParse({
    name: form.name.trim(),
    calories: Number(form.calories),
    protein: Number(form.protein),
    carbs: Number(form.carbs),
    fat: Number(form.fat),
    sugar: Number(form.sugar)
  })

  if (!result.success) {
    notify({ type: 'error', title: 'Check the form', description: result.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }

  const perStr = String(form.perAmount ?? '').trim()
  const perAmount = perStr === '' ? null : Number(perStr)
  if (perAmount !== null && (!Number.isFinite(perAmount) || perAmount <= 0)) {
    notify({ type: 'error', title: 'Check the form', description: 'Per amount must be greater than 0.' })
    return
  }
  const perUnit = perAmount !== null ? form.perUnit : null

  saving.value = true
  try {
    const body = { ...result.data, picture: form.picture, perAmount, perUnit }
    if (props.food) {
      await http.addOrUpdate<Food>(`/foods/${props.food.id}`, 'PATCH', { body })
    } else {
      await http.addOrUpdate<Food>('/foods', 'POST', { body: { ...body, idUser: idUser.value } })
    }

    notify({ type: 'success', title: props.food ? 'Food updated' : 'Food added' })
    open.value = false
    emit('saved')
  } catch (error) {
    notify({ type: 'error', title: 'Could not save food', description: getErrorMessage(error) })
  } finally {
    saving.value = false
  }
}
</script>
