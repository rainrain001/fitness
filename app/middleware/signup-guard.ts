// Guards the verify and done steps so they're only reachable mid sign-up.
//
// - /signup/verify needs a pending email (sign-up was started).
// - /signup/done needs a verified flag (OTP was accepted).
//
// The flow state lives in memory (see useSignup), so a direct visit or a reload
// sends the user back to the start of the flow.
export default defineNuxtRouteMiddleware((to) => {
  const { pendingEmail, verified } = useSignup()

  if (to.path === '/signup/done') {
    if (!verified.value) return navigateTo('/signup')
    return
  }

  // /signup/verify
  if (!pendingEmail.value) return navigateTo('/signup')
})
