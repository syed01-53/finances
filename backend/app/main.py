import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from starlette import status

from app.api import api_router
from app.core.config import get_settings
from app.core.logging_config import setup_logging
from app.middleware.request_logging import RequestLoggingMiddleware

settings = get_settings()
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging(settings.log_level)
    logger.info("Starting %s", settings.app_name)
    logger.info("Log level: %s", settings.log_level.upper())
    logger.info("API routes mounted at /api")
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description="Financial reporting portal MVP demo API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.cors_origins.split(",")
        if origin.strip()
    ],
    allow_origin_regex=(
        r"https://.*\.vercel\.app"
        if settings.cors_allow_vercel_previews
        else None
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    if exc.status_code >= 500:
        logger.error(
            "%s %s -> %s: %s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.detail,
        )
    else:
        logger.warning(
            "%s %s -> %s: %s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.detail,
        )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(OperationalError)
async def db_connection_error_handler(
    request: Request, exc: OperationalError
) -> JSONResponse:
    logger.error(
        "Database connection failed on %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": (
                "Database connection failed. Verify PostgreSQL is running "
                "and DATABASE_URL in .env is correct."
            )
        },
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    logger.warning(
        "Validation error on %s %s: %s",
        request.method,
        request.url.path,
        exc.errors(),
    )
    messages = [
        error.get("msg", "Invalid value")
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "; ".join(messages) or "Validation failed"},
    )


@app.exception_handler(IntegrityError)
async def db_integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    logger.error(
        "Database integrity error on %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "A record with this value already exists."},
    )


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error(
        "Database error on %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred."},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception(
        "Unhandled error on %s %s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    logger.debug("Health check requested")
    return {"status": "ok"}
