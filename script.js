/* ---------------- LOGIN ---------------- */
function doLogin(){
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-err');
  if(u === 'admin' && p === 'admin123'){
    err.classList.remove('show');
    document.getElementById('login-screen').classList.remove('active');
    const dash = document.getElementById('dash-screen');
    buildAll();
    showPage(1);
    dash.classList.add('active');
    dash.classList.add('enter');
  } else { err.classList.add('show'); }
}
function doLogout(){
  document.getElementById('dash-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-user').value=''; document.getElementById('login-pass').value='';
}

/* ---------------- PAGINATION / SIDEBAR NAV ---------------- */
const pageTitles = {1:'Live Slots',2:'ML Predictor',3:'Demand Curve',4:'SQL Engine',5:'Decision Hub',6:'Zone A Console',7:'Zone B Console',8:'Zone C Console'};
let currentPage = 1;
function showPage(n){
  currentPage = n;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+n).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(it=>it.classList.toggle('active', +it.dataset.p===n));
  document.getElementById('page-pill').textContent = 'PAGE '+n+'/8';
  document.getElementById('page-heading').textContent = pageTitles[n];
  document.getElementById('prevBtn').disabled = (n===1);
  document.getElementById('nextBtn').disabled = (n===8);
  document.getElementById('nextBtn').textContent = (n===8)?'End →':'Next →';
  document.querySelectorAll('#pg-dots .d').forEach((d,i)=>d.classList.toggle('active', i+1===n));
  document.querySelector('.page-body').scrollTo({top:0});
  window.scrollTo({top:0,behavior:'smooth'});
}
function stepPage(dir){
  const n = currentPage+dir;
  if(n>=1 && n<=8) showPage(n);
}
function buildDots(){
  const wrap = document.getElementById('pg-dots'); wrap.innerHTML='';
  for(let i=1;i<=8;i++){
    const d=document.createElement('div'); d.className='d'+(i===1?' active':'');
    d.onclick=()=>showPage(i);
    wrap.appendChild(d);
  }
}

/* ---------------- gauge generator ---------------- */
function gaugeSVG(percent,color){
  const r=50, cx=60, cy=65, circ=Math.PI*r;
  const dash = (percent/100)*circ;
  return `<svg viewBox="0 0 120 72" style="width:120px;height:72px;">
    <path d="M10,65 A50,50 0 0 1 110,65" fill="none" stroke="#EEF2F7" stroke-width="10" stroke-linecap="round"/>
    <path d="M10,65 A50,50 0 0 1 110,65" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${dash} ${circ}"/>
  </svg>`;
}
function buildGaugeRow(elId, items){
  document.getElementById(elId).innerHTML = items.map(it=>`
    <div class="card gauge-card">
      ${gaugeSVG(it.pct, it.color)}
      <div class="g-val" style="color:${it.color}">${it.pct}%</div>
      <div class="g-label">${it.label}</div>
    </div>`).join('');
}

/* ---------------- MODULE 1: hourly log ---------------- */
function buildHourlyLog(){
  const rows = [
    ['13:00','30','12','80','218','Clear'],['14:00','29','11','77','223','Clear'],
    ['15:00','27','10','74','229','Clear'],['16:00','25','9','72','234','Cloudy'],
    ['17:00','24','8','75','233','Cloudy'],['18:00','26','7','72','235','Cloudy'],
    ['19:00','28','9','78','225','Clear'],['20:00','33','14','85','208','Clear'],
    ['21:00','41','22','96','181','Clear'],['22:00','52','31','108','149','Clear'],
    ['23:00','66','44','119','111','Clear'],['00:00','78','55','128','79','Clear'],
  ];
  document.getElementById('hourly-log').innerHTML = rows.map(r=>`<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td></tr>`).join('');
}

