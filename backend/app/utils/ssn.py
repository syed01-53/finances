import re

_SSN_PATTERN = re.compile(r"^\d{3}-\d{2}-\d{4}$")


def normalize_ssn(value: str | None) -> str | None:
    if value is None:
        return None

    trimmed = value.strip()
    if not trimmed:
        return None

    digits = re.sub(r"\D", "", trimmed)
    if len(digits) != 9:
        raise ValueError("SSN must be 9 digits")

    return f"{digits[:3]}-{digits[3:5]}-{digits[5:]}"


def mask_ssn(value: str | None) -> str | None:
    if not value:
        return None

    digits = re.sub(r"\D", "", value)
    if len(digits) >= 4:
        return f"***-**-{digits[-4:]}"
    return None


def is_valid_ssn(value: str | None) -> bool:
    if value is None:
        return True
    try:
        normalized = normalize_ssn(value)
    except ValueError:
        return False
    return normalized is None or bool(_SSN_PATTERN.match(normalized))
