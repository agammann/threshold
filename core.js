const specs = [
 {key:'width_cm',name:'Clear width',criterion:'Minimum width',description:'Narrowest clear width on the route',direction:'min'},
 {key:'step_cm',name:'Step height',criterion:'Maximum step height',description:'Highest step on the route',direction:'max'},
 {key:'turn_cm',name:'Turning space',criterion:'Minimum turning space',description:'Smallest space available to turn',direction:'min'}
];
function parseMeasurementDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? parsed : null;
}

function compare(card, criteria, today = new Date()) {
  const validNumber = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  return specs.map(spec => {
    const measurement = card[spec.key], criterion = criteria[spec.key] ?? null;
    const validObject = measurement != null && typeof measurement === 'object' && !Array.isArray(measurement);
    const value = validObject ? measurement.value : null;
    const lines = [];
    if (criterion === null) lines.push('No personal criterion supplied. Consider whether to ask about this.');
    else if (!validNumber(criterion)) lines.push('Invalid criterion. Enter a non-negative number.');

    if (measurement != null && !validObject) lines.push('Invalid measurement object.');
    else if (value == null) lines.push('Unknown measurement. Ask the venue for a measurement.');
    else if (!validNumber(value)) lines.push('Invalid measurement. Enter a non-negative number.');

    if (validNumber(value)) {
      if (validNumber(criterion)) {
        const meets = spec.direction === 'min' ? value >= criterion : value <= criterion;
        lines.push(`${value} cm is ${meets ? 'within' : 'outside'} your ${criterion} cm criterion. Confirm the measurement before visiting.`);
      } else {
        lines.push(`Measurement recorded as ${value} cm.`);
      }
      const measured = parseMeasurementDate(measurement.date);
      if (measured === null) {
        lines.push('Date unknown or invalid. Ask when this was measured.');
      } else {
        const age = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - measured.valueOf()) / 86400000);
        if (age < 0) lines.push(`Future date ${measurement.date}. Verify the date.`);
        else {
          lines.push(`Measured ${measurement.date} (${age} days ago).`);
          if (age > 365) lines.push('This is over a year old. Ask for an update.');
        }
      }
      const source = typeof measurement.source === 'string' ? measurement.source.trim() : '';
      lines.push(source ? `Source: ${source}` : 'Source unknown. Ask how it was measured and whether a photo is available.');
    }
    return {name: spec.name, lines};
  });
}

if (typeof module !== 'undefined') module.exports = {compare, specs, parseMeasurementDate};
