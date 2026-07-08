# Changelog

All notable changes to Vouqis Verify are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `vouqis doctor` command — validates config and GitHub CI environment
- `## What Changed` section in PR comment — categorises AI file changes by path
- Three-tier verdict: `SAFE TO MERGE` / `MERGE WITH WARNING` / `BLOCK MERGE`
- `project_name` config field — shown in PR comment header
- Decision-focused feedback question: "Did this report change your merge decision?"

## [0.1.0] — 2026-07-01

### Added
- `vouqis init` — generates `vouqis.yml`
- `vouqis verify` — runs eval, detects AI file changes, posts PR comment
- Git diff–based AI file change detection via `ai_paths`
- Evaluation runner supporting any shell command (pytest, promptfoo, braintrust, custom)
- Markdown PR comment with verdict, confidence, and feedback links
- GitHub Action (`action.yml`)
- Pydantic config schema with `eval_command`, `baseline`, `ai_paths`, `timeout_seconds`
