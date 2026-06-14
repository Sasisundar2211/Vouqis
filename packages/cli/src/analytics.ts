import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {PostHog} from 'posthog-node'

const ID_FILE = path.join(os.homedir(), '.vouqis', 'analytics-id')

function getOrCreateDistinctId(): string {
  try {
    fs.mkdirSync(path.dirname(ID_FILE), {recursive: true})
    if (fs.existsSync(ID_FILE)) {
      const id = fs.readFileSync(ID_FILE, 'utf8').trim()
      if (id) return id
    }
    const id = crypto.randomUUID()
    fs.writeFileSync(ID_FILE, id, 'utf8')
    return id
  } catch {
    return 'anonymous'
  }
}

export const distinctId = getOrCreateDistinctId()

export const posthog = new PostHog(process.env['POSTHOG_API_KEY'] ?? '', {
  host: process.env['POSTHOG_HOST'],
  enableExceptionAutocapture: true,
  flushAt: 1,
  flushInterval: 0,
})
