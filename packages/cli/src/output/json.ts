import {writeFileSync} from 'node:fs'
import type {TrustScore, EvalResult} from '../eval/scoring.js'
import {getRemediation} from './remediation.js'
import type {Remediation} from './remediation.js'

export interface JsonReport {
  $schema: string
  version: string
  timestamp: string
  serverUrl: string
  trustScore: TrustScore
  results: EvalResult[]
  remediation: Remediation[]
}

export function buildJsonReport(
  serverUrl: string,
  trustScore: TrustScore,
  results: EvalResult[],
): JsonReport {
  const remediation = results
    .filter((r) => !r.passed)
    .map((r) => getRemediation(r.promptId))
    .filter((r): r is Remediation => r !== null)

  return {
    $schema: 'https://vouqis.tech/schemas/report.v1.json',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
    serverUrl,
    trustScore,
    results,
    remediation,
  }
}

export function writeJsonReport(report: JsonReport, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8')
}
