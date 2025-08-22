
// Canada Prosperity Dashboard — real data wired
// Sources (see footer in HTML):
// - World Bank WDI (NY.GDP.PCAP.PP.CD), Canada 2018–2023
// - WIPO Country Profile (Canada, 2023): PCT per million = 59.8; PCT filings = 2,398
// - Statistics Canada, The Daily (2025-02-26): Non-residential CAPEX intentions 2025 = C$388.6B; sector notes

const GDP_PPP_CAN = [
  {year:2018, value:49982.60},
  {year:2019, value:50498.97},
  {year:2020, value:48590.68},
  {year:2021, value:56547.80},
  {year:2022, value:62707.94},
  {year:2023, value:63419.08},
];

const WIPO_2023 = { pctPerMillion: 59.8, pctFilings: 2398 };

const CAPEX_2025 = {
  totalCAD_B: 388.5587,
  sectors: [
    {label:'Mining, quarrying & oil & gas', value: 64.4},
    {label:'Utilities', value: 49.1},
    {label:'Manufacturing', value: 38.4},
  ]
};

// Simple helpers
const $ = sel => document.querySelector(sel);
const fmtInt = n => Number(n).toLocaleString('en-CA', {maximumFractionDigits:0});
const fmtCADB = n => 'C$ ' + Number(n).toLocaleString('en-CA', {maximumFractionDigits:1}) + ' B';
const fmtIntl$ = n => Number(n).toLocaleString('en-US', {maximumFractionDigits:0});

function wireToggles(){
  const darkBtn = document.getElementById('darkToggle');
  if (darkBtn){
    darkBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }
  const langBtn = document.getElementById('langToggle');
  if (langBtn){
    langBtn.addEventListener('click', () => {
      langBtn.textContent = (langBtn.textContent === 'FR' ? 'EN' : 'FR');
      // (Optional) extend to swap labels textContent
    });
  }
}

function populateKPIs(){
  const last = GDP_PPP_CAN[GDP_PPP_CAN.length-1].value;
  const kpiGDP = document.getElementById('kpiGDP');
  if (kpiGDP) kpiGDP.textContent = 'Intl$ ' + fmtIntl$(last) + ' (2023)';
  const kpiPat = document.getElementById('kpiPatents');
  if (kpiPat) kpiPat.textContent = WIPO_2023.pctPerMillion.toFixed(1) + ' per million (2023)';
  const kpiCapex = document.getElementById('kpiCapex');
  if (kpiCapex) kpiCapex.textContent = fmtCADB(CAPEX_2025.totalCAD_B);
}

function renderCharts(){
  // GDP per capita (PPP, intl$)
  const c1 = document.getElementById('chartGDP');
  if (c1){
    new Chart(c1.getContext('2d'), {
      type:'line',
      data:{
        labels: GDP_PPP_CAN.map(d=>d.year),
        datasets:[{label:'GDP per capita (PPP, intl$)', data: GDP_PPP_CAN.map(d=>d.value)}]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom'} } }
    });
  }

  // WIPO - show PCT per million + total filings (two bars)
  const c2 = document.getElementById('chartPatents');
  if (c2){
    new Chart(c2.getContext('2d'), {
      type:'bar',
      data:{
        labels:['PCT per million (2023)','PCT filings (2023)'],
        datasets:[{label:'WIPO indicators', data:[WIPO_2023.pctPerMillion, WIPO_2023.pctFilings]}]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });
  }

  // CAPEX sectors (intentions, 2025)
  const c3 = document.getElementById('chartCapex');
  if (c3){
    new Chart(c3.getContext('2d'), {
      type:'bar',
      data:{
        labels: CAPEX_2025.sectors.map(s=>s.label),
        datasets:[{label:'2025 intentions (C$ billions)', data: CAPEX_2025.sectors.map(s=>s.value)}]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } }, scales:{ y:{ beginAtZero:true } } }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  wireToggles();
  populateKPIs();
  renderCharts();
});
