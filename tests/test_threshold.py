import json
import subprocess
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path
from threshold import compare
class Tests(unittest.TestCase):
 def test_directions_and_boundaries(self):
  card={k:{'value':v,'date':'2026-01-01','source':'photo'} for k,v in [('width_cm',90),('step_cm',2),('turn_cm',150)]}
  r=compare(card,{'width_cm':90,'step_cm':1,'turn_cm':150},date(2026,1,2))
  self.assertIn('within',r[0]); self.assertIn('outside',r[1]); self.assertIn('within',r[2])
 def test_missing_and_null_are_unknown(self):
  for card in [{},{'width_cm':None},{'width_cm':{}},{'width_cm':{'value':None}}]:
   with self.subTest(card=card): self.assertIn('unknown',compare(card,{'width_cm':80})[0])
  for criteria in [{},{'width_cm':None}]: self.assertIn('no criterion',compare({},criteria)[0])
 def test_zero_is_valid(self):
  self.assertIn('within',compare({'step_cm':{'value':0}},{'step_cm':0})[1])
 def test_provenance(self):
  r=compare({'width_cm':{'value':80,'date':'2099-01-01'},'step_cm':{'value':0}}, {'width_cm':80,'step_cm':0}, date(2026,1,1)); self.assertIn('future date',r[0]); self.assertIn('source unknown',r[0]); self.assertIn('date unknown',r[1])
 def test_invalid_measurements_even_without_criterion(self):
  for v in [-1,True,'90',float('nan'),float('inf'),float('-inf')]:
   with self.subTest(v=v):
    with self.assertRaisesRegex(ValueError,'invalid measurement'): compare({'width_cm':{'value':v}}, {})
 def test_invalid_criteria(self):
  for v in [-1,True,'90',float('nan'),float('inf'),float('-inf')]:
   with self.subTest(v=v):
    with self.assertRaisesRegex(ValueError,'invalid criterion'): compare({}, {'width_cm':v})
 def test_invalid_measurement_object(self):
  for v in [False,0,'x',[]]:
   with self.subTest(v=v):
    with self.assertRaisesRegex(ValueError,'invalid measurement object'): compare({'width_cm':v},{})
 def test_cli_rejects_nonfinite_json_and_overflow(self):
  for number in ['NaN','Infinity','-Infinity','1e999']:
   with self.subTest(number=number), tempfile.TemporaryDirectory(dir=".") as temp:
    route=Path(temp)/'route.json'; criteria=Path(temp)/'criteria.json'
    route.write_text('{"width_cm":{"value":'+number+'}}'); criteria.write_text('{}')
    p=subprocess.run([sys.executable,'threshold.py',str(route),str(criteria)],capture_output=True,text=True)
    self.assertEqual(p.returncode,2); self.assertNotIn('VISIT NOTES',p.stdout); self.assertIn('Error:',p.stderr)
