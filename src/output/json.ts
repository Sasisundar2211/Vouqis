import {writeFileSync} from 'node:fs'
import type {TrustScore, EvalResult} from '../eval/scoring.js'

export interface JsonReport {
  version: string
  timestamp: string
  serverUrl: string
  trustScore: TrustScore
  results: EvalResult[]
}

export function buildJsonReport(
  serverUrl: string,
  trustScore: TrustScore,
  results: EvalResult[],
): JsonReport {
  return {
    version: '0.0.1',
    timestamp: new Date().toISOString(),
    serverUrl,
    trustScore,
    results,
  }
}

export function writeJsonReport(report: JsonReport, outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8')
}
