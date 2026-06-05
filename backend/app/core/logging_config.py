import logging
import sys


LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: str = "INFO") -> None:
    log_level = getattr(logging, level.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logging.getLogger("app").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
