import re
import os
from typing import List, Dict, Tuple, Any

# Regex patterns for high-confidence secrets
SECRET_PATTERNS = [
    ("AWS Access Key", re.compile(r"\b(AKIA[0-9A-Z]{16})\b")),
    ("GitHub Personal Access Token", re.compile(r"\b(gh[pousr]_[A-Za-z0-9_]{36,})\b")),
    ("Slack API Token", re.compile(r"\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32})\b")),
    ("Generic API Key", re.compile(r"""(?i)(?:api[_-]?key|auth[_-]?token|access[_-]?token|secret[_-]?key)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{16,})['"]""")),
    ("Private Key Block", re.compile(r"-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE\s+KEY-----[\s\S]+?-----END\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE\s+KEY-----")),
    ("Database URL with Password", re.compile(r"""(?i)(postgres(?:ql)?|mysql|mongodb(?:(?:\+srv))?):\/\/[a-zA-Z0-9_\-\.]+:[^@\s]+@[a-zA-Z0-9_\-\.]+""")),
    ("Stripe Secret Key", re.compile(r"\b(sk_live_[0-9a-zA-Z]{24})\b")),
]

SENSITIVE_FILENAMES = {
    ".env", ".env.local", ".env.production", ".env.development", ".env.staging",
    "id_rsa", "id_ed25519", "id_ecdsa", "id_dsa",
    "credentials.json", "secrets.json", "service_account.json",
}

SENSITIVE_EXTENSIONS = {
    ".pem", ".key", ".pkcs12", ".pfx", ".p12", ".kdbx"
}

def is_sensitive_file(filename: str) -> bool:
    basename = os.path.basename(filename)
    if basename in SENSITIVE_FILENAMES or basename.startswith(".env."):
        return True
    _, ext = os.path.splitext(filename)
    if ext.lower() in SENSITIVE_EXTENSIONS:
        return True
    return False

def redact_secrets(text: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Scans text for secrets and replaces them with [REDACTED].
    Returns the sanitized text and a list of detected secret descriptions.
    """
    redacted_text = text
    detected: List[Dict[str, Any]] = []

    for label, pattern in SECRET_PATTERNS:
        matches = list(pattern.finditer(redacted_text))
        for match in reversed(matches):
            full_secret = match.group(0)
            # If pattern has a capturing group for the key, redact that group
            if match.groups():
                secret_val = match.group(1)
                replacement = match.group(0).replace(secret_val, "[REDACTED]")
            else:
                replacement = "[REDACTED_SECRET]"
            
            start, end = match.span()
            redacted_text = redacted_text[:start] + replacement + redacted_text[end:]
            detected.append({
                "type": label,
                "preview": f"{label} detected and redacted"
            })

    return redacted_text, detected

def scan_text_for_secrets(content: str, file_path: str) -> List[Dict[str, Any]]:
    """
    Scans file content line-by-line to identify line numbers of secrets.
    """
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for label, pattern in SECRET_PATTERNS:
            match = pattern.search(line)
            if match:
                findings.append({
                    "type": label,
                    "file_path": file_path,
                    "line_number": line_idx,
                    "description": f"Potential {label} exposed in source code. Value must be stored in secure secrets manager."
                })
                break  # avoid multiple findings on same line

    return findings
