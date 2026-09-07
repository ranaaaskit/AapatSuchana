import { listIncidents } from './apiClient'

export function fetchIncidents({ includePending = false } = {}) {
  return listIncidents(includePending)
    .then((data) => ({ data, error: null }))
    .catch((error) => ({ data: null, error }))
}