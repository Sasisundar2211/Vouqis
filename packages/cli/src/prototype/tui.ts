// PROTOTYPE — throwaway TUI shell. Delete this file when the question is answered.
// Run: npm run prototype  (from packages/cli)

import * as readline from 'node:readline'
import chalk from 'chalk'
import {initialState, reduce, getScenarios, INSPECT_NEXT} from './logic.js'
import type {PrototypeState, Hypothesis, InterviewRecord} from './logic.js'

// ── helpers ───────────────────────────────────────────────────────────────────

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length)
}

function hr(): string { return chalk.dim('─'.repeat(70)) }
function lbl(s: string): string { return chalk.dim(pad(s, 16)) }
function elapsed(startedAt: number | null): string {
  if (!startedAt) return '—'
  return ((Date.now() - startedAt) / 1000).toFixed(1) + 's'
}

// ── sections ──────────────────────────────────────────────────────────────────

function renderScenarios(state: PrototypeState): string {
  return getScenarios().map((s, i) => {
    const active = state.scenarioIndex === i
    const bullet = active ? chalk.cyan('►') : ' '
    const num = chalk.dim(String(i + 1))
    const name = pad(s.name, 18)
    const loc = chalk.dim(pad(`${s.server}/${s.tool}`, 36))
    const dec = s.outcome.decision === 'allow' ? chalk.green('allow') : chalk.red('block')
    return `  ${bullet} ${num}  ${name}  ${loc}  ${dec}`
  }).join('\n')
}

function renderDecision(state: PrototypeState): string {
  if (!state.result || !state.scenario) {
    return '  ' + chalk.dim('(select a scenario)')
  }
  const {event, failure} = state.result
  const {scenario} = state
  const lines: string[] = []

  // Observed facts
  lines.push(chalk.bold('  Gateway Observed'))
  for (const obs of scenario.observed) {
    lines.push(`    ${chalk.dim('•')} ${chalk.dim(obs)}`)
  }
  lines.push('')

  // Interpretation
  lines.push(chalk.bold('  Gateway Interpretation'))
  const dec = event.decision === 'allow' ? chalk.green('ALLOW') : chalk.red.bold('BLOCK')
  lines.push(`    ${lbl('decision')}${dec}`)
  if (failure) {
    lines.push(`    ${lbl('failure class')}${chalk.yellow(failure.class)}`)
    lines.push(`    ${lbl('reason')}${chalk.dim(failure.reason.slice(0, 54))}`)
    lines.push(`    ${lbl('inspect next')}${chalk.dim(INSPECT_NEXT[failure.class].slice(0, 54))}`)
  }
  lines.push(`    ${lbl('latency')}${chalk.dim(event.latency_ms + 'ms')}  ${lbl('req id')}${chalk.dim(String(event.requestId ?? '—'))}`)

  return lines.join('\n')
}

function statusColor(h: Hypothesis): string {
  const s = pad(h.status, 10)
  switch (h.status) {
    case 'validated': return chalk.green(s)
    case 'killed':    return chalk.red(s)
    case 'candidate': return chalk.yellow(s)
    default:          return chalk.dim(s)
  }
}

function renderFounderSection(state: PrototypeState): string {
  const hyps = state.hypotheses.map((h, i) => {
    const active = i === state.activeHypothesisIndex
    const bullet = active ? chalk.cyan('►') : ' '
    const id = active ? chalk.bold.cyan(h.id) : chalk.bold(h.id)
    const bar = '█'.repeat(h.confirmations) + '░'.repeat(Math.max(0, 3 - h.confirmations))
    const counts = chalk.dim(`${bar} ${h.confirmations}/3  ✗${h.disconfirmations}`)
    const desc = chalk.dim(h.description.slice(0, 40))
    return `  ${bullet} ${id}  ${statusColor(h)}  ${counts}  ${desc}`
  }).join('\n')

  const inProgress = state.hypotheses.filter(
    h => h.confirmations > 0 && h.status !== 'validated' && h.status !== 'killed'
  ).length
  const debt = inProgress === 0
    ? chalk.green('0') + chalk.dim('  (no unvalidated assumptions in progress)')
    : chalk.yellow(String(inProgress)) + chalk.dim(` unvalidated assumption${inProgress > 1 ? 's' : ''} in progress`)

  return [
    chalk.bold('HYPOTHESES') + '  ' + chalk.dim('[h] cycle  sessions: ' + state.interviewLog.length),
    hyps,
    '',
    chalk.bold('EVIDENCE DEBT:') + '  ' + debt,
  ].join('\n')
}

