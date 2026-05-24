const API_URL = 'https://script.google.com/macros/s/AKfycbxaG0yVdj4DYM0u3FlePf2Ks-1ComWQJ2LOm8owGbGERI5q2YU1u1e9k0oaef6PMwIYUQ/exec'
const SESSION_KEY = 'sales_test_session'

const AUTH_ERROR_KEYWORDS = [
  'session',
  'token',
  'permission',
  'unauthorized',
  'forbidden',
  'expired',
  'login',
  'auth',
  '登入',
  '重新登入',
  '請重新',
  '權限',
  '無權限',
  '沒有權限',
  '授權',
  '未授權',
  '驗證',
  '認證',
  '令牌',
  '無令牌',
  '沒有令牌',
  '逾時',
  '逾期',
  '過期',
  '失效',
  '無效',
  '未登入',
  '沒有登入',
  '登出'
]

const normalizeMessage = (message) => {
  if (Array.isArray(message)) return message.join('\n')
  if (message && typeof message === 'object') return JSON.stringify(message)
  return String(message || '')
}

export class ApiError extends Error {
  constructor(message, response) {
    super(normalizeMessage(message) || 'Request failed')
    this.name = 'ApiError'
    this.response = response
  }
}

export const getStoredSession = () => sessionStorage.getItem(SESSION_KEY) || ''

export const setStoredSession = (session) => {
  sessionStorage.setItem(SESSION_KEY, session)
}

export const clearStoredSession = () => {
  sessionStorage.removeItem(SESSION_KEY)
}

export const postToGAS = async (action, payload = {}) => {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not defined. Check .env and restart the Vite dev server.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, payload })
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.status !== 'success') {
    throw new ApiError(data.message || 'Request failed', data)
  }

  return data
}

export const postWithSession = (action, payload = {}) => {
  const session = getStoredSession()

  if (!session) {
    throw new ApiError('無令牌，請重新登入', {
      status: 'error',
      message: '無令牌，請重新登入'
    })
  }

  return postToGAS(action, {
    ...payload,
    session
  })
}

export const login = async (key) => {
  const data = await postToGAS('getSession', { key })
  setStoredSession(data.session)
  return data.session
}

export const logout = async () => {
  const session = getStoredSession()

  try {
    if (session) {
      await postToGAS('removeSession', { session })
    }
  } finally {
    clearStoredSession()
  }
}

export const isAuthError = (error) => {
  if (!(error instanceof ApiError)) return false

  const message = normalizeMessage(error.message).toLowerCase()
  const responseMessage = normalizeMessage(error.response?.message).toLowerCase()
  const combinedMessage = `${message}\n${responseMessage}`

  return AUTH_ERROR_KEYWORDS.some((keyword) => combinedMessage.includes(keyword.toLowerCase()))
}
