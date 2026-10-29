import assert from 'node:assert/strict'
import test from 'node:test'
import { getSignUpFeedback } from './signUpFeedback.js'

const user = Object.freeze({ id: 'synthetic-user', identities: Object.freeze([{ id: 'synthetic-identity' }]) })
const confirmation = Object.freeze({ data: Object.freeze({ user, session: null }), error: null })
const genericFailure = 'Unable to create your account. Please try again.'
const errorResult = error => getSignUpFeedback({ data: null, error })

test('confirmed account creation preserves the existing email confirmation instructions', () => {
  const result = getSignUpFeedback(confirmation, ' alex@example.test ')
  assert.equal(result.status, 'success')
  assert.equal(result.requiresEmailConfirmation, true)
  assert.equal(result.message, 'Your account was created. Check alex@example.test for a confirmation link, then confirm your email before logging in.')
  assert.deepEqual(result.errors, {})
  assert.equal(confirmation.data.user.id, 'synthetic-user')
})

test('a valid session is distinguished from confirmation-required success', () => {
  const result = getSignUpFeedback({ data: { user, session: { access_token: 'synthetic-token' } }, error: null })
  assert.equal(result.status, 'success')
  assert.equal(result.requiresEmailConfirmation, false)
  assert.match(result.message, /can now log in/)
})

test('confirmation copy has a safe fallback when no email context is supplied', () => {
  for (const email of [undefined, null, '', 42, {}]) {
    assert.equal(getSignUpFeedback(confirmation, email).message, 'Your account was created. Check your email to confirm it before logging in.')
  }
})

test('duplicate response and recognized duplicate codes preserve the existing message', () => {
  const duplicate = getSignUpFeedback({ data: { user: { id: user.id, identities: [] }, session: null }, error: null })
  assert.equal(duplicate.status, 'error')
  assert.equal(duplicate.message, 'An account with this email may already exist. Try logging in or use a different email address.')
  assert.deepEqual(duplicate.errors, { email: duplicate.message })
  for (const code of ['email_taken', 'email_exists', 'user_already_exists']) {
    assert.deepEqual(errorResult({ code }), duplicate)
  }
})

test('email rate-limit code and legacy text retain the existing instructions', () => {
  for (const error of [{ code: 'over_email_send_rate_limit' }, { message: 'Email rate limit exceeded' }]) {
    const result = errorResult(error)
    assert.equal(result.status, 'error')
    assert.equal(result.message, 'Too many signup emails have been requested. Please wait before trying again, and check your inbox and spam folder for a confirmation email.')
  }
})

test('general request limits and HTTP 429 use the reusable rate-limit message', () => {
  for (const error of [{ code: 'over_request_rate_limit' }, { code: 'rate_limit' }, { status: 429 }]) {
    assert.equal(errorResult(error).message, 'Too many sign-up attempts. Please wait a moment and try again.')
  }
})

test('server password rejection explains the failure without inventing a password policy', () => {
  assert.equal(errorResult({ code: 'weak_password', message: 'PRIVATE DETAILS' }).message,
    'The account service rejected this password. Choose another password and try again.')
})

test('recognized network failures get connection feedback; arbitrary thrown errors stay generic', () => {
  for (const error of [{ code: 'network_error' }, { name: 'AuthRetryableFetchError', status: 0 }]) {
    assert.equal(errorResult(error).message, 'The account service could not be reached. Please try again.')
  }
  assert.equal(errorResult(new Error('private diagnostic')).message, genericFailure)
  assert.equal(errorResult({ name: 'AuthRetryableFetchError', status: 503 }).message, genericFailure)
})

test('null, primitives, unknown codes, and unusual error property types fail safely', () => {
  for (const error of [null, undefined, false, 0, 123n, Symbol('error'), '', 'private diagnostic', [], {},
    { code: 'toString' }, { code: '__proto__' }, { code: {} }, { code: Symbol('code') },
    { message: {} }, { message: 123 }, { code: 'unknown', message: 'PRIVATE DATABASE DETAILS' }]) {
    const result = errorResult(error)
    assert.deepEqual(result, { status: 'error', message: genericFailure, errors: {} })
  }
})

test('an error takes precedence even when user data is also present', () => {
  const result = getSignUpFeedback({ data: confirmation.data, error: { code: 'weak_password' } })
  assert.equal(result.status, 'error')
  assert.match(result.message, /rejected this password/)
})

test('missing, malformed, or empty account responses never announce successful creation', () => {
  for (const result of [undefined, null, false, 1, 'created', [], {}, { data: confirmation.data },
    { data: null, error: null }, { data: {}, error: null },
    { data: { session: null, user: null }, error: null },
    { data: { session: null, user: {} }, error: null },
    { data: { session: null, user: { id: '   ' } }, error: null },
    { data: { session: null, user: { id: 123 } }, error: null },
    { data: { session: null, user: { id: user.id, identities: {} } }, error: null }]) {
    assert.deepEqual(getSignUpFeedback(result), { status: 'error', message: genericFailure, errors: {} })
  }
})

test('missing or malformed sessions fail safely instead of redirecting', () => {
  for (const session of [undefined, false, '', 1, [], {}, { access_token: '' }, { access_token: '   ' }, { access_token: 123 }]) {
    assert.equal(getSignUpFeedback({ data: { user, session }, error: null }).status, 'error')
  }
})

test('optional identities are supported for an otherwise confirmed user', () => {
  assert.equal(getSignUpFeedback({ data: { user: { id: user.id }, session: null }, error: null }).status, 'success')
})

test('feedback objects are fresh, inputs remain unchanged, and a later retry can succeed', () => {
  const input = Object.freeze({ data: null, error: Object.freeze({ code: 'email_exists' }) })
  const first = getSignUpFeedback(input)
  first.errors.email = 'changed by caller'
  assert.match(getSignUpFeedback(input).errors.email, /may already exist/)
  assert.equal(input.error.code, 'email_exists')
  assert.equal(getSignUpFeedback(confirmation).status, 'success')
})
