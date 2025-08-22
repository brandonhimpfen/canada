// Canada–U.S. Economic Dashboard data and features
/*
Primary sources:
- U.S. Census, "Trade in Goods with Canada" (monthly & annual goods). https://www.census.gov/foreign-trade/balance/c1220.html
- USTR "Canada" (services totals, 2024). https://ustr.gov/countries-regions/americas/canada
- FRED AEXCAUS (CAD per USD, annual avg). https://fred.stlouisfed.org/series/AEXCAUS
*/

// ----------------------- Static Data (edit to refresh) -----------------------
// Annual goods totals (2024) in millions USD
const GOODS_EXPORTS_2024_TOTAL_M = 349_908.2;
const GOODS_IMPORTS_2024_TOTAL_M = 411_886.7;

// 2024 monthly goods (millions USD, NSA)
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GOODS_EXPORTS_2024_MONTHLY_M = [26660.0, 28598.3, 30822.1, 30681.0, 30496.2, 29787.8, 27795.0, 30011.4, 29208.2, 30238.4, 28646.0, 26963.5];
const GOODS_IMPORTS_2024_MONTHLY_M = [33398.6, 33144.9, 34033.7, 34385.5, 35640.4, 34411.9, 35918.8, 32864.7, 34551.9, 34476.2, 33499.4, 35560.6];

// 2025 YTD goods (Jan–Jun), millions USD
const GOODS_2025_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];
const GOODS_EXPORTS_2025_M = [27334.6, 28261.9, 32195.0, 27708.6, 28111.5, 28375.2];
const GOODS_IMPORTS_2025_M = [38338.5, 34924.7, 35667.6, 29437.6, 30168.0, 29687.7];

// Services totals (2024), billions USD (USTR/BEA)
const SERVICES_EXPORTS_2024_B = 90.3;
const SERVICES_IMPORTS_2024_B = 57.0;

// FX: 2024 annual average CAD per USD
const FX_CAD_PER_USD_2024 = 1.3699;

// CPI (All Urban Consumers) index, 1982-84=100, monthly used for simple deflation.
// Put 2024 monthly values and 2025 Jan–Jun. Source: FRED CPIAUCSL.
const CPI_2024 = [309.149, 310.326, 311.072, 311.503, 312.332, 312.646, 313.165, 313.532, 314.042, 314.616, 314.995, 315.622];
const CPI_2025 = [316.220, 316.780, 317.422, 318.108, 318.552, 318.909]; // Jan–Jun
const CPI_REF_2024_AVG = CPI_2024.reduce((a,b)=>a+b,0)/CPI_2024.length; // base = 2024 average

// Deeper data placeholders (populate with official figures if available)
const TOP_GOODS_EXPORTS_2024 = [
  // [label, USD billions]
  ["Vehicles & parts (HS87)", 65.0],
  ["Machinery (HS84)", 55.0],
  ["Mineral fuels (HS27)", 40.0],
  ["Electrical machinery (HS85)", 28.0],
  ["Plastics (HS39)", 20.0],
  ["Pharma (HS30)", 15.0],
  ["Optical/medical (HS90)", 12.0],
  ["Other", 114.9]
];
const TOP_GOODS_IMPORTS_2024 = [
  ["Mineral fuels (HS27)", 160.0],
  ["Vehicles & parts (HS87)", 80.0],
  ["Machinery (HS84)", 42.0],
  ["Electrical machinery (HS85)", 30.0],
  ["Aluminum (HS76)", 18.0],
  ["Wood/pulp (HS44/48)", 17.0],
  ["Plastics (HS39)", 15.0],
  ["Other", 49.9]
];

const SERVICES_BREAKDOWN_2024 = {
  labels: ["Travel","Transport","Financial","Intellectual Property","Other Business"],
  exportsB: [26.0, 17.0, 14.0, 12.0, 21.3], // placeholder split, sum ~ 90.3
  importsB: [20.0, 12.0, 8.0, 6.0, 11.0]    // placeholder split, sum ~ 57.0
};

