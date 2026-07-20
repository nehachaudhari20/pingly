from urllib.parse import urlparse, urlunparse


def canonicalize_website_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.rstrip("/") if parsed.path not in ("", "/") else ""
    return urlunparse(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            path,
            "",
            parsed.query,
            "",
        )
    )
