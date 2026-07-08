from vouqis_verify.core.runner import run_eval


def test_passing_command():
    result = run_eval("exit 0")
    assert result.passed is True
    assert result.exit_code == 0


def test_failing_command():
    result = run_eval("exit 1")
    assert result.passed is False
    assert result.exit_code == 1


def test_captures_stdout():
    result = run_eval("echo hello")
    assert "hello" in result.stdout


def test_captures_stderr():
    result = run_eval("echo error >&2")
    assert "error" in result.stderr


def test_timeout_returns_failure():
    result = run_eval("sleep 10", timeout=1)
    assert result.passed is False
    assert result.exit_code == -1
    assert "timed out" in result.stderr


def test_duration_is_positive():
    result = run_eval("exit 0")
    assert result.duration_ms >= 0


def test_command_is_recorded():
    result = run_eval("exit 0")
    assert result.command == "exit 0"
