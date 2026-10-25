import pytest
from app.services.safety.secret_detector import redact_secrets, scan_text_for_secrets, is_sensitive_file

def test_sensitive_filename_detection():
    assert is_sensitive_file(".env") is True
    assert is_sensitive_file(".env.production") is True
    assert is_sensitive_file("id_rsa") is True
    assert is_sensitive_file("server.key") is True
    assert is_sensitive_file("main.py") is False
    assert is_sensitive_file("README.md") is False

def test_secret_redaction_aws():
    text = 'AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"'
    redacted, detected = redact_secrets(text)
    assert "AKIAIOSFODNN7EXAMPLE" not in redacted
    assert "[REDACTED]" in redacted
    assert len(detected) == 1
    assert detected[0]["type"] == "AWS Access Key"

def test_secret_redaction_github_token():
    text = "const token = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';"
    redacted, detected = redact_secrets(text)
    assert "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890" not in redacted
    assert "[REDACTED]" in redacted

def test_secret_scan_lines():
    code = """
import os
# Normal config
API_KEY="abcdef1234567890abcdef"
print("hello")
"""
    findings = scan_text_for_secrets(code, "test.py")
    assert len(findings) >= 1
    assert findings[0]["line_number"] == 4
