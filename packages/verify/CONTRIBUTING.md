# Contributing to Vouqis Verify

## Setup

```bash
cd packages/verify
pip install -e ".[dev]"
```

## Run tests

```bash
pytest
```

## Project layout

```
vouqis_verify/
├── cli.py          # Typer CLI entry point
├── config/
│   └── schema.py   # Pydantic config model + YAML loader
├── core/
│   ├── diff.py     # Git diff → changed AI files
│   └── runner.py   # Subprocess eval command runner
├── github/
│   └── pr.py       # GitHub REST API: post PR comment
└── report/
    └── render.py   # Markdown + terminal report builder
tests/
├── test_config.py
├── test_diff.py
├── test_runner.py
└── test_render.py
```

## Adding a feature

- Touch the minimum number of files
- Add a test in `tests/` that fails without your change
- Run `pytest` — all tests must pass

## Releasing

```bash
# Bump version in pyproject.toml and vouqis_verify/__init__.py
# Then:
pip install build twine
python -m build
twine upload dist/*
```
