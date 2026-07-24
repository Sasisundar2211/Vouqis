from unittest.mock import MagicMock, patch

import pytest

from vouqis_verify.github.pr import post_pr_comment


def _mock_response(status: int):
    m = MagicMock()
    m.__enter__ = MagicMock(return_value=m)
    m.__exit__ = MagicMock(return_value=False)
    m.status = status
    return m


# ── success ───────────────────────────────────────────────────────────────────

def test_succeeds_on_201():
    with patch("vouqis_verify.github.pr.urllib.request.urlopen", return_value=_mock_response(201)):
        post_pr_comment("owner/repo", 42, "token", "body")


def test_succeeds_on_200():
    with patch("vouqis_verify.github.pr.urllib.request.urlopen", return_value=_mock_response(200)):
        post_pr_comment("owner/repo", 42, "token", "body")


# ── failure ───────────────────────────────────────────────────────────────────

def test_raises_on_403():
    with patch("vouqis_verify.github.pr.urllib.request.urlopen", return_value=_mock_response(403)):
        with pytest.raises(RuntimeError, match="403"):
            post_pr_comment("owner/repo", 42, "token", "body")


def test_raises_on_404():
    with patch("vouqis_verify.github.pr.urllib.request.urlopen", return_value=_mock_response(404)):
        with pytest.raises(RuntimeError, match="404"):
            post_pr_comment("owner/repo", 42, "token", "body")


# ── request shape ─────────────────────────────────────────────────────────────

def test_posts_to_correct_url():
    captured = []

    def side_effect(req):
        captured.append(req)
        return _mock_response(201)

    with patch("vouqis_verify.github.pr.urllib.request.urlopen", side_effect=side_effect):
        post_pr_comment("myorg/myrepo", 99, "tok", "body")

    assert "myorg/myrepo" in captured[0].full_url
    assert "/issues/99/comments" in captured[0].full_url
    assert captured[0].method == "POST"


def test_sends_bearer_token():
    captured = []

    def side_effect(req):
        captured.append(req)
        return _mock_response(201)

    with patch("vouqis_verify.github.pr.urllib.request.urlopen", side_effect=side_effect):
        post_pr_comment("owner/repo", 1, "mytoken", "body")

    assert captured[0].get_header("Authorization") == "Bearer mytoken"
