import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from typer.testing import CliRunner

from vouqis_verify.cli import app

runner = CliRunner()


def _mock_git(returncode: int = 0):
    m = MagicMock()
    m.returncode = returncode
    return patch("vouqis_verify.cli.subprocess.run", return_value=m)


def test_doctor_passes_with_valid_config_and_git():
    with tempfile.TemporaryDirectory() as d:
        config = Path(d) / "vouqis.yml"
        config.write_text("eval_command: pytest\n")
        with _mock_git(0):
            result = runner.invoke(app, ["doctor", "--config", str(config)])
    assert result.exit_code == 0
    assert "Ready to verify" in result.output


def test_doctor_fails_when_config_missing():
    with _mock_git(0):
        result = runner.invoke(app, ["doctor", "--config", "/nonexistent/vouqis.yml"])
    assert result.exit_code == 1


def test_doctor_fails_when_not_in_git_repo():
    with tempfile.TemporaryDirectory() as d:
        config = Path(d) / "vouqis.yml"
        config.write_text("eval_command: pytest\n")
        with _mock_git(1):
            result = runner.invoke(app, ["doctor", "--config", str(config)])
    assert result.exit_code == 1


def test_doctor_shows_ci_vars_as_informational():
    with tempfile.TemporaryDirectory() as d:
        config = Path(d) / "vouqis.yml"
        config.write_text("eval_command: pytest\n")
        with _mock_git(0):
            result = runner.invoke(app, ["doctor", "--config", str(config)])
    assert "GITHUB_TOKEN" in result.output
    assert "PR_NUMBER" in result.output
