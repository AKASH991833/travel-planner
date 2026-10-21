/* TripCraft - itinerary generator, budget estimator, packing list. */
(()=>{
const $=s=>document.querySelector(s);
const INTERESTS=[['culture','Culture & history'],['food','Food'],['nature','Nature & views'],['beach','Beach'],['shopping','Markets & shopping']];
const chosen=new Set(['culture','food']);
let tier=1;
const destSel=$('#dest');
DESTS.forEach((d,i)=>destSel.add(new Option(d.name+'  ('+d.best+')',i)));
const iEl=$('#interests');
INTERESTS.forEach(([k,n])=>{const b=document.createElement('button');b.className='chip'+(chosen.has(k)?' on':'');b.textContent=n;
  b.onclick=()=>{chosen.has(k)?chosen.delete(k):chosen.add(k);b.classList.toggle('on');};iEl.append(b);});
document.querySelectorAll('#tier button').forEach(b=>b.onclick=()=>{
  tier=+b.dataset.t;document.querySelectorAll('#tier button').forEach(x=>x.classList.toggle('on',x===b));});
const SLOTS=['9:00 AM','11:30 AM','2:30 PM','5:30 PM','7:30 PM'];
const TMULT=[1,1.8,2.6,3.3];
function money(d,usd){const v=usd*(d.currency==='$'?1:d.fx);const t=tier===0?1:tier===1?1.9:3.4;
  return d.currency+Math.round(v*t).toLocaleString('en-US');}
function buildPlan(){
  const d=DESTS[+destSel.value],days=+$('#days').value,trav=+$('#travelers').value;
  // score activities by interest match
  const acts=d.acts.map(a=>({a,score:(chosen.has(a[1])?2:0.5)+a[2]/6}));
  acts.sort((x,y)=>y.score-x.score);
  // cluster by area: round-robin days over top picks keeping same-area together
  const perDay=Math.min(4,Math.max(2,Math.ceil(acts.length/days*0.9)));
  const used=new Set(),plan=[];
  for(let day=0;day<days;day++){
    const avail=acts.filter(x=>!used.has(x.a));
    if(!avail.length)break;
    const seedA=avail[0].a,area=seedA[4];
    const today=[seedA];used.add(seedA);
    for(const x of avail){if(today.length>=perDay)break;
      if(x.a[4]===area&&!used.has(x.a)){today.push(x.a);used.add(x.a);}}
    for(const x of avail){if(today.length>=perDay)break;
      if(!used.has(x.a)){today.push(x.a);used.add(x.a);}}
    plan.push(today);
  }
  // render
  const meta=$('#tripMeta');
  meta.innerHTML=`<span><b style="color:var(--ink)">${d.name}</b></span><span>${d.vibe}</span><span>Best: ${d.best}</span>`;
  const it=$('#itinerary');it.innerHTML='';
  plan.forEach((today,i)=>{
    const hours=today.reduce((s,a)=>s+a[2],0);
    const cost=today.reduce((s,a)=>s+a[3],0);
    const el=document.createElement('div');el.className='day'+(i===0?' open':'');
    el.innerHTML=`<div class="day-head"><span class="dn">${i+1}</span>
      <b>Day ${i+1} - ${today[0][4]}</b><span>${today.length} stops · ~${hours}h · ${money(d,cost)}</span></div>
      <div class="day-body">${today.map((a,j)=>`<div class="act">
        <span class="t">${SLOTS[Math.min(j,SLOTS.length-1)]}</span>
        <div class="d"><b>${a[0]}</b><span>${a[1][0].toUpperCase()+a[1].slice(1)} · ${a[2]}h · ${a[4]}</span></div>
        <span class="c">${a[3]?money(d,a[3]):'Free'}</span></div>`).join('')}</div>`;
    el.querySelector('.day-head').onclick=()=>el.classList.toggle('open');
    it.append(el);
  });
  // budget
  const actCost=acts.filter(x=>used.has(x.a)).reduce((s,x)=>s+x.a[3],0);
  const daily=d.budget[tier];
  const lodging=Math.round(daily*0.45*days),food=Math.round(daily*0.3*days),local=Math.round(daily*0.15*days);
  const acts2=actCost;
  const mult=TMULT[trav-1];
  const rows=[['Lodging ('+days+' nights)',lodging],['Food & drink',food],['Local transport',local],['Activities & tickets',acts2]];
  const sub=rows.reduce((s,r)=>s+r[1],0);
  const total=Math.round(sub*mult);
  const fmt=v=>d.currency+Math.round(v).toLocaleString('en-US');
  const colors=['#0e7490','#2dd4bf','#f59e0b','#8b5cf6'];
  $('#budgetBar').innerHTML=rows.map((r,i)=>`<i style="width:${r[1]/sub*100}%;background:${colors[i]}" title="${r[0]}"></i>`).join('');
  $('#budgetRows').innerHTML=rows.map(r=>`<div class="brow"><span>${r[0]}</span><span>${fmt(r[1])}</span></div>`).join('')
    +(trav>1?`<div class="brow"><span>Travelers multiplier (x${mult})</span><span>${fmt(sub*mult-sub)}</span></div>`:'')
    +`<div class="brow"><span>Estimated total</span><span>${fmt(total)}</span></div>`;
  // packing
  const cats=new Set(plan.flat().map(a=>a[1]));
  const pack=['Passport / ID + copies','Phone + charger + power bank','Universal adapter','Medications & first-aid kit'];
  if(cats.has('beach'))pack.push('Swimwear','Sunscreen SPF 50','Sunglasses','Flip-flops','Dry bag');
  if(cats.has('nature'))pack.push('Walking/hiking shoes','Daypack','Refillable water bottle','Light rain jacket');
  if(cats.has('culture'))pack.push('Modest outfit for temples','Comfortable walking shoes');
  if(cats.has('shopping'))pack.push('Foldable tote bag','Some cash in small notes');
  if(days>=7)pack.push('Laundry kit / extra outfits');
  pack.push('Offline maps downloaded','Travel insurance details');
  const pe=$('#pack');pe.innerHTML='';
  pack.forEach(p=>{const el=document.createElement('div');el.className='pack';
    el.innerHTML=`<span class="box"></span><span>${p}</span>`;
    el.onclick=()=>{el.classList.toggle('done');el.querySelector('.box').textContent=el.classList.contains('done')?'✓':'';
      const done=pe.querySelectorAll('.done').length;
      $('#packCount').textContent=done+' / '+pack.length+' packed';};
    pe.append(el);});
  $('#packCount').textContent='0 / '+pack.length+' packed';
}
$('#plan').onclick=()=>{buildPlan();toast('Itinerary rebuilt');};
buildPlan();
})();
