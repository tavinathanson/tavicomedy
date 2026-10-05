// Writes data/attendance.json from the comedylist repo's contacts.yaml: paid
// show dates keyed by hashed email and name, so no personal info is committed.
import { readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { load } from 'js-yaml'
import { personKeys } from '../lib/attendance.mjs'

if (!process.env.ATTENDANCE_SECRET) throw new Error('ATTENDANCE_SECRET is not set (see .env.local.example)')

const source = process.env.COMEDYLIST_CONTACTS || `${homedir()}/drive/repos/comedylist/contacts.yaml`
const { contacts } = load(readFileSync(source, 'utf8'))

const attendance = {}
for (const [email, contact] of Object.entries(contacts)) {
  const dates = (contact.events || []).filter(e => e.type === 'paid-show').map(e => e.date)
  for (const key of dates.length ? personKeys(email, contact.name) : []) {
    attendance[key] = [...new Set([...(attendance[key] || []), ...dates])].sort()
  }
}

const sorted = Object.fromEntries(Object.entries(attendance).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(new URL('../data/attendance.json', import.meta.url), JSON.stringify(sorted) + '\n')
console.log(`Wrote ${Object.keys(sorted).length} keys from ${source}`)
