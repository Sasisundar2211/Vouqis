from __future__ import annotations

import subprocess
import time
from dataclasses import dataclass


@dataclass
class EvalResult:
    passed: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int
    command: str


def run_eval(command: str, timeout: int = 300) -> EvalResult:
    start = time.monotonic()
    try:
        proc = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return EvalResult(
            passed=proc.returncode == 0,
            exit_code=proc.returncode,
            stdout=proc.stdout,
            stderr=proc.stderr,
            duration_ms=_elapsed_ms(start),
            command=command,
        )
    except subprocess.TimeoutExpired:
        return EvalResult(
            passed=False,
            exit_code=-1,
            stdout="",
            stderr=f"Evaluation timed out after {timeout}s",
            duration_ms=timeout * 1000,
            command=command,
        )


def _elapsed_ms(start: float) -> int:
    return int((time.monotonic() - start) * 1000)
