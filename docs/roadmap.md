# Roadmap

Vouqis Verify is a validation MVP. Every item here is conditional on customer evidence.

## Now (v0.1)

- [x] `vouqis init` / `vouqis verify` / `vouqis doctor`
- [x] Git diff–based AI file change detection
- [x] Any eval command (exit 0 = pass)
- [x] Three-tier verdict: SAFE / WARNING / BLOCK
- [x] GitHub Action
- [x] PR comment with What Changed + Why

## Next (v0.2) — if customers ask

- [ ] Baseline result caching (latency delta, score delta in What Changed)
- [ ] Eval output score parsing for supported frameworks (pytest, promptfoo)
- [ ] `--fail-on-warning` flag to treat WARNING as blocking
- [ ] Comment update on re-run (instead of new comment)

## Later — if validated

- [ ] Score trend across PRs
- [ ] Team-level merge decision analytics
- [ ] Slack / Teams notification option

## Never (out of scope for CLI)

- SaaS dashboard
- Authentication / billing
- LLM-generated explanations
- Evaluation framework (run your own)
