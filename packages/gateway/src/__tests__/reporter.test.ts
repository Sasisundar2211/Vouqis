import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { report } from '../reporter.js'
import type { FailureReport } from '../types.js'

describe('reporter', () => {
  describe('report', () => {
    let stderrSpy: ReturnType<typeof vi.spyOn>
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('writes to stderr not stdout', () => {
      const failure: FailureReport = {
        type: 'null_response',
        tool: 'create_invoice',
        severity: 'HIGH',
        detail: 'tools/call returned null or missing result',
      }
      report(failure)
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('includes all FailureReport fields in output', () => {
      const lines: string[] = []
      vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
        lines.push(args.join(' '))
      })

      const failure: FailureReport = {
        type: 'schema_violation',
        tool: 'list_tools',
        severity: 'HIGH',
        detail: 'result.content is missing, empty, or not an array',
      }
      report(failure)

      const output = lines.join('\n')
      expect(output).toContain('SILENT FAILURE DETECTED')
      expect(output).toContain('schema_violation')
      expect(output).toContain('list_tools')
      expect(output).toContain('HIGH')
      expect(output).toContain('result.content is missing')
    })
  })
})
