import { createHmac } from 'crypto'

const normEmail = (email) => (email || '').trim().toLowerCase()
const normName = (name) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ')

// Keyed hash, so data/attendance.json (committed to a public repo) can't be
// reversed or checked against a known email without ATTENDANCE_SECRET.
const hash = (value) =>
  createHmac('sha256', process.env.ATTENDANCE_SECRET || '').update(value).digest('hex').slice(0, 16)

// History keys for a person. Both email and name are used so a guest who paid
// by Stripe one month and cash the next still matches.
export function personKeys(email, name) {
  return [normEmail(email), normName(name)].filter(Boolean).map(hash)
}
