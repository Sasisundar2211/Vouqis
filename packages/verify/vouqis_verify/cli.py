from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console

from vouqis_verify import __version__
from vouqis_verify.config.schema import load_config, write_default_config
from vouqis_verify.core.diff import detect_ai_changes
from vouqis_verify.core.runner import run_eval
from vouqis_verify.github.pr import post_pr_comment
from vouqis_verify.report.render import build_report

app = typer.Typer(
    name="vouqis",
    help="Verify every AI change before it reaches production.",
    add_completion=False,
)
console = Console()
err = Console(stderr=True)


def _version(value: bool) -> None:
    if value:
        console.print(f"vouqis-verify {__version__}")
        raise typer.Exit()


@app.callback()
def _root(
    version: Optional[bool] = typer.Option(
        None, "--version", callback=_version, is_eager=True, help="Show version and exit."
    ),
) -> None:
    pass


@app.command()
def init(
    config: Path = typer.Option(Path("vouqis.yml"), "--config", "-c", help="Output path"),
) -> None:
    """Generate a default vouqis.yml in the current directory."""
    try:
        write_default_config(config)
        console.print(f"[green]Created[/green] {config}")
        console.print("Edit [bold]eval_command[/bold] and [bold]ai_paths[/bold] to match your project.")
    except FileExistsError as e:
        err.print(f"[red]Error:[/red] {e}")
        raise typer.Exit(1)


@app.command()
def verify(
    config: Path = typer.Option(Path("vouqis.yml"), "--config", "-c", help="Config file path"),
    base: Optional[str] = typer.Option(None, "--base", help="Base branch (overrides config)"),
    pr: Optional[int] = typer.Option(None, "--pr", envvar="PR_NUMBER", help="PR number for comment"),
    repo: Optional[str] = typer.Option(None, "--repo", envvar="GITHUB_REPOSITORY", help="owner/repo"),
    token: Optional[str] = typer.Option(None, "--token", envvar="GITHUB_TOKEN", help="GitHub token"),
    no_comment: bool = typer.Option(False, "--no-comment", help="Skip posting the PR comment"),
) -> None:
    """Run evaluation and generate a deployment review for the current PR."""
    cfg = load_config(config)
    baseline = base or cfg.baseline

    console.print(f"[bold]Vouqis Verify[/bold] [dim]──[/dim] comparing against [blue]{baseline}[/blue]")
    console.print(f"  eval: [dim]{cfg.eval_command}[/dim]")

    # 1. Detect changed AI files
    changed = detect_ai_changes(cfg.ai_paths, baseline)
    if changed:
        console.print(f"  AI files changed: {len(changed)}")
    else:
        console.print("  [dim]No AI files changed (running eval anyway)[/dim]")

    # 2. Run the evaluation command
    console.print(f"\n  [dim]Running:[/dim] {cfg.eval_command}")
    result = run_eval(cfg.eval_command, timeout=cfg.timeout_seconds)

    # 3. Build report
    report = build_report(cfg, changed, result)
    console.print(report.as_terminal())

    # 4. Post PR comment when env is set and --no-comment not given
    if not no_comment and pr and repo and token:
        try:
            post_pr_comment(repo, pr, token, report.as_markdown())
            console.print(f"  [green]Commented on[/green] {repo}#{pr}")
        except Exception as exc:
            err.print(f"  [yellow]Warning:[/yellow] could not post PR comment — {exc}")
    elif not no_comment and (pr or repo):
        err.print("  [dim]Skipping PR comment (GITHUB_TOKEN, PR_NUMBER, or GITHUB_REPOSITORY not set)[/dim]")

    if not result.passed:
        raise typer.Exit(1)


@app.command()
def doctor(
    config: Path = typer.Option(Path("vouqis.yml"), "--config", "-c", help="Config file path"),
) -> None:
    """Validate configuration and environment."""
    ok = True

    if config.exists():
        try:
            load_config(config)
            console.print(f"[green]✓[/green]  config {config}")
        except Exception as exc:
            err.print(f"[red]✗[/red]  config invalid: {exc}")
            ok = False
    else:
        err.print(f"[red]✗[/red]  {config} not found — run [bold]vouqis init[/bold]")
        ok = False

    git_ok = subprocess.run(["git", "rev-parse", "--git-dir"], capture_output=True).returncode == 0
    if git_ok:
        console.print("[green]✓[/green]  git repository detected")
    else:
        err.print("[red]✗[/red]  not inside a git repository")
        ok = False

    for var in ("GITHUB_TOKEN", "GITHUB_REPOSITORY", "PR_NUMBER"):
        if os.environ.get(var):
            console.print(f"[green]✓[/green]  {var}")
        else:
            console.print(f"[dim]─[/dim]  {var} [dim](required in CI)[/dim]")

    console.print()
    if ok:
        console.print("[green]Ready to verify.[/green]")
    else:
        err.print("[red]Fix the issues above before running vouqis verify.[/red]")
        raise typer.Exit(1)
