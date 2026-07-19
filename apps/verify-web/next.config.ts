import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['@octokit/app', '@octokit/rest'],
}

export default config