// ── screens ───────────────────────────────────────────────────────────────────

function renderMain(state: PrototypeState): void {
  const timer = state.scenarioStartedAt ? chalk.yellow(' ⏱ ' + elapsed(state.scenarioStartedAt)) : ''
  console.log(chalk.bold('VOUQIS RELIABILITY PROTOTYPE') + timer + '  ' + chalk.dim(`last: ${state.lastAction}`))
  console.log()

  console.log(chalk.bold('SCENARIOS') + '  ' + chalk.dim('[1-7] to run'))
  console.log(renderScenarios(state))
  console.log()

  console.log(chalk.bold('GATEWAY DECISION'))
  console.log(renderDecision(state))
  console.log()

  if (state.founderMode) {
    console.log(renderFounderSection(state))
    console.log()
  }

  console.log(hr())
  const keys = state.scenario
    ? chalk.dim('[1-7] scenario  [t] record observation  [h] hyp  [f] founder  [r] reset  [q] quit')
    : chalk.dim('[1-7] scenario  [f] founder  [r] reset  [q] quit')
  console.log(keys)
}

function renderTFCA(state: PrototypeState): void {
  const t = elapsed(state.scenarioStartedAt)
  console.log(chalk.bold('RECORD OBSERVATION') + '  ' + chalk.yellow('⏱ ' + t))
  console.log()
  console.log(`  Scenario:  ${chalk.white(state.scenario?.name ?? '—')}`)
  console.log()
  console.log(`  ${chalk.bold('Did the engineer know what to investigate next?')}`)
  console.log()
  console.log(`  ${chalk.green('[y]')}  Yes — they stated or implied their next debugging step`)
  console.log(`  ${chalk.red('[n]')}  No  — they were uncertain or chose the wrong direction`)
  console.log()
  console.log(hr())
  console.log(chalk.dim('[y] yes  [n] no  [q] quit'))
}

function renderConfidence(state: PrototypeState): void {
  const tfca = state.currentInterview.tfca_ms
  const acc = state.currentInterview.actionAccuracy
  console.log(chalk.bold('CONFIDENCE CHECK'))
  console.log()
  console.log(`  ${lbl('TFCA')}${chalk.yellow((tfca !== undefined ? tfca / 1000 : 0).toFixed(1) + 's')}`)
  console.log(`  ${lbl('accuracy')}${acc ? chalk.green('correct') : chalk.red('incorrect')}`)
  console.log()
  console.log(`  ${chalk.bold('How confident would the engineer be taking the next step?')}`)
  console.log()
  console.log(`  ${chalk.dim('1')} barely   ${chalk.dim('2')} slightly   ${chalk.dim('3')} moderately   ${chalk.dim('4')} quite   ${chalk.dim('5')} fully`)
  console.log()
  console.log(hr())
  console.log(chalk.dim('[1-5] confidence'))
}

function renderHypothesisPrompt(state: PrototypeState): void {
  const active = state.hypotheses[state.activeHypothesisIndex]
  const tfca = state.currentInterview.tfca_ms
  const conf = state.currentInterview.confidence
  console.log(chalk.bold('HYPOTHESIS CONFIRMATION'))
  console.log()
  console.log(`  ${lbl('TFCA')}${chalk.yellow((tfca !== undefined ? tfca / 1000 : 0).toFixed(1) + 's')}  ${lbl('confidence')}${chalk.white(String(conf ?? '—') + '/5')}`)
  console.log()
  if (active) {
    console.log(`  ${chalk.bold(active.id)}  ${chalk.dim(active.status)}  ${chalk.dim(active.confirmations + '/3 confirmations')}`)
    console.log(`  ${chalk.dim(active.description)}`)
  }
  console.log()
  console.log(`  ${chalk.bold('Does this session confirm or disconfirm the hypothesis?')}`)
  console.log()
  console.log(`  ${chalk.green('[y]')}  Confirmed — behavior observed supports the hypothesis`)
  console.log(`  ${chalk.red('[n]')}  Disconfirmed — behavior contradicts the hypothesis`)
  console.log()
  console.log(hr())
  console.log(chalk.dim('[h] cycle hypothesis  [y] confirm  [n] disconfirm'))
}

