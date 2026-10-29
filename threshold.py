import argparse
import json
import math
from datetime import date
from pathlib import Path

FIELDS = {"width_cm": ("minimum clear width", "min"), "step_cm": ("maximum step height", "max"), "turn_cm": ("minimum turning space", "min")}

def valid_number(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float)) and value >= 0 and (isinstance(value, int) or math.isfinite(value)))

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
        if criterion is None:
            result.append(f'{label}: no criterion supplied; consider whether to ask about it.')
            continue
        if value is None:
            result.append(f'{label}: unknown; ask the venue for a measurement and date.')
            continue
        try:
            d = date.fromisoformat(measurement.get('date'))
            age = (today-d).days
            provenance = f'measured {d} ({age} days ago)' if age >= 0 else f'future date {d}; verify'
        except (ValueError, TypeError):
            provenance = 'date unknown; ask when measured'
        source = measurement.get('source') or 'source unknown; ask how measured'
        meets = value >= criterion if direction == 'min' else value <= criterion
        status = 'within' if meets else 'outside'
        result.append(f'{label}: {value} cm is {status} your {criterion} cm criterion; {provenance}; {source}. Confirm before visiting.')
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
