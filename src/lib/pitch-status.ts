export const PITCH_SENT_STORAGE_KEY = 'abkreative_pitch_sent_leads_v1'
export const PITCH_SENT_EVENT = 'abkreative:pitch-sent'

function getSentIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(PITCH_SENT_STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function isLeadPitchSent(leadId: string): boolean {
  return getSentIds().includes(leadId)
}

export function markLeadPitchSent(leadId: string) {
  if (typeof window === 'undefined') return

  const ids = Array.from(new Set([...getSentIds(), leadId]))
  localStorage.setItem(PITCH_SENT_STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent(PITCH_SENT_EVENT, { detail: { leadId } }))
}

export function subscribePitchSent(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(PITCH_SENT_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(PITCH_SENT_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
