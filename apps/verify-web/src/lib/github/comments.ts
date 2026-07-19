import { Octokit } from '@octokit/rest'

const MARKER = '<!-- vouqis-verify -->'
const GENERATED_AT_RE = /<!-- vouqis-generated-at:([^>]+) -->/

export async function upsertPRComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<void> {
  const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number: prNumber })
  const existing = comments.find((c) => c.body?.includes(MARKER))

  if (existing) {
    await octokit.issues.updateComment({ owner, repo, comment_id: existing.id, body })
  } else {
    await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body })
  }
}

export async function extractMergeLatencyMinutes(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<number | null> {
  try {
    const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number: prNumber })
    const vouqisComment = comments.find((c) => c.body?.includes(MARKER))
    if (!vouqisComment?.body) return null

    const match = GENERATED_AT_RE.exec(vouqisComment.body)
    if (!match) return null

    const generatedAt = new Date(match[1]).getTime()
    if (isNaN(generatedAt)) return null

    return Math.round((Date.now() - generatedAt) / 60_000)
  } catch {
    return null
  }
}
