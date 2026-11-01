const requiredFields = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone number',
  password: 'Password',
  confirmPassword: 'Confirm password',
}

// Practical email syntax: an unquoted local part and a dotted domain.
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i

// US-style ten-digit syntax, with balanced area-code parentheses, common
// separators, and an optional +1 (or 1). Area/exchange codes start with 2-9.
const phonePattern = /^(?:\+?1[ .-]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[ .-]?[2-9]\d{2}[ .-]?\d{4}$/

/**
 * Validate sign-up values without changing the input or contacting a service.
 * All six fields must be strings. Omitted, null, non-string, and empty values
 * produce required-field errors. Surrounding whitespace is ignored for names,
 * email, and phone checks only; passwords are compared exactly as supplied.
 * No password length/complexity policy is imposed, so matching nonempty
 * passwords containing only spaces also pass.
 *
 * Email/phone checks validate format only, not ownership or availability.
 * Unknown fields are ignored. A fresh result is returned on every call.
 *
 * @param {{ firstName: string, lastName: string, email: string, phone: string,
 *   password: string, confirmPassword: string }} [values]
 * @returns {{ isValid: boolean, errors: Partial<Record<'firstName' | 'lastName' |
 *   'email' | 'phone' | 'password' | 'confirmPassword', string>> }}
 * Each invalid field has one message; valid fields are absent from errors.
 * Password mismatch is assigned to confirmPassword. GP-92 can use isValid to
 * gate submission; GP-91 can display errors beside the corresponding fields.
 * @example
 * const result = validateSignUp({
 *   firstName: 'Alex', lastName: 'Rivera', email: 'alex@example.com',
 *   phone: '(415) 555-2671', password: 'a', confirmPassword: 'b',
 * })
 * // { isValid: false, errors: { confirmPassword: 'Passwords must match exactly.' } }
 */
export function validateSignUp(values) {
  const errors = {}

  for (const [field, label] of Object.entries(requiredFields)) {
    const value = values?.[field]
    const isPassword = field === 'password' || field === 'confirmPassword'
    if (typeof value !== 'string' || (isPassword ? value.length === 0 : value.trim().length === 0)) {
      errors[field] = `${label} is required.`
    }
  }

  if (!errors.email) {
    const email = values.email.trim()
    const localPart = email.split('@')[0]
    if (!emailPattern.test(email) || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      errors.email = 'Enter a valid email address.'
    }
  }

  if (!errors.phone && !phonePattern.test(values.phone.trim())) {
    errors.phone = 'Enter a valid US phone number.'
  }

  if (!errors.password && !errors.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords must match exactly.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}