// ----------------------- State & Helpers -----------------------
let includeServices = false;
let currency = 'USD'; // or 'CAD'
let real = false;

function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
function billions(x){ return x/1000; }
function scaleCurrencyB(valB){ return currency==='CAD' ? valB * FX_CAD_PER_USD_2024 : valB; }
function scaleCurrencyM(valM){ return currency==='CAD' ? valM * FX_CAD_PER_USD_2024 : valM; }
function fmtB(x){ return (x<0?'-$':'$') + Math.abs(x).toFixed(1) + (currency==='CAD'?' CADB':' USB'); }
function fmtM_toB(m){ const b = m/1000; return (currency==='CAD' ? b*FX_CAD_PER_USD_2024 : b).toFixed(1) + (currency==='CAD'?' CADB':' USB'); }
function deflator(year, idx){ // return factor to convert nominal -> 2024 real (divide nominal by factor)
  if(!real) return 1;
  const cpi = (year===2024 ? CPI_2024[idx] : CPI_2025[idx]);
  return cpi / CPI_REF_2024_AVG;
}

// ----------------------- KPIs Populate -----------------------
function computeKPIs(){
  const goodsExpB = scaleCurrencyM(GOODS_EXPORTS_2024_TOTAL_M)/1000;
  const goodsImpB = scaleCurrencyM(GOODS_IMPORTS_2024_TOTAL_M)/1000;
  const goodsBalB = goodsExpB - goodsImpB;

  const svcExpB = scaleCurrencyB(SERVICES_EXPORTS_2024_B);
  const svcImpB = scaleCurrencyB(SERVICES_IMPORTS_2024_B);
  const svcBalB = svcExpB - svcImpB;

  const netB = includeServices ? (goodsBalB + svcBalB) : goodsBalB;

  return {goodsExpB, goodsImpB, goodsBalB, svcExpB, svcImpB, svcBalB, netB};
}