/* ---------------- MODULE 2: simulator ---------------- */
function recompute(){
  const zone = document.getElementById('sim-zone').value;
  const time = +document.getElementById('sim-time').value;
  const occ = +document.getElementById('sim-occ').value;
  const day = document.getElementById('sim-day').value;
  const rain = document.getElementById('sim-rain').checked;
  const event = document.getElementById('sim-event').checked;
  document.getElementById('sim-time-label').textContent = String(time).padStart(2,'0')+':00';
  document.getElementById('sim-occ-label').textContent = occ+'%';
  const cap = {A:120,B:80,C:150}[zone];
  let base = occ;
  if(time>=16 && time<=19) base += 8;
  if(day==='Friday Evening') base += 6;
  if(day==='Saturday' && zone==='A') base -= 12;
  if(day==='Sunday' && zone==='A') base -= 15;
  if(rain) base += 5;
  if(event) base += 10;
  base = Math.max(5, Math.min(99, base));
  const free = Math.max(0, Math.round(cap*(1-base/100)));
  document.getElementById('sim-occ-out').textContent = base.toFixed(1)+'%';
  document.getElementById('sim-free-out').textContent = '~'+free;
  const riskEl = document.getElementById('sim-risk'); const recoEl = document.getElementById('sim-reco');
  const zoneName = {A:'Zone A — Commercial',B:'Zone B — Shopping Mall',C:'Zone C — Metro Hub'}[zone];
  if(base>=88){ riskEl.textContent='HIGH CONGESTION'; riskEl.className='pill red';
    const alt = zone==='B' ? 'Zone C — Metro Hub' : (zone==='A' ? 'Zone C — Metro Hub' : 'Zone A — Commercial');
    recoEl.textContent = `🚦 Smart decision: critical congestion risk detected for ${zoneName}. Recommend auto-routing incoming vehicles to ${alt}.`;
  } else if(base>=65){ riskEl.textContent='MODERATE'; riskEl.className='pill amber';
    recoEl.textContent = `🚦 Smart decision: ${zoneName} approaching capacity. Monitor for the next 30 minutes before triggering diversion.`;
  } else { riskEl.textContent='LOW CONGESTION'; riskEl.className='pill green';
    recoEl.textContent = `🚦 Smart decision: ${zoneName} has healthy headroom. No action required.`;
  }
}

/* ---------------- MODULE 3: demand curve ---------------- */
function gauss(x,mu,sig,amp){return amp*Math.exp(-Math.pow(x-mu,2)/(2*sig*sig));}
function curveForZone(z){
  const hours = Array.from({length:24},(_,i)=>i);
  if(z==='A') return hours.map(h=>10+gauss(h,9,3,80));
  if(z==='B') return hours.map(h=>8+gauss(h,17,3.4,84));
  return hours.map(h=>10+gauss(h,7.5,1.8,82)+gauss(h,17.5,2.4,42));
}
function buildDemand(){
  const hours = Array.from({length:24},(_,i)=>i);
  const A = curveForZone('A');
  const B = curveForZone('B');
  const C = curveForZone('C');
  function toPts(arr){ return arr.map((v,i)=>{ const x=(i/(arr.length-1))*700+10; const y=250-(Math.min(v,100)/100)*230; return x+','+y; }).join(' '); }
  const svg = document.getElementById('demand-svg');
  let grid='';
  for(let g=0; g<=100; g+=25){ const y=250-(g/100)*230; grid += `<line x1="10" y1="${y}" x2="710" y2="${y}" stroke="#EEF2F7" stroke-width="1"/><text x="0" y="${y+4}" font-size="10" fill="#94A1B2">${g}</text>`; }
  svg.innerHTML = grid + `<polyline points="${toPts(A)}" fill="none" stroke="#2563EB" stroke-width="2.5"/>` + `<polyline points="${toPts(B)}" fill="none" stroke="#DC3B36" stroke-width="2.5"/>` + `<polyline points="${toPts(C)}" fill="none" stroke="#0E8F5E" stroke-width="2.5"/>`;
  document.getElementById('demand-table').innerHTML = hours.map(h=>`<tr><td class="mono">${String(h).padStart(2,'0')}:00</td><td>${A[h].toFixed(0)}%</td><td>${B[h].toFixed(0)}%</td><td>${C[h].toFixed(0)}%</td></tr>`).join('');
}

