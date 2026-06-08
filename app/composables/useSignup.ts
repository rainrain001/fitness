/**
 * In-progress sign-up state, shared across the signup → verify → done steps.
 *
 * Held in `useState` (memory only), so it exists solely for the duration of the
 * flow: a full page reload clears it. The verify and done pages read it through
 * their route guards (see `app/middleware/signup-guard.ts`) so they're only
 * reachable while a sign-up is actually underway.
 */
export function useSignup() {
  // The email awaiting OTP verification — set once /auth/signup succeeds.
  const pendingEmail = useState<string | null>('signup-pending-email', () => null)
  // Flipped once the OTP is accepted — gates the final "done" step.
  const verified = useState<boolean>('signup-verified', () => false)

  function start(email: string) {
    pendingEmail.value = email
    verified.value = false
  }

  function markVerified() {
    verified.value = true
  }

  function reset() {
    pendingEmail.value = null
    verified.value = false
  }

  return { pendingEmail, verified, start, markVerified, reset }
}
