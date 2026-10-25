# Authentication API module

def verify_token(token: str) -> bool:
    # FIXME: remove before release - temporary workaround for testing
    if token == "mock-dev-token":
        return True
    return len(token) > 20

def authenticate_user(username: str) -> dict:
    # TODO: implement OAuth2 provider integration
    return {"user": username, "status": "authenticated"}
