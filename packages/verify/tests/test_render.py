import json

from vouqis_verify.config.schema import Config
from vouqis_verify.core.runner import EvalResult
from vouqis_verify.report.render import build_report


def _result(passed: bool, stdout: str = "", stderr: str = "") -> EvalResult:
    return EvalResult(
        passed=passed,
        exit_code=0 if passed else 1,
        stdout=stdout,
        stderr=stderr,
        duration_ms=1234,
        command="pytest",
    )


# ── verdict strings ────────────────────────────────────────────────────────────

def test_pass_no_ai_changes_is_safe_to_merge():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "SAFE TO MERGE" in md
    assert "✅" in md


def test_fail_is_block_merge():
    md = build_report(Config(), [], _result(False)).as_markdown()
    assert "BLOCK MERGE" in md
    assert "❌" in md


def test_pass_with_ai_changes_is_merge_with_warning():
    md = build_report(Config(), ["prompts/system.txt"], _result(True)).as_markdown()
    assert "MERGE WITH WARNING" in md
    assert "⚠️" in md


# ── confidence ─────────────────────────────────────────────────────────────────

def test_confidence_high_when_no_ai_changes_and_passing():
    assert build_report(Config(), [], _result(True)).confidence == "High"


def test_confidence_medium_when_ai_changes_and_passing():
    assert build_report(Config(), ["prompts/system.txt"], _result(True)).confidence == "Medium"


def test_confidence_high_when_failing():
    assert build_report(Config(), [], _result(False)).confidence == "High"


# ── Why section ────────────────────────────────────────────────────────────────

def test_why_section_present():
    assert "## Why" in build_report(Config(), [], _result(True)).as_markdown()


def test_why_explains_block_on_failure():
    md = build_report(Config(), [], _result(False)).as_markdown()
    assert "failed" in md


def test_why_explains_warning_on_ai_changes():
    md = build_report(Config(), ["prompts/system.txt"], _result(True)).as_markdown()
    assert "human review" in md


# ── What Changed section ──────────────────────────────────────────────────────

def test_what_changed_section_present():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "## What Changed" in md


def test_what_changed_shows_changed_path():
    md = build_report(Config(), ["prompts/system.txt"], _result(True)).as_markdown()
    assert "✓" in md
    assert "prompts/" in md


def test_what_changed_shows_no_change_for_untouched_path():
    # only prompts/ changed; src/agents/ should show no change
    md = build_report(Config(), ["prompts/system.txt"], _result(True)).as_markdown()
    assert "no change" in md


def test_what_changed_includes_eval_result():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "✅ PASS" in md


def test_what_changed_includes_duration():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "1,234ms" in md


# ── changed files (listed under Why) ─────────────────────────────────────────

def test_changed_files_listed():
    md = build_report(Config(), ["prompts/system.txt", "src/agents/chat.py"], _result(True)).as_markdown()
    assert "prompts/system.txt" in md
    assert "src/agents/chat.py" in md


# ── eval output ───────────────────────────────────────────────────────────────

def test_eval_output_in_details():
    md = build_report(Config(), [], _result(True, stdout="12 passed")).as_markdown()
    assert "12 passed" in md
    assert "<details>" in md


def test_long_output_is_truncated():
    md = build_report(Config(), [], _result(True, stdout="x" * 10_000)).as_markdown()
    assert "truncated" in md


# ── feedback ──────────────────────────────────────────────────────────────────

def test_feedback_question_present():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "Did this report change your merge decision?" in md


def test_feedback_options_present():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "Yes, I merged because of it" in md
    assert "Yes, I delayed or blocked" in md
    assert "confirmed what I knew" in md
    assert "not useful" in md


def test_custom_feedback_url():
    cfg = Config(feedback_url="https://forms.gle/test")
    md = build_report(cfg, [], _result(True)).as_markdown()
    assert "forms.gle/test" in md


# ── project_name ──────────────────────────────────────────────────────────────

def test_project_name_in_header():
    cfg = Config(project_name="My AI App")
    md = build_report(cfg, [], _result(True)).as_markdown()
    assert "My AI App" in md


def test_no_project_name_plain_header():
    md = build_report(Config(), [], _result(True)).as_markdown()
    assert "## Vouqis Verify\n" in md


# ── JSON output (FR-010) ──────────────────────────────────────────────────────

def test_json_is_valid():
    data = json.loads(build_report(Config(), [], _result(True)).as_json())
    assert data["verdict"] == "SAFE TO MERGE"


def test_json_has_required_keys():
    data = json.loads(build_report(Config(), [], _result(True)).as_json())
    for key in ("verdict", "confidence", "why", "changed_files", "eval"):
        assert key in data


def test_json_eval_block():
    data = json.loads(build_report(Config(), [], _result(True)).as_json())
    assert data["eval"]["passed"] is True
    assert data["eval"]["exit_code"] == 0
    assert data["eval"]["command"] == "pytest"


def test_json_block_merge_verdict():
    data = json.loads(build_report(Config(), [], _result(False)).as_json())
    assert data["verdict"] == "BLOCK MERGE"


def test_json_changed_files_listed():
    data = json.loads(build_report(Config(), ["prompts/system.txt"], _result(True)).as_json())
    assert "prompts/system.txt" in data["changed_files"]
    assert data["verdict"] == "MERGE WITH WARNING"
