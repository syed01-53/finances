from datetime import date


def calculate_age(birth_date: date | None, reference: date | None = None) -> int | None:
    if not birth_date:
        return None
    today = reference or date.today()
    age = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    return age
