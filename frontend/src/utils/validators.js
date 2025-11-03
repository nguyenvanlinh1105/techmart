// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Vietnam)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate password
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Validate required field
export const isRequired = (value) => {
  return value && value.toString().trim().length > 0
}

// Validate min length
export const minLength = (value, min) => {
  return value && value.length >= min
}

// Validate max length
export const maxLength = (value, max) => {
  return value && value.length <= max
}

// Validate number
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

// Validate positive number
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0
}

// Validate integer
export const isInteger = (value) => {
  return Number.isInteger(Number(value))
}

// Validate URL
export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL: 'Email không hợp lệ',
  PHONE: 'Số điện thoại không hợp lệ',
  PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  MIN_LENGTH: (min) => `Phải có ít nhất ${min} ký tự`,
  MAX_LENGTH: (max) => `Không được vượt quá ${max} ký tự`,
  NUMBER: 'Phải là số',
  POSITIVE_NUMBER: 'Phải là số dương',
  INTEGER: 'Phải là số nguyên',
  URL: 'URL không hợp lệ',
  PASSWORD_MISMATCH: 'Mật khẩu không khớp',
}

