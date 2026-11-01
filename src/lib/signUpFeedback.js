const genericFailure = 'Unable to create your account. Please try again.'
const duplicateMessage = 'An account with this email may already exist. Try logging in or use a different email address.'
const messages = {
  email_taken: duplicateMessage,
  email_rate_limit: 'Too many signup emails have been requested. Please wait before trying again, and check your inbox and spam folder for a confirmation email.',
  rate_limit: 'Too many sign-up attempts. Please wait a moment and try again.',
  weak_password: 'The account service rejected this password. Choose another password and try again.',
  network_error: 'The account service could not be reached. Please try again.',
}
const errorCodes = {
  email_taken: 'email_taken',
  email_exists: 'email_taken',
  user_already_exists: 'email_taken',
  over_email_send_rate_limit: 'email_rate_limit',
  over_request_rate_limit: 'rate_limit',
  rate_limit: 'rate_limit',
  weak_password: 'weak_password',
  network_error: 'network_error',
}

function failure(error) {
  const code = typeof error?.code === 'string' ? error.code : ''
  let kind = Object.hasOwn(errorCodes, code) ? errorCodes[code] : ''
  if (!kind && typeof error?.message === 'string' && error.message.toLowerCase().includes('email rate limit exceeded')) {
    kind = 'email_rate_limit'
  }
  if (!kind && error?.status === 429) kind = 'rate_limit'
  if (!kind && error?.name === 'AuthRetryableFetchError' && error?.status === 0) kind = 'network_error'
  const message = Object.hasOwn(messages, kind) ? messages[kind] : genericFailure
  return {
    status: 'error',
    message,
    errors: kind === 'email_taken' ? { email: message } : {},
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Map a Supabase-shaped { data, error } response to safe UI feedback.
 * Adapted from the standalone feedback mapper; no React, SDK, validation,
 * storage, or network dependency. Unknown thrown values can be supplied as
 * { data: null, error }. Only recognized errors receive specific messages.
 * Successful results require a user ID and either a null session (email
 * confirmation) or a session with an access token (existing redirect flow).
 * The caller owns loading state, password clearing, and navigation.
 */
export function getSignUpFeedback(result, email = '') {
  if (!isRecord(result)) return failure()
  if (result.error !== null) return failure(result.error)

  const data = result.data
  if (!isRecord(data) || !isRecord(data.user) || typeof data.user.id !== 'string' || !data.user.id.trim()) {
    return failure()
  }
  if (data.user.identities !== undefined && !Array.isArray(data.user.identities)) return failure()
  if (data.session !== null && (!isRecord(data.session) || typeof data.session.access_token !== 'string' || !data.session.access_token.trim())) {
    return failure()
  }
  if (data.session === null && data.user.identities?.length === 0) return failure({ code: 'email_taken' })

  const requiresEmailConfirmation = data.session === null
  const address = typeof email === 'string' ? email.trim() : ''
  return {
    status: 'success',
    message: requiresEmailConfirmation
      ? address
        ? `Your account was created. Check ${address} for a confirmation link, then confirm your email before logging in.`
        : 'Your account was created. Check your email to confirm it before logging in.'
      : 'Your account has been created. You can now log in.',
    errors: {},
    requiresEmailConfirmation,
  }
}