function populateKPIs(){
  const {goodsExpB, goodsImpB, goodsBalB, svcExpB, svcImpB, svcBalB, netB} = computeKPIs();
  document.getElementById('kpiGoodsExports2024').textContent = (goodsExpB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiGoodsImports2024').textContent = (goodsImpB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiServicesExports2024').textContent = (svcExpB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiServicesImports2024').textContent = (svcImpB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiGoodsDeficit2024').textContent = (goodsBalB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiServicesSurplus2024').textContent = (svcBalB).toFixed(1) + (currency==='CAD'?' CADB':' USB');
  document.getElementById('kpiNetBalance2024').textContent = (netB).toFixed(1) + (currency==='CAD'?' CADB':' USB');

  const goodsDefYTD = (sum(GOODS_EXPORTS_2025_M) - sum(GOODS_IMPORTS_2025_M))/1000;
  const goodsDefYTDScaled = currency==='CAD' ? goodsDefYTD * FX_CAD_PER_USD_2024 : goodsDefYTD;
  document.getElementById('kpiGoodsDeficit2025YTD').textContent = (goodsDefYTDScaled).toFixed(1) + (currency==='CAD'?' CADB':' USB');

  document.getElementById('kpiFx2024').textContent = FX_CAD_PER_USD_2024.toFixed(4);
}

// ----------------------- Charts -----------------------
let goodsMonthlyChart, goodsServicesChart, annualGoodsChart, topGoodsExportsChart, topGoodsImportsChart, servicesBreakdownChart;

function buildGoodsMonthlyChart(){
  const exportsB = GOODS_EXPORTS_2024_MONTHLY_M.map((m,i)=> (scaleCurrencyM(m)/1000) / deflator(2024,i));
  const importsB = GOODS_IMPORTS_2024_MONTHLY_M.map((m,i)=> (scaleCurrencyM(m)/1000) / deflator(2024,i));
  const exp25B = GOODS_EXPORTS_2025_M.map((m,i)=> (scaleCurrencyM(m)/1000) / deflator(2025,i));
  const imp25B = GOODS_IMPORTS_2025_M.map((m,i)=> (scaleCurrencyM(m)/1000) / deflator(2025,i));

  const ctx = document.getElementById('goodsMonthlyChart').getContext('2d');
  goodsMonthlyChart = new Chart(ctx, {
    type: 'line',
    data: { labels: MONTHS, datasets: [
      { label: 'Exports 2024 (goods)', data: exportsB, borderWidth: 2, tension: .2 },
      { label: 'Imports 2024 (goods)', data: importsB, borderWidth: 2, tension: .2 },
      { label: 'Exports 2025 YTD (goods)', data: exp25B, borderDash:[6,4], spanGaps:true, borderWidth:2, tension:.2 },
      { label: 'Imports 2025 YTD (goods)', data: imp25B, borderDash:[6,4], spanGaps:true, borderWidth:2, tension:.2 }
    ]},
    options: {
      responsive: true,
      aspectRatio: 1.9,
      maintainAspectRatio: true,
      scales: { y: { title: { display: true, text: (real?'Real ':'Nominal ') + (currency==='CAD'?'CAD':'USD') + ' billions' } } },
      plugins: { legend: { position:'bottom' } }
    }
  });
  toggleServicesNote();
}

function buildGoodsServicesChart(){
  const goodsExpB = scaleCurrencyM(GOODS_EXPORTS_2024_TOTAL_M)/1000;
  const goodsImpB = scaleCurrencyM(GOODS_IMPORTS_2024_TOTAL_M)/1000;
  const svcExpB = scaleCurrencyB(SERVICES_EXPORTS_2024_B);
  const svcImpB = scaleCurrencyB(SERVICES_IMPORTS_2024_B);

  const ctx = document.getElementById('goodsServicesChart').getContext('2d');
  goodsServicesChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Goods (2024)','Services (2024)'],
      datasets: [
        { label:'Exports', data:[goodsExpB, svcExpB] },
        { label:'Imports', data:[goodsImpB, svcImpB] }
      ]
    },
    options: {
      responsive: true,
      aspectRatio: 1.9,
      maintainAspectRatio: true,
      scales: { y: { beginAtZero:true, title: { display:true, text: (currency==='CAD'?'CAD':'USD')+' billions' } } },
      plugins: { legend:{ position:'bottom' } }
    }
  });
  toggleServicesNote();
}

// Annual goods chart (2018–2025 YTD) with annotation bands — placeholders for 2018–2023 totals until populated
const YEARS = [2018,2019,2020,2021,2022,2023,2024,2025];
const ANNUAL_EXPORTS_B = [299.7317, 292.8203, 256.2123, 309.6040, 359.0842, 354.4080, GOODS_EXPORTS_2024_TOTAL_M/1000, sum(GOODS_EXPORTS_2025_M)/1000]; // TODO populate 2018–2023
const ANNUAL_IMPORTS_B = [318.5748, 318.5888, 270.0255, 357.2747, 437.4176, 418.0103, GOODS_IMPORTS_2024_TOTAL_M/1000, sum(GOODS_IMPORTS_2025_M)/1000];

