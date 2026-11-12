"""Fictional teaching example: average equally sized client updates."""
def average_updates(updates):
    if not updates:
        return []
    return [sum(values) / len(values) for values in zip(*updates)]
