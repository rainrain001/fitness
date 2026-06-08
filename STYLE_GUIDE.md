# Fitness Food Tracker — Style Guide

Conventions for the Nuxt 4 + Vue 3 (`<script setup>`) frontend. Follow these so
new code reads like the code already here.

The four rules that matter most:

1. [Use `useHttpRequest` for every API call](#1-api-requests) — `const http = useHttpRequest()`.
2. [Keep one-off GETs in the page](#2-where-data-fetching-lives), not in a composable.
3. [Lean on Nuxt auto-imports](#3-auto-imports) — don't import components, composables, or utils.
4. [Validate with Zod](#4-validation-with-zod) where there's user input.

---

## 1. API requests

All HTTP goes through the `useHttpRequest` composable. Always assign it to a
variable named **`http`**:

```ts
const http = useHttpRequest()
```

The composable centralises the base URL, auth header, and `$fetch` instance, so
**never call `$fetch` / `useFetch` directly** and never read
`useRuntimeConfig().public.api` to build a URL yourself.

It exposes three methods:

| Method                                 | Use for           | Underlying |
| -------------------------------------- | ----------------- | ---------- |
| `http.get(url, opts?)`                 | reads (`GET`)     | `useFetch` |
| `http.addOrUpdate(url, method, opts?)` | create / update   | `$fetch`   |
| `http.remove(url, opts?)`              | delete (`DELETE`) | `$fetch`   |

### Reads — `http.get`

`get` wraps `useFetch`, so it is SSR-aware and returns
`{ data, pending, error, refresh, ... }`. Pass a type argument for the response
shape:

```ts
const http = useHttpRequest()
const { data: roles, pending, error, refresh } = http.get<OrganizationRole[]>('/organization-roles')
```

### Writes — `http.addOrUpdate`

```ts
const http = useHttpRequest()

// create
const userRoles = await http.addOrUpdate<UserRole[]>('/user-roles', 'POST', {
  body: { idUser, idRoles }
})

// update
await http.addOrUpdate<User>(`/users/${id}`, 'PATCH', { body: changes })
```

### Deletes — `http.remove`

```ts
const http = useHttpRequest()
await http.remove(`/user-roles/${id}`)
```

### Error handling

Wrap writes in `try/catch`, surface failures with `notify`, and derive the
message with the `getErrorMessage` util (auto-imported):

```ts
const http = useHttpRequest()
const { notify } = useNotifications()

try {
  await http.addOrUpdate('/user-roles', 'POST', { body })
} catch (error) {
  notify({
    type: 'error',
    title: 'Could not save roles',
    description: getErrorMessage(error, 'Please try again.')
  })
}
```

---

## 2. Where data-fetching lives

> **If a request isn't shared across multiple components or pages, call it
> directly in the page — don't create a composable for it. This applies to every
> method: `get`, `addOrUpdate`, and `remove`.**

A composable per endpoint adds indirection that only pays off when more than one
caller needs it.

✅ Page-local request (only this page needs it) — reads and writes alike:

```vue
<script setup lang="ts">
const http = useHttpRequest()

// read
const { data: invoices, pending } = http.get<Invoice[]>('/invoices')

// write — call inline in the handler that needs it
async function archive(id: string) {
  await http.remove(`/invoices/${id}`)
}
</script>
```

✅ Promote to a composable **only when shared** across multiple components or
pages. Shared composables live in `app/composables/`, are named `useX`, carry a
JSDoc block describing the backend module they mirror, and own any types used
only by them (types shared with other files live in `app/types/` — see §5).

For a **retrieve (`GET`)** request, do **not** wrap it in an inner function.
Call `http.get` directly in the composable body with `immediate: false`,
destructure `execute` and **alias it to a request-specific name**, then return
that. `immediate: false` defers the request until a caller invokes the alias, so
the composable can run at setup (where `useFetch` must be called) while the fetch
itself stays on-demand. Always pass a stable `key` so Nuxt can dedupe/cache:

```ts
export interface Invoice {
  id: string
  total: number
}

/**
 * Invoice API: retrieve the current invoice.
 * Mirrors the backend `invoice` module.
 */
export function useInvoice() {
  const http = useHttpRequest()

  const {
    execute: fetch,
    data,
    status,
    error
  } = http.get<Invoice>('/invoice', {
    key: 'retrieve-invoice',
    immediate: false
  })

  return { fetch, data, status, error }
}
```

Callers trigger the request with the alias and read the reactive state:

```ts
const { fetch, data: invoice } = useInvoice()
await fetch() // e.g. onMounted, on dialog open, on button click
```

Name the alias after the request — `fetch`, `refresh`, `load`, or a verb that
fits the endpoint (`fetchInvoice`, `loadRoles`). Return the `useFetch` handles
the caller needs (`data`, `status`, `error`, …) alongside it.

> **Writes** (`POST`/`PUT`/`PATCH`/`DELETE`) still wrap a function — they use
> `http.addOrUpdate` / `http.remove` (plain `$fetch`, no `immediate`), e.g.
> `useUserRoles().assign(...)`.

State that must be shared across pages (not a request) belongs in a `useState`
composable — see `useAuthUser` and `useNotifications`.

---

## 3. Auto-imports

Nuxt auto-imports the following. **Do not write import statements for them:**

- **Components** — anything under `app/components/` (incl. `ui/`), e.g.
  `<Card>`, `<Button>`, `<GoogleAuthButton>`, `<OrganizationRoleDialog>`.
- **Composables** — anything under `app/composables/`, e.g. `useHttpRequest()`,
  `useNotifications()`, `useAuthUser()`.
- **Utils** — anything under `app/utils/`, e.g. `getErrorMessage()`, `cn()`.
- **Vue / Nuxt APIs** — `ref`, `reactive`, `computed`, `watch`, `onMounted`,
  `useRoute`, `useRouter`, `useRuntimeConfig`, `useState`, `useAppConfig`,
  `definePageMeta`, `defineModel`, etc.

The **only** imports you should write are **types** (and third-party packages):

```ts
import type { Invoice } from '~/types/invoice'
import { z } from 'zod'
```

Reference components in templates in **PascalCase** (enforced by ESLint):
`<NuxtLink>`, not `<nuxt-link>`.

---

## 4. Validation with Zod

Use [Zod](https://zod.dev) to validate user input and to parse/narrow untrusted
data (form values, query params, API responses you don't fully trust).

> Zod isn't installed yet — add it before first use:
> `npm install zod`. It pairs with the project's existing `@vee-validate/nuxt`
> via `@vee-validate/zod`'s `toTypedSchema`.

Define a schema, infer the type from it (one source of truth), and `parse` /
`safeParse` at the boundary:

```ts
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email(),
  idRoles: z.array(z.string()).min(1, 'Pick at least one role')
})

type InviteInput = z.infer<typeof inviteSchema>

async function submit(raw: unknown) {
  const result = inviteSchema.safeParse(raw)
  if (!result.success) {
    notify({
      type: 'error',
      title: 'Check the form',
      description: result.error.issues[0]?.message ?? 'Invalid input.'
    })
    return
  }

  const http = useHttpRequest()
  await http.addOrUpdate<UserRole[]>('/user-roles', 'POST', { body: result.data })
}
```

With vee-validate forms, feed the schema through the adapter:

```ts
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

const schema = toTypedSchema(z.object({ email: z.string().email() }))
```

---

## 5. File & code conventions

### Layout

```
app/
  components/        # auto-imported; PascalCase files. ui/ = shadcn (don't hand-edit)
  composables/       # useX(): shared API access + shared state
  pages/             # routes; page-local reads live here
  layouts/           # e.g. top.vue
  utils/             # pure helpers (auto-imported)
  types/             # types shared across >1 file (kebab-case) + ambient .d.ts
```

### SFC structure

`<template>` first, then `<script setup lang="ts">`. Inside the script, order:

1. type-only imports
2. `definePageMeta` / `defineProps` / `defineModel` / `defineEmits`
3. composables (`const http = useHttpRequest()`, `const { notify } = useNotifications()`)
4. reactive state (`ref`, `reactive`)
5. functions and lifecycle (`onMounted`, `watch`)

### Formatting (Prettier + ESLint — enforced)

- **No semicolons**, **single quotes**, **2-space** indent.
- `printWidth` 120, `trailingComma: none`.
- **One attribute per line** on multi-attribute tags (`singleAttributePerLine`).
- Components in templates: **PascalCase**.

Run before committing:

```bash
npm run format
npm run lint:eslint
```

### Naming

- Composables: `useX`. Components: `PascalCase`. Utils: `camelCase`.
- ID fields mirror the backend: `idUser`, `idRole`, `idRoles`.
- Types used in a single file are declared there; types used across more than
  one file live in `app/types/` (see [Types](#types)).

### Types

Co-locate a type with its only user; centralise a type with many.

- Used in a **single file** → declare it in that file (a component's
  `defineProps` shape, a composable's response interface).
- Used across **more than one file** → declare it in `app/types/`, the home for
  types shared across the whole project. One concern per file, kebab-cased, and
  imported explicitly (types are **not** auto-imported):

  ```ts
  // app/types/invoice.ts
  export interface Invoice {
    id: string
    total: number
  }
  ```

  ```ts
  import type { Invoice } from '~/types/invoice'
  ```

The moment a local type gains a second importer, **move it to `app/types/`**
instead of importing it from one feature file into another. Ambient global
declarations (`*.d.ts`, e.g. `types/google.d.ts`) live here too.

### UX primitives

- Use shadcn components from `app/components/ui/` (`Card`, `Button`, `Dialog`,
  `Badge`, …) rather than raw markup.
- Surface all user-facing feedback through `useNotifications().notify(...)`.
