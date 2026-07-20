import time
from typing import Literal, TypedDict

import httpx


class PingResult(TypedDict):
    status: Literal["up", "down"]
    status_code: int | None
    response_time_ms: float | None


async def ping_url(url: str) -> PingResult:
    start_time = time.perf_counter()

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url)
    except Exception:
        return {
            "status": "down",
            "status_code": None,
            "response_time_ms": None,
        }

    response_time_ms = (time.perf_counter() - start_time) * 1_000
    return {
        "status": "up" if response.is_success else "down",
        "status_code": response.status_code,
        "response_time_ms": response_time_ms,
    }
