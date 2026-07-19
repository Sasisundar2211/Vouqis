import { after } from 'next/server'
import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

import { track } from '@/lib/analytics/track'
import { verifyWebhookSignature } from '@/lib/github/webhook'
import { extractMergeLatencyMinutes } from '@/lib/github/comments'
import { processOpenedPR } from '@/lib/packages/processor'

async function getOctokit(installationId: number): Promise<Octokit> {
  const { getGitHubApp } = await import('@/lib/github/app')
  return (await getGitHubApp().getInstallationOctokit(installationId)) as unknown as Octokit
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  const sig = request.headers.get('x-hub-signature-256')
  const event = request.headers.get('x-github-event')

  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret || !verifyWebhookSignature(body, sig, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event === 'installation') {
    if (payload['action'] === 'created') {
      const account = (payload['installation'] as Record<string, unknown>)['account'] as Record<string, unknown>
      after(async () => {
        await track('app.installed', { owner: account['login'] as string })
      })
    }
    return new Response(null, { status: 204 })
  }

  if (event === 'pull_request_review') {
    const review = payload['review'] as Record<string, unknown>
    if (review['state'] === 'changes_requested') {
      const pr = payload['pull_request'] as Record<string, unknown>
      const repo = payload['repository'] as Record<string, unknown>
      const owner = (repo['owner'] as Record<string, unknown>)['login'] as string
      const repoName = repo['name'] as string
      const prNumber = pr['number'] as number
      after(async () => {
        await track('pr.changes_requested', { owner, repo: repoName, prNumber })
      })
    }
    return new Response(null, { status: 204 })
  }

  if (event !== 'pull_request') return new Response(null, { status: 204 })

  const action = payload['action']
  const pr = payload['pull_request'] as Record<string, unknown>
  const repository = payload['repository'] as Record<string, unknown>
  const installation = payload['installation'] as Record<string, unknown>

  const owner = (repository['owner'] as Record<string, unknown>)['login'] as string
  const repo = repository['name'] as string
  const prNumber = pr['number'] as number
  const installationId = installation['id'] as number

  if (action === 'closed') {
    const merged = pr['merged'] === true
    after(async () => {
      if (merged) {
        const octokit = await getOctokit(installationId)
        const latency = await extractMergeLatencyMinutes(octokit, owner, repo, prNumber)
        await track('pr.merged', { owner, repo, prNumber, mergeLatencyMinutes: latency })
      } else {
        await track('pr.closed_unmerged', { owner, repo, prNumber })
      }
    })
    return new Response(null, { status: 204 })
  }

  if (action !== 'opened' && action !== 'synchronize') return new Response(null, { status: 204 })

  const prTitle = pr['title'] as string
  const headSha = (pr['head'] as Record<string, unknown>)['sha'] as string
  const baseRef = (pr['base'] as Record<string, unknown>)['ref'] as string

  after(async () => {
    await track('pr.opened', { owner, repo, prNumber })
    try {
      await processOpenedPR({ owner, repo, prNumber, prTitle, headSha, baseRef, installationId })
    } catch (err) {
      console.error('[vouqis-verify] processOpenedPR failed', err)
    }
  })

  return new Response(null, { status: 204 })
}
