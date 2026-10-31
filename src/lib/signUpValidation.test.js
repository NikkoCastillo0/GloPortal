import assert from 'node:assert/strict'
import test from 'node:test'
import { validateSignUp } from './signUpValidation.js'

const validValues = {
  firstName: 'Alex',
  lastName: 'Rivera',
  email: 'alex@example.com',
  phone: '(415) 555-2671',
  password: 'My password',
  confirmPassword: 'My password',
}

test('valid values return an empty field-error map', () => {
  assert.deepEqual(validateSignUp(validValues), { isValid: true, errors: {} })
})

test('an omitted or null form reports all six required fields', () => {
  for (const values of [undefined, null, {}]) {
    const result = validateSignUp(values)
    assert.equal(result.isValid, false)
    assert.deepEqual(Object.keys(result.errors).sort(), Object.keys(validValues).sort())
    assert(Object.values(result.errors).every(message => message.endsWith(' is required.')))
  }
})

test('each missing, empty, or non-string field has its own required error', () => {
  for (const field of Object.keys(validValues)) {
    for (const missing of [undefined, null, '', 123, false, {}]) {
      const result = validateSignUp({ ...validValues, [field]: missing })
      assert.equal(result.isValid, false, field)
      assert.deepEqual(Object.keys(result.errors), [field])
      assert.match(result.errors[field], / is required\.$/)
    }
  }
})

test('whitespace-only names, email, and phone are required-field errors', () => {
  for (const field of ['firstName', 'lastName', 'email', 'phone']) {
    for (const whitespace of [' ', '   ', '\t\n']) {
      const result = validateSignUp({ ...validValues, [field]: whitespace })
      assert.equal(result.isValid, false)
      assert.deepEqual(Object.keys(result.errors), [field])
      assert.match(result.errors[field], / is required\.$/)
    }
  }
})

test('surrounding whitespace in non-password fields is allowed without changing input', () => {
  const values = Object.freeze({
    ...validValues,
    firstName: ' Alex ',
    lastName: ' Rivera ',
    email: ' alex@example.com ',
    phone: ' +1 (415) 555-2671 ',
  })
  assert.equal(validateSignUp(values).isValid, true)
  assert.equal(values.email, ' alex@example.com ')
  assert.equal(values.phone, ' +1 (415) 555-2671 ')
})

test('names support accents, apostrophes, hyphens, and spaces', () => {
  assert.equal(validateSignUp({
    ...validValues, firstName: 'María José', lastName: "O’Neill-Smith",
  }).isValid, true)
})

test('practical email formats allow subdomains, plus tags, and uppercase', () => {
  for (const email of ['a@b.co', 'Alex.Rivera+booking@Sub.Example.COM', 'alex_rivera@example.travel']) {
    assert.deepEqual(validateSignUp({ ...validValues, email }), { isValid: true, errors: {} }, email)
  }
})

test('malformed emails produce only an email error', () => {
  for (const email of [
    'alex', 'alex.example.com', '@example.com', 'alex@', 'alex@example',
    'alex@@example.com', 'alex rivera@example.com', 'alex@exam ple.com',
    '.alex@example.com', 'alex.@example.com', 'alex..rivera@example.com',
    'alex@example..com', 'alex@-example.com', 'alex@example-.com',
    'alex@example.com/path', 'alex<>@example.com',
  ]) {
    assert.deepEqual(validateSignUp({ ...validValues, email }), {
      isValid: false, errors: { email: 'Enter a valid email address.' },
    }, email)
  }
})

test('US phone formats allow common separators and an optional country code', () => {
  for (const phone of [
    '4155552671', '415-555-2671', '415.555.2671', '415 555 2671',
    '(415)555-2671', '(415) 555-2671', '(415) 555 2671',
    '+14155552671', '+1 415-555-2671', '+1 (415) 555-2671',
    '14155552671', '1-415-555-2671',
  ]) {
    assert.deepEqual(validateSignUp({ ...validValues, phone }), { isValid: true, errors: {} }, phone)
  }
})

test('malformed or non-US-style phone numbers produce only a phone error', () => {
  for (const phone of [
    '415555267', '41555526712', '+44 20 7946 0958', '415-CALL-NOW',
    '4155552671 ext 2', '(415 555-2671', '415) 555-2671',
    '415--555-2671', '415/555/2671', '++1 4155552671',
    '+2 4155552671', '015-555-2671', '415-155-2671',
  ]) {
    assert.deepEqual(validateSignUp({ ...validValues, phone }), {
      isValid: false, errors: { phone: 'Enter a valid US phone number.' },
    }, phone)
  }
})

test('password equality preserves case, leading/trailing spaces, and repeated spaces', () => {
  for (const confirmPassword of ['my password', 'My password ', ' My password', 'My  password']) {
    assert.deepEqual(validateSignUp({ ...validValues, confirmPassword }), {
      isValid: false, errors: { confirmPassword: 'Passwords must match exactly.' },
    })
  }
})

test('matching passwords have no additional length or complexity requirements', () => {
  for (const password of ['a', '123', '   ', ' leading and trailing ', '🔑']) {
    assert.deepEqual(validateSignUp({ ...validValues, password, confirmPassword: password }), {
      isValid: true, errors: {},
    })
  }
})

test('all invalid fields are reported together and a new call clears corrected errors', () => {
  const invalid = validateSignUp({
    ...validValues, firstName: '', email: 'bad', phone: 'bad', confirmPassword: 'different',
  })
  assert.equal(invalid.isValid, false)
  assert.deepEqual(Object.keys(invalid.errors).sort(), ['confirmPassword', 'email', 'firstName', 'phone'])
  const corrected = validateSignUp(validValues)
  assert.deepEqual(corrected, { isValid: true, errors: {} })
  assert.equal(Object.keys(invalid.errors).length, 4)
})

test('changing the password after confirmation is caught on the next validation', () => {
  assert.equal(validateSignUp(validValues).isValid, true)
  assert.deepEqual(validateSignUp({ ...validValues, password: 'A new password' }), {
    isValid: false, errors: { confirmPassword: 'Passwords must match exactly.' },
  })
})

test('unknown form fields are ignored', () => {
  assert.deepEqual(validateSignUp({ ...validValues, unrelated: 'ignored' }), {
    isValid: true, errors: {},
  })
})
