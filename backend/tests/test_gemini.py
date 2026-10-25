import pytest
from unittest.mock import patch, MagicMock
from app.services.ai.gemini_provider import GeminiProvider, extract_json
from app.schemas.schemas import AIReasoningOutput

def test_extract_json_markdown_fences():
    raw = "```json\n{\"foo\": \"bar\", \"risk\": \"SAFE\"}\n```"
    parsed = extract_json(raw)
    assert parsed["foo"] == "bar"
    assert parsed["risk"] == "SAFE"

def test_extract_json_plain():
    raw = '{"key": "value"}'
    parsed = extract_json(raw)
    assert parsed["key"] == "value"

@pytest.mark.asyncio
async def test_gemini_is_available_without_key():
    provider = GeminiProvider(api_key="")
    available = await provider.is_available()
    assert available is False

@pytest.mark.asyncio
async def test_gemini_reasoning_fallback_when_unconfigured():
    provider = GeminiProvider(api_key="")
    finding = {
        "id": "f_test",
        "category": "duplicate",
        "title": "Duplicate file",
        "description": "Found duplicate file helper.js",
        "severity": "low",
        "evidence": ["identical hash"]
    }
    # When unconfigured, fallback must return SAFE for duplicate and recommend remove_duplicate_file
    res = await provider.reason_about_finding(finding, "print('test')")
    assert isinstance(res, AIReasoningOutput)
    assert res.risk == "SAFE"
    assert res.recommended_action == "remove_duplicate_file"
    assert res.can_auto_fix is True

@pytest.mark.asyncio
async def test_gemini_secret_redaction():
    provider = GeminiProvider(api_key="mock_key")
    finding = {
        "id": "f_sec",
        "category": "security",
        "title": "Secret in code",
        "description": "Hardcoded token",
        "severity": "critical",
        "evidence": []
    }
    secret_code = "AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE'\nprint('key loaded')"

    with patch.object(provider, "_generate") as mock_gen:
        mock_gen.return_value = '{"finding_id": "f_sec", "title": "Secret", "severity": "critical", "risk": "BLOCKED", "confidence": 0.99, "reason": "Secret detected", "evidence": ["Key found"], "recommended_action": "redact_secret", "can_auto_fix": false}'
        res = await provider.reason_about_finding(finding, secret_code)

        # Confirm _generate was called and did NOT leak the raw AWS key in the prompt
        args, kwargs = mock_gen.call_args
        prompt_text = args[0]
        assert "AKIAIOSFODNN7EXAMPLE" not in prompt_text
        assert "[REDACTED]" in prompt_text
        assert res.risk == "BLOCKED"