function renderSummary(state: PrototypeState): void {
  const rec = state.currentInterview as InterviewRecord
  const sessionNum = state.interviewLog.length
  console.log(chalk.bold(`INTERVIEW SUMMARY  #${sessionNum}`))
  console.log()
  console.log(`  ${lbl('Scenario')}${chalk.white(rec.scenarioName ?? '—')}`)
  console.log(`  ${lbl('TFCA')}${chalk.yellow(((rec.tfca_ms ?? 0) / 1000).toFixed(1) + 's')}`)
  console.log(`  ${lbl('Action Accuracy')}${rec.actionAccuracy ? chalk.green('Correct') : chalk.red('Incorrect')}`)
  console.log(`  ${lbl('Confidence')}${chalk.white(String(rec.confidence ?? '—') + '/5')}`)
  console.log()
  console.log(`  ${lbl('Hypothesis')}${chalk.bold(rec.hypothesisId ?? '—')}`)
  const verdict = rec.hypothesisVerdict === 'confirmed' ? chalk.green('Confirmed') : chalk.red('Disconfirmed')
  console.log(`  ${lbl('Verdict')}${verdict}`)
  console.log()

  const h = state.hypotheses.find(x => x.id === rec.hypothesisId)
  if (h) {
    const bar = '█'.repeat(h.confirmations) + '░'.repeat(Math.max(0, 3 - h.confirmations))
    console.log(`  ${lbl('Evidence')}${chalk.dim(bar + ' ' + h.confirmations + '/3 confirmations')}  ${statusColor(h)}`)
  }

  if (state.interviewLog.length > 1) {
    console.log()
    const avgTFCA = state.interviewLog.reduce((s, r) => s + r.tfca_ms, 0) / state.interviewLog.length
    const avgConf = state.interviewLog.reduce((s, r) => s + r.confidence, 0) / state.interviewLog.length
    const accRate = state.interviewLog.filter(r => r.actionAccuracy).length / state.interviewLog.length
    console.log(`  ${chalk.dim('─── running averages (' + state.interviewLog.length + ' sessions)')}`)
    console.log(`  ${lbl('avg TFCA')}${chalk.yellow((avgTFCA / 1000).toFixed(1) + 's')}`)
    console.log(`  ${lbl('avg confidence')}${chalk.white(avgConf.toFixed(1) + '/5')}`)
    console.log(`  ${lbl('action accuracy')}${chalk.white(Math.round(accRate * 100) + '%')}`)
  }

  console.log()
  console.log(hr())
  console.log(chalk.dim('[any key] back to main'))
}

// ── frame ─────────────────────────────────────────────────────────────────────

function render(state: PrototypeState): void {
  console.clear()
  switch (state.uiMode) {
    case 'main':       renderMain(state); break
    case 'tfca':       renderTFCA(state); break
    case 'confidence': renderConfidence(state); break
    case 'hypothesis': renderHypothesisPrompt(state); break
    case 'summary':    renderSummary(state); break
  }
}

// ── input loop ────────────────────────────────────────────────────────────────

let state = initialState()
render(state)

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)

process.stdin.on('keypress', (_ch: unknown, key: {name: string; ctrl: boolean; sequence: string}) => {
  if (!key) return
  if (key.ctrl && key.name === 'c') process.exit(0)

  const k = key.sequence ?? key.name

  if (k === 'q') process.exit(0)

  switch (state.uiMode) {
    case 'main':
      if (k >= '1' && k <= '7') state = reduce(state, {type: 'SELECT_SCENARIO', index: Number(k) - 1})
      else if (k === 'f')        state = reduce(state, {type: 'TOGGLE_FOUNDER'})
      else if (k === 'h')        state = reduce(state, {type: 'NEXT_HYPOTHESIS'})
      else if (k === 't' && state.scenario) state = reduce(state, {type: 'START_RECORDING'})
      else if (k === 'r')        state = reduce(state, {type: 'RESET'})
      break

    case 'tfca':
      if (k === 'y') state = reduce(state, {type: 'RECORD_TFCA', correct: true})
      else if (k === 'n') state = reduce(state, {type: 'RECORD_TFCA', correct: false})
      break

    case 'confidence':
      if (k >= '1' && k <= '5') state = reduce(state, {type: 'RECORD_CONFIDENCE', score: Number(k)})
      break

    case 'hypothesis':
      if (k === 'h')   state = reduce(state, {type: 'NEXT_HYPOTHESIS'})
      else if (k === 'y') state = reduce(state, {type: 'RECORD_HYPOTHESIS', verdict: 'confirmed'})
      else if (k === 'n') state = reduce(state, {type: 'RECORD_HYPOTHESIS', verdict: 'disconfirmed'})
      break

    case 'summary':
      state = reduce(state, {type: 'DISMISS_SUMMARY'})
      break
  }

  render(state)
})