function buildAnnualGoodsChart(){
  const exp = ANNUAL_EXPORTS_B.map(v => v==null? null : (currency==='CAD'? v*FX_CAD_PER_USD_2024 : v));
  const imp = ANNUAL_IMPORTS_B.map(v => v==null? null : (currency==='CAD'? v*FX_CAD_PER_USD_2024 : v));

  const ctx = document.getElementById('annualGoodsChart').getContext('2d');
  annualGoodsChart = new Chart(ctx, {
    type: 'line',
    data: { labels: YEARS, datasets: [
      { label:'Exports (goods)', data: exp, borderWidth:2, tension:.2 },
      { label:'Imports (goods)', data: imp, borderWidth:2, tension:.2 }
    ]},
    options: {
      responsive:true,
      aspectRatio: 1.9,
      maintainAspectRatio: true,
      scales: { y: { title:{ display:true, text:(currency==='CAD'?'CAD':'USD')+' billions' } } },
      plugins: {
        legend: { position:'bottom' },
        annotation: {
          annotations: {
            tariffBand: { type:'box', xMin:2018-0.5, xMax:2019+0.5, backgroundColor:'rgba(255,165,0,0.15)', borderWidth:0, label:{display:true, content:'Tariffs 2018–2019', position:'start' } },
            covidBand: { type:'box', xMin:2020-0.2, xMax:2020+0.2, backgroundColor:'rgba(220,38,38,0.15)', borderWidth:0, label:{display:true, content:'COVID shock 2020Q2', position:'start'} },
            usmcaLine: { type:'line', xMin:2020, xMax:2020, borderColor:'rgba(59,130,246,0.6)', borderWidth:2, label:{display:true, content:'USMCA 2020-07-01', position:'end', backgroundColor:'rgba(59,130,246,0.1)'} }
          }
        }
      }
    }
  });
  toggleServicesNote();
}

// Top goods categories (placeholders)
function buildTopGoodsCharts(){
  const ctxE = document.getElementById('topGoodsExports').getContext('2d');
  topGoodsExportsChart = new Chart(ctxE, {
    type: 'bar',
    data: { labels: TOP_GOODS_EXPORTS_2024.map(x=>x[0]), datasets: [{ label:'Exports to Canada (2024)', data: TOP_GOODS_EXPORTS_2024.map(x=> currency==='CAD' ? x[1]*FX_CAD_PER_USD_2024 : x[1]) }]},
    options: { indexAxis:'y', responsive:true, aspectRatio:1.1, maintainAspectRatio:true, scales:{ x:{ title:{display:true, text:(currency==='CAD'?'CAD':'USD')+' billions' }, beginAtZero:true } }, plugins:{ legend:{display:false} } }
  });
  const ctxI = document.getElementById('topGoodsImports').getContext('2d');
  topGoodsImportsChart = new Chart(ctxI, {
    type: 'bar',
    data: { labels: TOP_GOODS_IMPORTS_2024.map(x=>x[0]), datasets: [{ label:'Imports from Canada (2024)', data: TOP_GOODS_IMPORTS_2024.map(x=> currency==='CAD' ? x[1]*FX_CAD_PER_USD_2024 : x[1]) }]},
    options: { indexAxis:'y', responsive:true, aspectRatio:1.1, maintainAspectRatio:true, scales:{ x:{ title:{display:true, text:(currency==='CAD'?'CAD':'USD')+' billions' }, beginAtZero:true } }, plugins:{ legend:{display:false} } }
  });
  toggleServicesNote();
}

// Services breakdown stacked bars (placeholders)
function buildServicesBreakdown(){
  const ctx = document.getElementById('servicesBreakdown').getContext('2d');
  servicesBreakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SERVICES_BREAKDOWN_2024.labels,
      datasets: [
        { label:'Exports', data: SERVICES_BREAKDOWN_2024.exportsB.map(v=> currency==='CAD'? v*FX_CAD_PER_USD_2024 : v) },
        { label:'Imports', data: SERVICES_BREAKDOWN_2024.importsB.map(v=> currency==='CAD'? v*FX_CAD_PER_USD_2024 : v) }
      ]
    },
    options: { responsive:true, aspectRatio:1.6, maintainAspectRatio:true, scales:{ y:{ beginAtZero:true, stacked:false, title:{display:true, text:(currency==='CAD'?'CAD':'USD')+' billions'} } }, plugins:{ legend:{ position:'bottom' } } }
  });
  toggleServicesNote();
}

// ----------------------- Services Note -----------------------
function toggleServicesNote(){
  const el = document.getElementById('servicesNote');
  if (!el) return;
  const vals = (SERVICES_BREAKDOWN_2024.exportsB||[]).concat(SERVICES_BREAKDOWN_2024.importsB||[]);
  const hasIssue = vals.length===0 || vals.some(v => !isFinite(v) || v===0);
  el.classList.toggle('hidden', !hasIssue);
}

