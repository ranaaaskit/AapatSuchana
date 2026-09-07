const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const ACCESS_TOKEN_KEY = 'aapat-access-token'
const REFRESH_TOKEN_KEY = 'aapat-refresh-token'
const USER_KEY = 'aapat-user'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || Object.values(body).flat().join(' ') || 'Request failed')
  return body
}

function saveSession(data) {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
  const user = { email: data.user?.email || data.email }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return { access_token: data.access, refresh_token: data.refresh, user }
}

export async function signIn(email, password) {
  const data = await request('/auth/token/', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) })
  const session = saveSession({ ...data, email })
  return { ...session, user: { email } }
}

export async function signUp(email, password) {
  await request('/auth/register/', { method: 'POST', body: JSON.stringify({ email, password }) })
  return signIn(email, password)
}

export async function getSession() {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
  const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  if (!access || !savedUser) return null
  try {
    const user = await request('/auth/me/')
    localStorage.setItem(USER_KEY, JSON.stringify({ email: user.email }))
    return { access_token: access, refresh_token: refresh, user: { email: user.email }, is_employee: user.is_employee }
  } catch {
    signOut()
    return null
  }
}

export async function getCurrentUser() {
  return request('/auth/me/')
}

export function signOut() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function listIncidents(includePending = false) {
  return request(`/incidents/${includePending ? '?include_pending=true' : ''}`)
}

export function createIncident(incident) {
  return request('/incidents/', { method: 'POST', body: JSON.stringify(incident) })
}

export function updateIncident(id, changes) {
  return request(`/incidents/${id}/`, { method: 'PATCH', body: JSON.stringify(changes) })
}
