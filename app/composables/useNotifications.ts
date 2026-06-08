import { toast } from 'vue-sonner'

type NotifyType = 'success' | 'error' | 'info' | 'warning'

interface NotifyOptions {
  type?: NotifyType
  title: string
  description?: string
}

/**
 * Centralised user-facing feedback. Wraps `vue-sonner` so the rest of the app
 * never imports the toast library directly. Rendered by the <Toaster /> in app.vue.
 */
export function useNotifications() {
  function notify({ type = 'info', title, description }: NotifyOptions) {
    const variants = {
      success: toast.success,
      error: toast.error,
      info: toast.info,
      warning: toast.warning
    }

    variants[type](title, { description })
  }

  return { notify }
}
