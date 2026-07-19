import { Octokit } from '@octokit/rest'

import { track } from '@/lib/analytics/track'
import { detectAIFiles } from '@/lib/detection/ai-detector'
import { classifyChanges } from '@/lib/detection/change-classifier'
import { computeRisk, evidenceScore } from '@/lib/detection/risk-engine'
import { upsertPRComment } from '@/lib/github/comments'
import { buildReviewPackage, PACKAGE_VERSION } from '@/lib/packages/markdown'

type PRPayload = {
  owner: string
  repo: string
  prNumber: number
  prTitle: string
  headSha: string
  baseRef: string
  installationId: number
}

export async function processOpenedPR(payload: PRPayload): Promise<void> {
  const { owner, repo, prNumber, prTitle, headSha, baseRef, installationId } = payload

  const { getGitHubApp } = await import('@/lib/github/app')
  const app = getGitHubApp()
  const octokit = (await app.getInstallationOctokit(installationId)) as unknown as Octokit

  const { data: comparison } = await octokit.repos.compareCommits({
    owner,
    repo,
    base: baseRef,
    head: headSha,
  })

  const changedFiles = (comparison.files ?? []).map((f) => f.filename)
  const aiFiles = detectAIFiles(changedFiles)

  if (aiFiles.length === 0) return

  const changeTypes = classifyChanges(aiFiles)
  const risk = computeRisk(changeTypes)
  const score = evidenceScore(aiFiles, changeTypes)

  await track('ai.detected', { owner, repo, prNumber, aiFileCount: aiFiles.length, changeTypes, risk, score, packageVersion: PACKAGE_VERSION })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://verify.vouqis.com'
  const body = buildReviewPackage({ owner, repo, prNumber, prTitle, headSha, baseRef, aiFiles, changeTypes, risk, score, baseUrl })

  await upsertPRComment(octokit, owner, repo, prNumber, body)

  await track('package.generated', { owner, repo, prNumber, aiFileCount: aiFiles.length, changeTypes, risk, score, packageVersion: PACKAGE_VERSION })
}
