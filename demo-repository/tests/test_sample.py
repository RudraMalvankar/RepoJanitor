import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.api.auth import verify_token, authenticate_user

def test_verify_token():
    assert verify_token("mock-dev-token") is True
    assert verify_token("short") is False
    assert verify_token("a" * 25) is True

def test_authenticate_user():
    res = authenticate_user("janitor_dev")
    assert res["user"] == "janitor_dev"
    assert res["status"] == "authenticated"