/* ---------------- MODULE 4: SQL tabs ---------------- */
const queries = [
{ code:`<span class="k">SELECT</span> zone,\n       <span class="f">ROUND</span>(<span class="f">AVG</span>(occupancy_rate), 2) <span class="k">AS</span> avg_occ_pct,\n       <span class="f">MAX</span>(occupied_slots) <span class="k">AS</span> peak_occupied,\n       <span class="f">ROUND</span>(<span class="f">AVG</span>(free_slots), 0) <span class="k">AS</span> avg_free_slots\n<span class="k">FROM</span> parking_transactions\n<span class="k">WHERE</span> is_weekend = 1\n<span class="k">GROUP BY</span> zone\n<span class="k">ORDER BY</span> avg_occ_pct <span class="k">DESC</span>;`,
  cols:['Zone','Avg occupancy','Peak occupied','Avg free'], rows:[['Zone B (Shopping)','91.4%','78/80','7'],['Zone C (Transit)','68.2%','132/150','48'],['Zone A (Commercial)','39.6%','55/120','73']] },
{ code:`<span class="k">SELECT</span> zone, <span class="f">HOUR</span>(timestamp) <span class="k">AS</span> hr,\n       <span class="f">ROUND</span>(<span class="f">AVG</span>(occupancy_rate),2) <span class="k">AS</span> avg_occ\n<span class="k">FROM</span> parking_transactions\n<span class="k">GROUP BY</span> zone, hr\n<span class="k">ORDER BY</span> avg_occ <span class="k">DESC</span>\n<span class="k">LIMIT</span> 5;`,
  cols:['Zone','Hour','Avg occupancy'], rows:[['Zone B','17:00','90.8%'],['Zone A','08:00','88.1%'],['Zone C','07:00','89.6%'],['Zone B','18:00','87.4%'],['Zone C','08:00','85.9%']] },
{ code:`<span class="k">SELECT</span> zone, <span class="f">DATE</span>(timestamp) <span class="k">AS</span> day,\n       <span class="f">MIN</span>(free_slots) <span class="k">AS</span> lowest_free\n<span class="k">FROM</span> parking_transactions\n<span class="k">WHERE</span> timestamp >= <span class="c">DATE_SUB(NOW(), INTERVAL 7 DAY)</span>\n<span class="k">GROUP BY</span> zone, day\n<span class="k">ORDER BY</span> day;`,
  cols:['Zone','Day','Lowest free slots'], rows:[['Zone B','Mon','9'],['Zone B','Tue','6'],['Zone A','Wed','19'],['Zone C','Thu','44']] }];
