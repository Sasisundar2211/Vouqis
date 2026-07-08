from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from vouqis_verify.config.schema import Config
from vouqis_verify.core.runner import EvalResult

_FEEDBACK_BASE = "https://vouqis.tech/verify-feedback"
_OUTPUT_CAP = 3_000

_ICONS = {
    "SAFE TO MERGE": "✅",
    "MERGE WITH WARNING": "⚠️",
    "BLOCK MERGE": "❌",
}


def _verdict(result: EvalResult, changed_files: list[str]) -> str:
    if not result.passed:
        return "BLOCK MERGE"
    if changed_files:
        return "MERGE WITH WARNING"
    return "SAFE TO MERGE"


def _confidence(verdict: str) -> str:
    return "Medium" if verdict == "MERGE WITH WARNING" else "High"


def _why(result: EvalResult, changed_files: list[str], verdict: str) -> list[str]:
    if verdict == "BLOCK MERGE":
        reasons = [
            f"Evaluation command failed (exit code {result.exit_code}).",
            "Regressions may have been introduced.",
        ]
        if changed_files:
            reasons.append(f"{len(changed_files)} AI-related file(s) changed.")
        return reasons
    if verdict == "MERGE WITH WARNING":
        return [
            "Evaluation command completed successfully.",
            "AI behavior files changed — human review recommended.",
            "Existing tests cannot determine behavioral impact.",
        ]
    return [
        "Evaluation command completed successfully.",
        "No regressions detected.",
        "No AI-related files changed.",
    ]


def _categorize(ai_paths: list[str], changed_files: list[str]) -> list[tuple[str, int]]:
    counts: dict[str, int] = {p: 0 for p in ai_paths}
    for f in changed_files:
        for p in ai_paths:
            if f.startswith(p.rstrip("/")):
                counts[p] += 1
                break
    return [(p, counts[p]) for p in ai_paths]


@dataclass
class Report:
    verdict: str         # "SAFE TO MERGE" | "MERGE WITH WARNING" | "BLOCK MERGE"
    confidence: str      # "High" | "Medium"
    why: list[str]
    changed_files: list[str]
    result: EvalResult
    feedback_url: str
    project_name: Optional[str] = None
    ai_paths: list[str] = field(default_factory=list)

    def as_markdown(self) -> str:
        icon = _ICONS[self.verdict]
        title = f"Vouqis Verify — {self.project_name}" if self.project_name else "Vouqis Verify"
        fb = self.feedback_url

        lines = [f"## {title}", ""]

        # What Changed — file categories + eval metrics
        lines += ["## What Changed", "", "| | |", "|---|---|"]
        for path, count in _categorize(self.ai_paths, self.changed_files):
            label = f"✓ {count} file{'s' if count != 1 else ''} changed" if count else "— no change"
            lines.append(f"| `{path}` | {label} |")
        lines += [
            f"| **Evaluation** | {'✅ PASS' if self.result.passed else '❌ FAIL'} |",
            f"| **Duration** | {self.result.duration_ms:,}ms |",
            f"| **Exit code** | `{self.result.exit_code}` |",
        ]

        # Recommendation
        lines += [
            "",
            "## Recommendation",
            "",
            f"{icon} **{self.verdict}** — Confidence: {self.confidence}",
            "",
            "## Why",
            "",
        ]
        for reason in self.why:
            lines.append(f"• {reason}")

        if self.changed_files:
            lines.append("")
            lines.append("Changed: " + ", ".join(f"`{f}`" for f in self.changed_files))

        # Eval output (collapsible)
        output = (self.result.stdout + self.result.stderr).strip()
        if output:
            truncated = output[-_OUTPUT_CAP:] if len(output) > _OUTPUT_CAP else output
            prefix = f"_(truncated — showing last {_OUTPUT_CAP} chars)_\n\n" if len(output) > _OUTPUT_CAP else ""
            lines += [
                "",
                "<details>",
                f"<summary>Evaluation output — <code>{self.result.command}</code></summary>",
                "",
                prefix + "```",
                truncated,
                "```",
                "",
                "</details>",
            ]

        lines += [
            "",
            "---",
            "**Did this report change your merge decision?**",
            (
                f"[✅ Yes, I merged because of it]({fb}?decision=merged) · "
                f"[⚠️ Yes, I delayed or blocked]({fb}?decision=blocked) · "
                f"[➖ No, confirmed what I knew]({fb}?decision=confirmed) · "
                f"[❌ No, not useful]({fb}?decision=not-useful)"
            ),
            "",
            "*Powered by [Vouqis Verify](https://vouqis.tech)*",
        ]

        return "\n".join(lines)

    def as_terminal(self) -> str:
        icon = _ICONS[self.verdict]
        why_lines = "\n".join(f"    • {r}" for r in self.why)
        return (
            f"\n  {icon} {self.verdict}  ·  {self.confidence} confidence  ·  "
            f"{self.result.duration_ms:,}ms\n\n"
            f"  Why:\n{why_lines}\n"
        )


def build_report(cfg: Config, changed_files: list[str], result: EvalResult) -> Report:
    v = _verdict(result, changed_files)
    return Report(
        verdict=v,
        confidence=_confidence(v),
        why=_why(result, changed_files, v),
        changed_files=changed_files,
        result=result,
        feedback_url=cfg.feedback_url or _FEEDBACK_BASE,
        project_name=cfg.project_name,
        ai_paths=cfg.ai_paths,
    )
