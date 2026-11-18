import argparse
import json
import math
from datetime import date
from pathlib import Path

FIELDS = {"width_cm": ("minimum clear width", "min"), "step_cm": ("maximum step height", "max"), "turn_cm": ("minimum turning space", "min")}

def valid_number(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float)) and value >= 0 and (isinstance(value, int) or math.isfinite(value)))

def measurement_date(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        return None
    return parsed if parsed.isoformat() == value else None

def compare(card, criteria, today=None):
    if not isinstance(card, dict) or not isinstance(criteria, dict):
        raise ValueError('route and criteria must be objects')
    today = today or date.today()
    result = []
    for key, (label, direction) in FIELDS.items():
        criterion = criteria.get(key)
        measurement = card.get(key)
        if criterion is not None and not valid_number(criterion):
            raise ValueError(f'{key}: invalid criterion')
        if measurement is not None and not isinstance(measurement, dict):
            raise ValueError(f'{key}: invalid measurement object')
        value = measurement.get('value') if measurement is not None else None
        if value is not None and not valid_number(value):
            raise ValueError(f'{key}: invalid measurement')
        parts = []
        if criterion is None:
            parts.append('no criterion supplied. Consider whether to ask about it.')
        if value is None:
            parts.append('unknown measurement. Ask the venue for a measurement and date.')
        else:
            if criterion is not None:
                meets = value >= criterion if direction == 'min' else value <= criterion
                status = 'within' if meets else 'outside'
                parts.append(f'{value} cm is {status} your {criterion} cm criterion.')
            else:
                parts.append(f'Measurement recorded as {value} cm.')
            measured = measurement_date(measurement.get('date'))
            if measured is None:
                parts.append('date unknown or invalid. Ask when this was measured.')
            else:
                age = (today - measured).days
                if age < 0:
                    parts.append(f'future date {measured}. Verify the date.')
                else:
                    parts.append(f'Measured {measured} ({age} days ago).')
                    if age > 365:
                        parts.append('This is over a year old. Ask for an update.')
            source = measurement.get('source')
            parts.append(f'Source: {source.strip()}.' if isinstance(source, str) and source.strip() else 'source unknown. Ask how it was measured.')
            parts.append('Confirm before visiting.')
        result.append(f"{label}: {' '.join(parts)}")
    return result

def reject_constant(value):
    raise ValueError(f'non-finite JSON number: {value}')

if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Compare a route with private criteria, locally.')
    p.add_argument('route', type=Path); p.add_argument('criteria', type=Path)
    args = p.parse_args()
    try:
        route = json.loads(args.route.read_text(encoding='utf-8-sig'), parse_constant=reject_constant)
        criteria = json.loads(args.criteria.read_text(encoding='utf-8-sig'), parse_constant=reject_constant)
        lines = compare(route, criteria)
        print('VISIT NOTES - not an access or safety guarantee')
        print('Route:', route.get('route', 'unnamed'))
        for line in lines: print('-', line)
    except (ValueError, OSError, AttributeError) as e: p.exit(2, f'Error: {e}\n')
