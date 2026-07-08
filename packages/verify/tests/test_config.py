import tempfile
from pathlib import Path

import pytest
import yaml

from vouqis_verify.config.schema import Config, load_config, write_default_config


def test_defaults_when_file_missing():
    cfg = load_config(Path("/nonexistent/vouqis.yml"))
    assert cfg.eval_command == "pytest"
    assert cfg.baseline == "main"
    assert cfg.feedback_url is None


def test_loads_eval_command_from_file():
    with tempfile.NamedTemporaryFile(suffix=".yml", mode="w", delete=False) as f:
        yaml.dump({"eval_command": "promptfoo run", "baseline": "develop"}, f)
        path = Path(f.name)
    cfg = load_config(path)
    assert cfg.eval_command == "promptfoo run"
    assert cfg.baseline == "develop"


def test_loads_ai_paths():
    with tempfile.NamedTemporaryFile(suffix=".yml", mode="w", delete=False) as f:
        yaml.dump({"ai_paths": ["prompts/", "evals/"]}, f)
        path = Path(f.name)
    cfg = load_config(path)
    assert "prompts/" in cfg.ai_paths
    assert "evals/" in cfg.ai_paths


def test_write_default_creates_file():
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "vouqis.yml"
        write_default_config(path)
        assert path.exists()
        content = path.read_text()
        assert "eval_command" in content
        assert "ai_paths" in content


def test_write_default_raises_if_exists():
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "vouqis.yml"
        path.write_text("existing")
        with pytest.raises(FileExistsError):
            write_default_config(path)
