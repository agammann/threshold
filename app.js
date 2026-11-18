const fields=document.querySelector('#fields'), output=document.querySelector('#output');
for(const s of specs){const row=document.createElement('div');row.className='row';row.innerHTML=`<div><h3>${s.name}</h3><p>${s.description}</p></div><label>Measured (cm)<input id="${s.key}-value" type="number" min="0" step="any" inputmode="decimal"></label><label>Your ${s.criterion.toLowerCase()} (cm)<input id="${s.key}-criterion" type="number" min="0" step="any" inputmode="decimal"></label><label>Measurement date<input id="${s.key}-date" type="date"></label><label class="source">Source / photo description<input id="${s.key}-source" type="text" maxlength="500" placeholder="Who measured it, and where is the photo?"></label>`;fields.append(row)}
const get=id=>document.getElementById(id).value.trim();
function read(){const card={route:get('route')};const criteria={};for(const s of specs){const value=get(s.key+'-value'), date=get(s.key+'-date'), source=get(s.key+'-source'), criterion=get(s.key+'-criterion');card[s.key]=value===''&&!date&&!source?null:{value:value===''?null:Number(value),date,source};criteria[s.key]=criterion===''?null:Number(criterion)}return {card,criteria}}
function render(){const {card,criteria}=read();output.replaceChildren();const heading=document.createElement('p');heading.textContent=`Route: ${card.route||'Not specified — ask which route was measured'}. Confirm the whole route and other needs with the venue.`;output.append(heading);for(const item of compare(card,criteria)){const div=document.createElement('div');div.className='result';const h=document.createElement('strong');h.textContent=item.name;div.append(h);for(const line of item.lines){const p=document.createElement('p');p.textContent=line;div.append(p)}output.append(div)}}
const fileInput = document.querySelector('#file');
const importStatus = document.querySelector('#import-status');
let routeRevision = 0;
document.querySelector('#form').addEventListener('input', event => {
  if (event.target === fileInput) return;
  if (!event.target.id.endsWith('-criterion')) {
    routeRevision++;
    importStatus.textContent = '';
  }
  render();
});
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#export').addEventListener('click',()=>{const {card}=read();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(card,null,2)],{type:'application/json'}));a.download='threshold-route.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
fileInput.addEventListener('change', async () => {
  const selected = fileInput.files[0];
  const requested = ++routeRevision;
  importStatus.textContent = '';
  if (!selected) return;
  const isCurrent = () => requested === routeRevision && fileInput.files[0] === selected;
  try {
    const text = await selected.text();
    if (!isCurrent()) return;
    const card = JSON.parse(text);
    if (!card || typeof card !== 'object' || Array.isArray(card)) throw Error('Expected a route object.');
    if (card.route != null && typeof card.route !== 'string') throw Error('Invalid route name.');
    for (const {key, name} of specs) {
      const measurement = card[key];
      if (measurement == null) continue;
      if (typeof measurement !== 'object' || Array.isArray(measurement)) throw Error(`${name} needs a measurement object.`);
      if (measurement.value != null && (typeof measurement.value !== 'number' || !Number.isFinite(measurement.value) || measurement.value < 0)) {
        throw Error(`${name} needs a non-negative measurement.`);
      }
      if (measurement.date != null && measurement.date !== '' && parseMeasurementDate(measurement.date) === null) {
        throw Error(`${name} has an invalid measurement date.`);
      }
      if (measurement.source != null && typeof measurement.source !== 'string') throw Error(`${name} needs a text source.`);
    }
    document.querySelector('#route').value = card.route ?? '';
    for (const {key} of specs) {
      const measurement = card[key] ?? {};
      for (const part of ['value', 'date', 'source']) document.getElementById(`${key}-${part}`).value = measurement[part] ?? '';
    }
    render();
    importStatus.textContent = 'Route imported.';
  } catch (error) {
    if (isCurrent()) importStatus.textContent = `Could not import route. ${error.message}`;
  } finally {
    if (fileInput.files[0] === selected) fileInput.value = '';
  }
});
render();