function showQuery(i, btn){
  document.querySelectorAll('.tabbtns button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const q = queries[i];
  document.getElementById('query-code').innerHTML = q.code;
  const tbl = document.getElementById('query-result');
  tbl.innerHTML = `<thead><tr>${q.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${q.rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>`;
}

/* ---------------- MODULE 6/7/8: zone portal full pages ---------------- */
const zoneCfg = {
  A:{name:'Zone A — Commercial Hub', tag:'IT Park & Corporate · 120 slots', color:'#2563EB', bg:'var(--blue-600)', user:'zonea.admin', pass:'zoneA@120', trend:[70,74,72,76,80,55,48], today:78,
     vmix:[64,22,14], vehiclesToday:412, dayNote:'Peaks around 9 AM as the IT park shift begins, then holds a wide plateau through the workday before tapering off after 6 PM.',
     incidents:[['22 Aug','Sensor fault','Bay A-114 recalibrated after false-occupied reading'],['19 Aug','Overstay','Vehicle in bay A-42 exceeded 12h limit, towed'],['15 Aug','Payment issue','Gate reader offline 20 min, manual override used']]},
  B:{name:'Zone B — Shopping Mall', tag:'Retail & Cinema Complex · 80 slots', color:'#DC3B36', bg:'var(--red)', user:'zoneb.admin', pass:'zoneB@80', trend:[80,82,85,88,93,90,86], today:91,
     vmix:[55,33,12], vehiclesToday:689, dayNote:'Builds slowly through the afternoon and peaks near 5 PM as mall footfall and cinema shows overlap.',
     incidents:[['23 Aug','Near-full alert','Occupancy hit 96% at 6:40 PM, diversion signage activated'],['20 Aug','Minor collision','Reported in row 3, resolved by mall security'],['17 Aug','Sensor fault','Bay B-08 offline for 3 hours, camera fallback used']]},
  C:{name:'Zone C — Metro Transit', tag:'Commuter Station · 150 slots', color:'#0E8F5E', bg:'var(--green)', user:'zonec.admin', pass:'zoneC@150', trend:[55,58,60,57,62,45,40], today:52,
     vmix:[48,40,12], vehiclesToday:1024, dayNote:'Sharpest peak around 7:30 AM as commuters arrive, with a smaller evening return spike near 5:30 PM.',
     incidents:[['21 Aug','Long-stay vehicle','Bay C-77 occupied 5 days, flagged for enforcement'],['18 Aug','EV charger fault','2 of 6 charging bays offline, vendor ticket raised'],['12 Aug','Gate malfunction','Entry gate 2 stuck open for 40 min, security notified']]}
};
const zonePageOf = {A:6,B:7,C:8};
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildZonePage(z){
  const cfg = zoneCfg[z]; const n = zonePageOf[z];
  const sec = document.getElementById('page-'+n);
  sec.innerHTML = `
    <div class="eyebrow">Zone Portal</div>
    <h1 class="mod-title">${cfg.name} Operator Console</h1>
    <p class="mod-sub">${cfg.tag}. Sign in with the zone-specific operator account to view pricing history and live analysis.</p>

    <div class="card zone-gate" id="gate-${z}">
      <div class="zg-icon" style="background:${cfg.bg}">${z}</div>
      <h2>Sign in to Zone ${z}</h2>
      <p>This console is separate from the main dashboard login.</p>
      <div class="zg-err" id="zg-err-${z}">Incorrect username or password for Zone ${z}.</div>
      <div class="field"><label>Username</label><input type="text" id="zu-${z}" placeholder="${cfg.user}"></div>
      <div class="field"><label>Password</label><input type="password" id="zp-${z}" placeholder="••••••••"></div>
      <button class="btn-primary" style="background:${cfg.bg};background-image:none;" onclick="zoneLogin('${z}')">Open Zone ${z} Console →</button>
      <p class="demo-hint">Demo: <b>${cfg.user}</b> / <b>${cfg.pass}</b></p>
    </div>

    <div class="zone-analysis" id="analysis-${z}">
      <div class="card" style="padding:22px 24px;">
        <div class="zd-topline">
          <div><b style="font-size:15px;">Signed in as ${cfg.user}</b><div style="font-size:12px;color:var(--muted);">${cfg.name}</div></div>
          <span class="signout" onclick="zoneLogout('${z}')">Sign out of Zone ${z} ×</span>
        </div>
      </div>

      <div class="section-title">Today's status</div>
      <div class="grid-2-1">
        <div class="card donut-wrap">
          <div class="donut" style="background:conic-gradient(${cfg.color} 0% ${cfg.today}%, var(--surface-2) ${cfg.today}% 100%);">
            <div class="hole"><b>${cfg.today}%</b><span>Occupied</span></div>
          </div>
          <div class="donut-legend">
            <div class="dl-row"><span class="lbl"><span class="sw" style="background:${cfg.color}"></span>Occupied</span><b>${cfg.today}%</b></div>
            <div class="dl-row"><span class="lbl"><span class="sw" style="background:var(--surface-2)"></span>Free</span><b>${100-cfg.today}%</b></div>
          </div>
        </div>
        <div class="card" style="padding:18px 20px;">
          <div style="font-size:11.5px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.05em;margin-bottom:12px;">Alert summary</div>
          <div class="alert-box" style="background:var(--surface);"><div class="l"><b>Predicted +30 min</b><span style="color:var(--muted)">Model forecast</span></div><div class="num">${Math.min(99,cfg.today+4)}%</div></div>
          <div class="alert-box" style="background:var(--surface);margin-bottom:0;"><div class="l"><b>Active pricing rule</b><span style="color:var(--muted)">Decision Hub</span></div><div class="num" style="font-size:14px;">${z==='B'?'+25% surge':(z==='A'?'-20% weekend':'None')}</div></div>
        </div>
      </div>

      <div class="section-title">7-day occupancy trend</div>
      <div class="card" style="padding:22px 24px;">
        <div class="trend-cluster" id="trend-${z}"></div>
        <div class="trend-labels" id="trendlbl-${z}"></div>
      </div>

      <div class="section-title">Typical 24-hour occupancy pattern</div>
      <div class="card" style="padding:24px 26px;">
        <svg id="zonechart-${z}" viewBox="0 0 700 190" style="width:100%;height:210px;" preserveAspectRatio="none"></svg>
        <p style="font-size:12.5px;color:var(--muted);margin:14px 0 0;line-height:1.6;">${cfg.dayNote}</p>
      </div>

      <div class="section-title">Vehicle mix &amp; incidents</div>
      <div class="grid-2-1">
        <div class="card donut-wrap" style="align-items:center;">
          <div class="donut" style="background:conic-gradient(${cfg.color} 0% ${cfg.vmix[0]}%, ${cfg.color}99 ${cfg.vmix[0]}% ${cfg.vmix[0]+cfg.vmix[1]}%, var(--surface-2) ${cfg.vmix[0]+cfg.vmix[1]}% 100%);">
            <div class="hole"><b>${cfg.vehiclesToday}</b><span>Vehicles today</span></div>
          </div>
          <div class="donut-legend">
            <div class="dl-row"><span class="lbl"><span class="sw" style="background:${cfg.color}"></span>Cars</span><b>${cfg.vmix[0]}%</b></div>
            <div class="dl-row"><span class="lbl"><span class="sw" style="background:${cfg.color}99"></span>Two-wheelers</span><b>${cfg.vmix[1]}%</b></div>
            <div class="dl-row"><span class="lbl"><span class="sw" style="background:var(--surface-2)"></span>EV / other</span><b>${cfg.vmix[2]}%</b></div>
          </div>
        </div>
        <div class="card scroll-table" style="max-height:none;">
          <table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Note</th></tr></thead>
            <tbody>${cfg.incidents.map(r=>`<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>

      <div class="section-title">Pricing history</div>
      <div class="card scroll-table"><table class="data-table"><thead><tr><th>Date</th><th>Rule</th><th>Avg occupancy</th><th>Revenue</th></tr></thead><tbody id="hist-${z}"></tbody></table></div>

      <div class="section-title">Recommendation</div>
      <div class="reco-box">${z==='A' ? '🚦 Hold base pricing on weekdays; apply the weekend discount consistently — occupancy has stayed under 55% on the last 4 Saturdays.'
        : z==='B' ? '🚦 Extend the +25% surge window by one hour on Fridays — occupancy is still above 88% at 8 PM.'
        : '🚦 Promote Zone C as overflow for Zone B diversions — average headroom of 68 free slots during Zone B\'s surge window.'}</div>

      <footer class="credit">© 2026 Smart Parking Slot Prediction and Parking Congestion Intelligence System.</footer>
    </div>
  `;

  // trend bars
  const wrap = document.getElementById('trend-'+z); const lbl = document.getElementById('trendlbl-'+z);
  wrap.innerHTML=''; lbl.innerHTML='';
  days.forEach((d,i)=>{
    const v = cfg.trend[i];
    wrap.innerHTML += `<div class="tb" style="height:${v}%;background:${cfg.color};opacity:${0.5+(v/100)*0.5}"><span>${v}%</span></div>`;
    lbl.innerHTML += `<div>${d}</div>`;
  });
  document.getElementById('hist-'+z).innerHTML = days.map((d,i)=>{
    const v = cfg.trend[i];
    const rule = z==='B' ? '+25% surge' : (z==='A' && i>=5 ? '-20% discount' : 'Base rate');
    const rev = (8000 + v*120 + i*140).toLocaleString('en-IN');
    return `<tr><td>${d}</td><td>${rule}</td><td>${v}%</td><td>₹${rev}</td></tr>`;
  }).join('');
  buildZoneChart(z);
}
function buildZoneChart(z){
  const cfg = zoneCfg[z];
  const arr = curveForZone(z);
  const svg = document.getElementById('zonechart-'+z);
  if(!svg) return;
  function toPts(a){ return a.map((v,i)=>{ const x=(i/(a.length-1))*680+14; const y=160-(Math.min(v,100)/100)*140; return x+','+y; }).join(' '); }
  let grid='';
  for(let g=0; g<=100; g+=25){ const y=160-(g/100)*140; grid += `<line x1="14" y1="${y}" x2="694" y2="${y}" stroke="#EEF2F7" stroke-width="1"/><text x="0" y="${y+4}" font-size="10" fill="#94A1B2">${g}</text>`; }
  const xlabels = [0,4,8,12,16,20].map(h=>{ const x=(h/23)*680+14; return `<text x="${x}" y="178" font-size="10" fill="#94A1B2" text-anchor="middle">${String(h).padStart(2,'0')}:00</text>`; }).join('');
  const pts = toPts(arr);
  const area = `14,160 ${pts} 694,160`;
  svg.innerHTML = grid + xlabels + `<polygon points="${area}" fill="${cfg.color}" opacity="0.12"/>` + `<polyline points="${pts}" fill="none" stroke="${cfg.color}" stroke-width="2.5"/>`;
}
function zoneLogin(z){
  const cfg = zoneCfg[z];
  const u = document.getElementById('zu-'+z).value.trim();
  const p = document.getElementById('zp-'+z).value.trim();
  const err = document.getElementById('zg-err-'+z);
  if(u===cfg.user && p===cfg.pass){
    err.classList.remove('show');
    document.getElementById('gate-'+z).style.display='none';
    document.getElementById('analysis-'+z).classList.add('open');
  } else { err.classList.add('show'); }
}
function zoneLogout(z){
  document.getElementById('analysis-'+z).classList.remove('open');
  document.getElementById('gate-'+z).style.display='block';
  document.getElementById('zu-'+z).value=''; document.getElementById('zp-'+z).value='';
}

/* ---------------- MODULE 5: Power BI heatmap + weekly trend ---------------- */
function heatColor(v){
  // v: 0-100 -> blue (low) to red (high)
  if(v<40) return '#E7F0FF';
  if(v<55) return '#BBD8FF';
  if(v<70) return '#5B9CFB';
  if(v<85) return '#2563EB';
  if(v<93) return '#1E40AF';
  return '#DC3B36';
}
function buildHeatmap(){
  const hours = Array.from({length:24},(_,i)=>i);
  const A = hours.map(h=>10+gauss(h,9,3,80));
  const B = hours.map(h=>8+gauss(h,17,3.4,84));
  const C = hours.map(h=>10+gauss(h,7.5,1.8,82)+gauss(h,17.5,2.4,42));
  const rows = [['Zone A',A],['Zone B',B],['Zone C',C]];
  let html = `<div class="hm-label"></div>` + hours.map(h=>`<div class="hm-hourlbl">${h%3===0?h:''}</div>`).join('');
  rows.forEach(([label,arr])=>{
    html += `<div class="hm-label">${label}</div>`;
    html += arr.map(v=>`<div class="hm-cell" style="background:${heatColor(Math.min(v,100))}" title="${label} ${Math.round(v)}%"></div>`).join('');
  });
  document.getElementById('pbi-heatmap').innerHTML = html;
}
function buildPbiTrend(){
  const days7 = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const A = zoneCfg.A.trend, B = zoneCfg.B.trend, C = zoneCfg.C.trend;
  function toPts(arr){ return arr.map((v,i)=>{ const x=(i/(arr.length-1))*700+10; const y=190-(v/100)*170; return x+','+y; }).join(' '); }
  const svg = document.getElementById('pbi-trend-svg');
  let grid='';
  for(let g=0; g<=100; g+=25){ const y=190-(g/100)*170; grid += `<line x1="10" y1="${y}" x2="710" y2="${y}" stroke="#EEF2F7" stroke-width="1"/><text x="0" y="${y+4}" font-size="10" fill="#94A1B2">${g}</text>`; }
  let xlabels = days7.map((d,i)=>{ const x=(i/(days7.length-1))*700+10; return `<text x="${x}" y="200" font-size="10" fill="#94A1B2" text-anchor="middle">${d}</text>`; }).join('');
  svg.innerHTML = grid + xlabels +
    `<polyline points="${toPts(A)}" fill="none" stroke="#2563EB" stroke-width="2.5"/>` +
    `<polyline points="${toPts(B)}" fill="none" stroke="#DC3B36" stroke-width="2.5"/>` +
    `<polyline points="${toPts(C)}" fill="none" stroke="#0E8F5E" stroke-width="2.5"/>`;
}

/* ---------------- BUILD EVERYTHING ---------------- */
function buildAll(){
  buildDots();
  buildHourlyLog();
  recompute();
  buildDemand();
  showQuery(0, document.querySelector('.tabbtns button'));
  buildGaugeRow('gauge-row-1',[{pct:78,color:'#D97B0A',label:'Zone A — Commercial'},{pct:91,color:'#DC3B36',label:'Zone B — Shopping Mall'},{pct:52,color:'#0E8F5E',label:'Zone C — Metro Transit'}]);
  buildGaugeRow('gauge-row-2',[{pct:91,color:'#2563EB',label:'Zone A confidence'},{pct:87,color:'#2563EB',label:'Zone B confidence'},{pct:89,color:'#2563EB',label:'Zone C confidence'}]);
  buildGaugeRow('gauge-row-3',[{pct:88,color:'#2563EB',label:'Zone A peak intensity'},{pct:90,color:'#DC3B36',label:'Zone B peak intensity'},{pct:91,color:'#0E8F5E',label:'Zone C peak intensity'}]);
  buildGaugeRow('gauge-row-4',[{pct:94,color:'#0E8F5E',label:'Index hit rate'},{pct:82,color:'#D97B0A',label:'Query cache hit rate'},{pct:99,color:'#2563EB',label:'Engine uptime'}]);
  buildGaugeRow('gauge-row-5',[{pct:82,color:'#DC3B36',label:'Zone B surge effectiveness'},{pct:64,color:'#0E8F5E',label:'Zone A discount uptake'},{pct:71,color:'#2563EB',label:'Overall pricing accuracy'}]);
  buildHeatmap();
  buildPbiTrend();
  buildZonePage('A'); buildZonePage('B'); buildZonePage('C');
}
