import type { UseFetchOptions } from 'nuxt/app'
import type { FetchOptions } from 'ofetch'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface HttpRequestOptions<T> extends Omit<UseFetchOptions<T>, 'default'> {
  default?: () => T
}

export function useHttpRequest() {
  const api = useRuntimeConfig().public.api as string
  const token = ref('')

  // Built per request so the latest token is attached — e.g. on calls made in
  // the same setup where the user just signed in.
  function authHeaders(): Headers {
    const headers = new Headers()

    if (token.value) {
      headers.set('Authorization', `Bearer ${token.value}`)
    }

    return headers
  }

  function addOrUpdate<T>(resource: string, method: Method, opts?: Partial<Omit<FetchOptions, 'method'>>) {
    return $fetch<T>(resource, {
      ...opts,
      baseURL: api,
      method,
      headers: authHeaders()
    })
  }

  function get<T>(resource: Ref<string> | string | (() => string), opts?: HttpRequestOptions<T>) {
    return useFetch(resource, {
      ...opts,
      baseURL: api,
      headers: authHeaders(),
      $fetch: useNuxtApp().$api as typeof $fetch
    })
  }

  function remove<T>(resource: string, opts?: Partial<Omit<FetchOptions, 'method'>>) {
    return $fetch<T>(resource, {
      baseURL: api,
      ...opts,
      method: 'DELETE',
      headers: authHeaders()
    })
  }

  // Imperative authenticated GET — for on-demand reads with dynamic params that
  // don't fit `get`'s reactive useFetch model (e.g. fetched on a user action).
  function request<T>(resource: string, opts?: Partial<Omit<FetchOptions, 'method'>>) {
    return $fetch<T>(resource, {
      ...opts,
      baseURL: api,
      method: 'GET',
      headers: authHeaders()
    })
  }

  return {
    addOrUpdate,
    get,
    remove,
    request
  }
}
