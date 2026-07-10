from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml


@dataclass
class Config:
    eval_command: str = 'pytest'
    baseline: str = 'main'
    ai_paths: list[str] = field(default_factory=lambda: ['prompts/', 'src/agents/', 'evals/'])
    timeout_seconds: int = 300
    feedback_url: Optional[str] = None
    project_name: Optional[str] = None


def load_config(path: Path) -> Config:
    if not path.exists():
        return Config()
    try:
        with open(path) as f:
            data = yaml.safe_load(f) or {}
        return Config(
            eval_command=data.get('eval_command', 'pytest'),
            baseline=data.get('baseline', 'main'),
            ai_paths=data.get('ai_paths', ['prompts/', 'src/agents/', 'evals/']),
            timeout_seconds=int(data.get('timeout_seconds', 300)),
            feedback_url=data.get('feedback_url'),
            project_name=data.get('project_name'),
        )
    except Exception:
        return Config()


def write_default_config(path: Path) -> None:
    if path.exists():
        raise FileExistsError(f'{path} already exists')
    path.write_text(
        'eval_command: pytest tests/eval/ -v\n'
        'baseline: main\n'
        'ai_paths:\n'
        '  - prompts/\n'
        '  - src/agents/\n'
        '  - evals/\n'
    )
