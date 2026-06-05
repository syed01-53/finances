import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "%s %s -> %s (%.2fms)",
                method,
                path,
                response.status_code,
                duration_ms,
            )
            return response
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "%s %s failed after %.2fms",
                method,
                path,
                duration_ms,
            )
            raise