// ----------------------- Exports (CSV/PNG) -----------------------
function toCSV(rows){ return rows.map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); }
function download(name, text, type='text/plain'){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1200); }
function downloadCanvasPNG(canvasId, filename){ const a=document.createElement('a'); a.href=document.getElementById(canvasId).toDataURL('image/png'); a.download=filename; a.click(); }

function hookDownloads(){
  // Goods monthly
  document.getElementById('btnGoodsMonthlyCSV').onclick = () => {
    const rows = [['Month','Exports','Imports']];
    MONTHS.forEach((m,i)=> rows.push([m,
      ((scaleCurrencyM(GOODS_EXPORTS_2024_MONTHLY_M[i])/1000)/deflator(2024,i)).toFixed(3),
      ((scaleCurrencyM(GOODS_IMPORTS_2024_MONTHLY_M[i])/1000)/deflator(2024,i)).toFixed(3)
    ]));
    download('goods_monthly_2024.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnGoodsMonthlyPNG').onclick = () => downloadCanvasPNG('goodsMonthlyChart','goods_monthly.png');

  // Goods vs Services snapshot
  document.getElementById('btnGoodsServicesCSV').onclick = () => {
    const {goodsExpB, goodsImpB} = computeKPIs();
    const rows = [['Type','Exports','Imports'],['Goods', goodsExpB.toFixed(3), (goodsImpB).toFixed(3)], ['Services', scaleCurrencyB(SERVICES_EXPORTS_2024_B).toFixed(3), scaleCurrencyB(SERVICES_IMPORTS_2024_B).toFixed(3)]];
    download('goods_services_2024.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnGoodsServicesPNG').onclick = () => downloadCanvasPNG('goodsServicesChart','goods_services.png');

  // Annual goods
  document.getElementById('btnAnnualCSV').onclick = () => {
    const rows = [['Year','Exports','Imports']];
    YEARS.forEach((y, i)=> rows.push([y, ANNUAL_EXPORTS_B[i]==null?'':(currency==='CAD'?ANNUAL_EXPORTS_B[i]*FX_CAD_PER_USD_2024:ANNUAL_EXPORTS_B[i]).toFixed(3), ANNUAL_IMPORTS_B[i]==null?'':(currency==='CAD'?ANNUAL_IMPORTS_B[i]*FX_CAD_PER_USD_2024:ANNUAL_IMPORTS_B[i]).toFixed(3)]));
    download('goods_annual_2018_2025.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnAnnualPNG').onclick = () => downloadCanvasPNG('annualGoodsChart','goods_annual.png');

  // Top goods
  document.getElementById('btnTopGoodsExpCSV').onclick = () => {
    const rows = [['Category','Exports']].concat(TOP_GOODS_EXPORTS_2024.map(r=>[r[0], (currency==='CAD'? r[1]*FX_CAD_PER_USD_2024 : r[1]).toFixed(3)]));
    download('top_goods_exports_2024.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnTopGoodsExpPNG').onclick = () => downloadCanvasPNG('topGoodsExports','top_goods_exports.png');
  document.getElementById('btnTopGoodsImpCSV').onclick = () => {
    const rows = [['Category','Imports']].concat(TOP_GOODS_IMPORTS_2024.map(r=>[r[0], (currency==='CAD'? r[1]*FX_CAD_PER_USD_2024 : r[1]).toFixed(3)]));
    download('top_goods_imports_2024.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnTopGoodsImpPNG').onclick = () => downloadCanvasPNG('topGoodsImports','top_goods_imports.png');

  // Services breakdown
  document.getElementById('btnServicesBreakCSV').onclick = () => {
    const rows = [['Type','Exports','Imports']];
    SERVICES_BREAKDOWN_2024.labels.forEach((lab, i)=> rows.push([lab, (currency==='CAD'? SERVICES_BREAKDOWN_2024.exportsB[i]*FX_CAD_PER_USD_2024: SERVICES_BREAKDOWN_2024.exportsB[i]).toFixed(3), (currency==='CAD'? SERVICES_BREAKDOWN_2024.importsB[i]*FX_CAD_PER_USD_2024: SERVICES_BREAKDOWN_2024.importsB[i]).toFixed(3)]));
    download('services_breakdown_2024.csv', toCSV(rows), 'text/csv');
  };
  document.getElementById('btnServicesBreakPNG').onclick = () => downloadCanvasPNG('servicesBreakdown','services_breakdown.png');
}

// ----------------------- Claim Builder -----------------------
function buildClaim(){
  const {goodsBalB, svcBalB, netB} = computeKPIs();
  const txt = `The 2024 U.S. goods deficit with Canada was about ${(Math.abs(goodsBalB)).toFixed(1)} ${currency==='CAD'?'CADB':'USB'}, but the U.S. ran a services surplus of ${(svcBalB).toFixed(1)}. Netting goods and services, the overall balance was ${(netB).toFixed(1)}. Sources: U.S. Census (goods), USTR/BEA (services).`;
  const el = document.getElementById('claimText');
  el.value = txt;
}
function hookClaimCopy(){
  document.getElementById('btnCopyClaim').onclick = async () => {
    const txt = document.getElementById('claimText').value;
    try { await navigator.clipboard.writeText(txt); } catch(e){ /* ignore */ }
  };
}

// ----------------------- Wiring Toggles -----------------------
function onStateChange(){
  // KPIs
  populateKPIs();

  // Charts
  goodsMonthlyChart.destroy(); buildGoodsMonthlyChart();
  goodsServicesChart.destroy(); buildGoodsServicesChart();
  annualGoodsChart.destroy(); buildAnnualGoodsChart();
  topGoodsExportsChart.destroy(); buildTopGoodsCharts();
  topGoodsImportsChart = topGoodsExportsChart; // rebuild within buildTopGoodsCharts
  servicesBreakdownChart.destroy(); buildServicesBreakdown(); toggleServicesNote();

  // Claim text
  buildClaim();
}

function wireToggles(){
  document.getElementById('toggleIncludeServices').addEventListener('change', (e)=>{ includeServices = e.target.checked; onStateChange(); });
  document.getElementById('toggleCAD').addEventListener('change', (e)=>{ currency = e.target.checked ? 'CAD':'USD'; onStateChange(); });
  document.getElementById('toggleReal').addEventListener('change', (e)=>{ real = e.target.checked; onStateChange(); });
  toggleServicesNote();
}


// ----------------------- Dark Mode -----------------------
function applyDark(on){
  document.documentElement.classList.toggle('dark', on);
  document.body.classList.toggle('bg-slate-900', on);
  document.body.classList.toggle('text-slate-100', on);
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = on ? 'Dark: on' : 'Dark: off';
}
function initDark(){
  let on = false;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') on = true;
  else if (saved === 'light') on = false;
  else on = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  applyDark(on);
  const btn = document.getElementById('darkToggle');
  if (btn){
    btn.addEventListener('click', () => {
      const now = !document.documentElement.classList.contains('dark');
      applyDark(now);
      localStorage.setItem('theme', now ? 'dark' : 'light');
    });
  }
}

// ----------------------- Init -----------------------
(function init(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

function start(){
  initDark();
  populateKPIs();
  buildGoodsMonthlyChart();
  buildGoodsServicesChart();
  buildAnnualGoodsChart();
  buildTopGoodsCharts();
  buildServicesBreakdown();
  hookDownloads();
  wireToggles();
  buildClaim();
  hookClaimCopy();

  console.warn("NOTE: Annual 2018–2023 totals and detailed category splits are placeholders. Replace TOP_GOODS_* and SERVICES_BREAKDOWN_2024 with official values when available.");
}
