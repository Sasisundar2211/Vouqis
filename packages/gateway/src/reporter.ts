import type { FailureReport } from './types.js'

const SEP = '─'.repeat(45)

export function report(failure: FailureReport): void {
  console.error(`\nvouqis  SILENT FAILURE DETECTED`)
  console.error(SEP)
  console.error(`  type      ${failure.type}`)
  console.error(`  tool      ${failure.tool}`)
  console.error(`  severity  ${failure.severity}`)
  console.error(`  detail    ${failure.detail}`)
  console.error(SEP + '\n')
}
