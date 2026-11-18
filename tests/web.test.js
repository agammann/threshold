const {test}=require('node:test'); const assert=require('node:assert/strict'); const {compare, parseMeasurementDate, specs}=require('../core.js');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {runInNewContext} = require('node:vm');
const today=new Date('2026-10-29T12:00:00Z');
test('boundary, direction, unknown and provenance',()=>{const r=compare({width_cm:{value:90,date:'2026-01-01',source:'photo'},step_cm:{value:2,date:'2026-01-01',source:'measure'},turn_cm:null},{width_cm:90,step_cm:1,turn_cm:150},today);assert.match(r[0].lines.join(' '),/within/);assert.match(r[1].lines.join(' '),/outside/);assert.match(r[2].lines.join(' '),/Unknown measurement/)});
test('stale and future dates remain visible',()=>{const r=compare({width_cm:{value:90,date:'2020-01-01'},step_cm:{value:1,date:'2099-01-01'}},{width_cm:80,step_cm:2},today);assert.match(r[0].lines.join(' '),/over a year old/);assert.match(r[1].lines.join(' '),/Future date/)});
test('missing and invalid values never become a positive result',()=>{const r=compare({width_cm:{value:-1,date:'bad'},step_cm:{value:1,date:''}},{width_cm:80,step_cm:-1},today);assert.match(r[0].lines.join(' '),/Invalid measurement/);assert.match(r[1].lines.join(' '),/Invalid criterion/);assert.doesNotMatch(r[0].lines.join(' '),/within/);assert.match(r[2].lines.join(' '),/No personal criterion/)});
test('missing provenance is explicit',()=>{const r=compare({width_cm:{value:90,date:'',source:''}},{width_cm:80},today);assert.match(r[0].lines.join(' '),/Date unknown/);assert.match(r[0].lines.join(' '),/Source unknown/)});
test('zero, null and missing remain distinct from invalid numeric input',()=>{const r=compare({width_cm:{value:0},step_cm:{value:null},turn_cm:{}},{width_cm:0,step_cm:0,turn_cm:null},today);assert.match(r[0].lines.join(' '),/within/);assert.match(r[1].lines.join(' '),/Unknown measurement/);assert.match(r[2].lines.join(' '),/Unknown measurement/);assert.match(r[2].lines.join(' '),/No personal criterion/)});
test('nonfinite and invalid types are rejected even without criteria',()=>{for(const v of [NaN,Infinity,-Infinity,true,'90',-1]){const r=compare({width_cm:{value:v}},{},today)[0].lines.join(' ');assert.match(r,/Invalid measurement/);assert.doesNotMatch(r,/within/)}for(const v of [NaN,Infinity,-Infinity,true,'90',-1])assert.match(compare({}, {width_cm:v},today)[0].lines.join(' '),/Invalid criterion/);for(const v of [false,0,'x',[]])assert.match(compare({width_cm:v},{},today)[0].lines.join(' '),/Invalid measurement object/)});
test('strict route dates and old provenance remain visible without a criterion', () => {
  for (const value of [0, '20260101', '2026-02-30', '0000-01-01']) assert.equal(parseMeasurementDate(value), null);
  assert.equal(parseMeasurementDate('2024-02-29').toISOString().slice(0, 10), '2024-02-29');
  const lines = compare({width_cm: {value: 90, date: '2020-01-15', source: 'Fictional tape'}}, {}, today)[0].lines.join(' ');
  assert.match(lines, /90 cm.*over a year old.*Fictional tape/);
  assert.doesNotMatch(lines, /within/);
});

test('a pending route import cannot replace a later edit or newer import', async () => {
  class Element {
    value = '';
    files = [];
    listeners = {};
    append() {}
    replaceChildren() {}
    addEventListener(type, listener) { this.listeners[type] = listener; }
  }
  const inputs = new Map();
  const input = id => {
    if (!inputs.has(id)) inputs.set(id, Object.assign(new Element(), {id}));
    return inputs.get(id);
  };
  runInNewContext(readFileSync(join(__dirname, '..', 'app.js'), 'utf8'), {
    specs, compare, parseMeasurementDate,
    document: {querySelector: selector => input(selector.slice(1)), getElementById: input, createElement: () => new Element()},
  });
  const file = input('file');
  const route = input('route');
  const beginImport = text => {
    file.files = [{text: () => text}];
    return file.listeners.change({target: file});
  };

  let finishRead;
  const old = beginImport(new Promise(resolve => { finishRead = resolve; }));
  route.value = 'Fictional manual route';
  input('form').listeners.input({target: route});
  finishRead('{"route":"Earlier file"}');
  await old;
  assert.equal(route.value, 'Fictional manual route');

  const superseded = beginImport(new Promise(resolve => { finishRead = resolve; }));
  await beginImport('{"route":"Latest fictional file"}');
  finishRead('{"route":"Earlier file"}');
  await superseded;
  assert.equal(route.value, 'Latest fictional file');
});
