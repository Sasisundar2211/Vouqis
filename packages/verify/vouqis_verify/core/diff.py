from __future__ import annotations

import subprocess


def detect_ai_changes(ai_paths: list[str], baseline: str) -> list[str]:
    """Return AI-related files changed between baseline and HEAD."""
    changed = _git_diff_names(baseline)
    return [f for f in changed if _matches_any(f, ai_paths)]


def _git_diff_names(baseline: str) -> list[str]:
    # Try three-dot diff against origin first (GitHub Actions standard)
    for ref in (f"origin/{baseline}", baseline):
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{ref}...HEAD"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return [l for l in result.stdout.splitlines() if l]
    return []


def _matches_any(filepath: str, patterns: list[str]) -> bool:
    return any(filepath.startswith(p.rstrip("/")) for p in patterns)
