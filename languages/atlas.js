// Indigenous Languages Living Atlas (demo scaffolding)
// EN/FR UI, Leaflet family map, speaker trend chart, dark mode, CSV/PNG export.

// -------- Meta --------
const APP_VERSION = "v0.9.0";
const DATA_AS_OF = "Demo compiled: 2025-08-22";
document.addEventListener('DOMContentLoaded', () => {
  const ver = document.getElementById('version'); if (ver) ver.textContent = APP_VERSION;
  const asof = document.getElementById('dataAsOf'); if (asof) asof.textContent = DATA_AS_OF;
});

// -------- Dark mode --------
function applyDark(on){
  document.documentElement.classList.toggle('dark', on);
  document.body.classList.toggle('bg-slate-900', on);
  document.body.classList.toggle('text-slate-100', on);
}
function initDark(){
  const saved = localStorage.getItem('theme');
  let on = saved==='dark' ? true : saved==='light' ? false : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyDark(on);
  const btn = document.getElementById('darkToggle');
  btn.addEventListener('click', ()=>{
    on = !document.documentElement.classList.contains('dark');
    applyDark(on);
    localStorage.setItem('theme', on?'dark':'light');
  });
}

// -------- i18n --------
let LANG = localStorage.getItem('lang') || 'en';
const I18N = {
  en: {
    title: "Indigenous Languages Living Atlas",
    stewardship: "This demo is a respectful scaffold. Real projects should be co-designed with communities, use publicly shareable datasets, and follow Indigenous data governance principles (e.g., OCAP® in Canada). Names, locations, and counts below are illustrative for UI only.",
    toggle_autonym: "Show autonyms (self-names) where available",
    kpi_langs: "Languages displayed",
    kpi_communities: "Communities",
    kpi_speakers: "Estimated speakers (demo)",
    kpi_projects: "Revitalization projects",
    map_title: "Map by language family",
    map_sub: "Click a marker to see a language entry and projects.",
    map_legend: "Colour key: Algonquian (red), Athabaskan/Dene (orange), Inuit (blue), Iroquoian (purple), Salishan (green), Wakashan (teal), Siouan (pink), Métis (gold).",
    trend_sub: "Where public, approximate counts over time. Demo placeholders here.",
    list_title: "Languages & communities (filtered)",
    list_sub: "Select a row to focus the map and update the trend chart.",
    col_language: "Language",
    col_family: "Family",
    col_community: "Community",
    col_province: "Province/Territory",
    col_speakers: "Speakers (est.)",
    col_projects: "Projects",
    process_title: "Process & data stewardship",
    process1: "Co-design with communities and organizations. Confirm scope and consent before publishing any new data.",
    process2: "Use only publicly shareable datasets and respect Indigenous data governance (e.g., OCAP®). For non-public data, obtain permissions and avoid exposing sensitive locations or counts.",
    process3: "This demo uses small illustrative entries. Replace with your approved dataset and provide links to the original sources.",
    footer: "Bilingual UI • Dark mode • CSV/PNG exports • Built as a respectful starting point."
  },
  fr: {
    title: "Atlas vivant des langues autochtones",
    stewardship: "Cette démo est une ossature respectueuse. Les projets réels doivent être co‑conçus avec les communautés, utiliser des ensembles de données partageables publiquement et suivre les principes de gouvernance des données autochtones (p. ex., OCAP® au Canada). Les noms, lieux et décomptes ci‑dessous sont illustratifs pour l’interface uniquement.",
    toggle_autonym: "Afficher les autonymes (noms propres) lorsqu’ils sont disponibles",
    kpi_langs: "Langues affichées",
    kpi_communities: "Communautés",
    kpi_speakers: "Locuteurs estimés (démo)",
    kpi_projects: "Projets de revitalisation",
    map_title: "Carte par famille linguistique",
    map_sub: "Cliquez sur un marqueur pour voir une entrée de langue et des projets.",
    map_legend: "Code couleur : algonquiennes (rouge), athapascanes/Déné (orange), inuites (bleu), iroquoiennes (violet), salishennes (vert), wakashanes (sarcellé), siouanes (rose), métisses (or).",
    trend_sub: "Lorsque c’est public : décomptes approximatifs dans le temps. Valeurs de démonstration ici.",
    list_title: "Langues et communautés (filtrées)",
    list_sub: "Sélectionnez une ligne pour centrer la carte et mettre à jour le graphique.",
    col_language: "Langue",
    col_family: "Famille",
    col_community: "Communauté",
    col_province: "Province/Territoire",
    col_speakers: "Locuteurs (est.)",
    col_projects: "Projets",
    process_title: "Démarche et intendance des données",
    process1: "Co‑concevoir avec les communautés et organisations. Confirmer la portée et le consentement avant toute publication.",
    process2: "Utiliser seulement des données partageables publiquement et respecter la gouvernance des données autochtones (p. ex., OCAP®). Pour les données non publiques, obtenir des permissions et éviter d’exposer des lieux ou décomptes sensibles.",
    process3: "Cette démo utilise quelques entrées illustratives. Remplacez-les par votre jeu de données approuvé et indiquez les sources.",
    footer: "Interface bilingue • Mode sombre • Exports CSV/PNG • Point de départ respectueux."
  }
};
function t(k){ return (I18N[LANG] && I18N[LANG][k]) || k; }
function applyI18N(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.getElementById('langToggle').textContent = LANG==='en'?'FR':'EN';
  document.getElementById('trendTitle').textContent = LANG==='en'?'Speakers trend':'Évolution des locuteurs';
}

// -------- Data (demo) --------
// Each entry represents a language/community point with optional projects and a small trend series (demo numbers).
const FAMILY_COLORS = {
  Algonquian: '#ef4444',      // red
  'Athabaskan/Dene': '#f59e0b', // orange
  Inuit: '#3b82f6',           // blue
  Iroquoian: '#8b5cf6',       // purple
  Salishan: '#22c55e',        // green
  Wakashan: '#14b8a6',        // teal
  Siouan: '#ec4899',          // pink
  'Métis (Michif)': '#facc15' // gold
};

const ENTRIES = [
  // Algonquian
  { id:'cree_plains_regina', family:'Algonquian', language:'Cree (Plains Cree / nêhiyawêwin)', autonym:'nêhiyawêwin', community:'Regina area', province:'SK', lat:50.45, lng:-104.61, speakers_est:12000, trend:[12,12.1,12.2,12.0,11.9,11.8,11.7], projects:[{name:'Language classes', url:'#'}] },
  { id:'ojibwe_thunderbay', family:'Algonquian', language:'Ojibwe / Anishinaabemowin', autonym:'Anishinaabemowin', community:'Thunder Bay area', province:'ON', lat:48.38, lng:-89.25, speakers_est:6000, trend:[6.0,6.0,5.9,5.8,5.8,5.7,5.6], projects:[{name:'Immersion program', url:'#'}] },
  // Athabaskan / Dene
  { id:'dene_yellowknife', family:'Athabaskan/Dene', language:'Dene (Tłı̨chǫ / Dogrib)', autonym:'Tłı̨chǫ Yatıì', community:'Yellowknife region', province:'NT', lat:62.45, lng:-114.38, speakers_est:2200, trend:[2.1,2.1,2.0,2.0,1.9,1.9,1.8], projects:[{name:'Radio & podcasts', url:'#'}] },
  // Inuit
  { id:'inuktitut_iqaluit', family:'Inuit', language:'Inuktitut', autonym:'ᐃᓄᒃᑎᑐᑦ', community:'Iqaluit', province:'NU', lat:63.7467, lng:-68.5170, speakers_est:14000, trend:[13.5,13.6,13.7,13.8,13.9,14.0,14.2], projects:[{name:'Curriculum resources', url:'#'}] },
  // Iroquoian
  { id:'mohawk_tyos', family:'Iroquoian', language:'Mohawk', autonym:'Kanienʼkéha', community:'Tyendinaga / Kahnawà:ke region', province:'ON/QC', lat:44.2, lng:-76.9, speakers_est:3000, trend:[2.8,2.9,3.0,3.1,3.1,3.2,3.3], projects:[{name:'Immersion school', url:'#'}] },
  // Salishan
  { id:'halkomelem_lower', family:'Salishan', language:'Halq’eméylem (Halkomelem)', autonym:'Halq’eméylem', community:'Lower Fraser Valley', province:'BC', lat:49.16, lng:-122.85, speakers_est:600, trend:[0.5,0.5,0.6,0.6,0.6,0.7,0.7], projects:[{name:'Elders teaching circle', url:'#'}] },
  // Wakashan
  { id:'nuuchahnulth', family:'Wakashan', language:'Nuu-chah-nulth', autonym:'Nuučaan̓uł', community:'Vancouver Island west coast', province:'BC', lat:49.0, lng:-126.5, speakers_est:300, trend:[0.28,0.28,0.29,0.30,0.31,0.32,0.33], projects:[{name:'Youth camp', url:'#'}] },
  // Siouan
  { id:'nakoda_morley', family:'Siouan', language:'Nakoda (Stoney)', autonym:'Îyârhe Nakoda', community:'Morley area', province:'AB', lat:51.1, lng:-115.07, speakers_est:1700, trend:[1.6,1.6,1.6,1.6,1.7,1.7,1.7], projects:[{name:'Community classes', url:'#'}] },
  // Métis (Michif)
  { id:'michif_saskatoon', family:'Métis (Michif)', language:'Michif', autonym:'Michif', community:'Saskatoon region', province:'SK', lat:52.13, lng:-106.67, speakers_est:1200, trend:[1.1,1.1,1.1,1.1,1.1,1.1,1.2], projects:[{name:'Digital archive', url:'#'}] }
];
const TREND_YEARS = [2019,2020,2021,2022,2023,2024,2025];

// -------- Map --------
let map, markers = {};
function initMap(){
  map = L.map('map').setView([58.5, -96.5], 3.5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://leafletjs.com/">Leaflet</a>'
  }).addTo(map);
}

// -------- Filters & KPIs --------
function familySet(){
  const idMap = {
    Algonquian: 'familyAlg', 'Athabaskan/Dene':'familyAth', Inuit:'familyInu', Iroquoian:'familyIro',
    Salishan:'familySal', Wakashan:'familyWak', Siouan:'familySio', 'Métis (Michif)':'familyMet'
  };
  const s = new Set();
  Object.entries(idMap).forEach(([fam,id]) => { if(document.getElementById(id).checked) s.add(fam); });
  return s;
}
function refresh(){
  const fams = familySet();
  const showAut = document.getElementById('toggleAutonym').checked;

  // Clear markers
  Object.values(markers).forEach(m => map.removeLayer(m)); markers = {};

  // Counters
  let langs = new Set(), communities = 0, speakers = 0, projects = 0;

  // Table
  const tbody = document.getElementById('langTable'); tbody.innerHTML = '';

  ENTRIES.forEach(e => {
    if (!fams.has(e.family)) return;

    // Marker
    const m = L.circleMarker([e.lat, e.lng], { radius: 7, color: FAMILY_COLORS[e.family], fillColor: FAMILY_COLORS[e.family], fillOpacity: 0.8, weight: 1 }).addTo(map);
    const displayName = showAut && e.autonym ? `${e.language} · ${e.autonym}` : e.language;
    const projHtml = e.projects && e.projects.length ? ('<ul style="margin:.25rem 0 0 .75rem;">' + e.projects.map(p=>`<li><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></li>`).join('') + '</ul>') : '<em>No projects listed</em>';
    m.bindPopup(`<strong>${displayName}</strong><br>${e.family} · ${e.community}, ${e.province}<br>Speakers (est.): ${e.speakers_est.toLocaleString()}${projHtml}`);
    m.on('click', ()=> updateTrend(e));
    markers[e.id] = m;

    // Table row
    const tr = document.createElement('tr');
    tr.className = "border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer";
    tr.innerHTML = `<td class="py-2 px-3">${displayName}</td>
                    <td class="py-2 px-3"><span class="legend-swatch" style="background:${FAMILY_COLORS[e.family]}"></span>${e.family}</td>
                    <td class="py-2 px-3">${e.community}</td>
                    <td class="py-2 px-3">${e.province}</td>
                    <td class="py-2 px-3">${e.speakers_est.toLocaleString()}</td>
                    <td class="py-2 px-3">${e.projects && e.projects.length ? e.projects.length : 0}</td>`;
    tr.addEventListener('click', ()=>{ map.setView([e.lat, e.lng], 6); markers[e.id].openPopup(); updateTrend(e); });
    tbody.appendChild(tr);

    // KPIs
    langs.add(e.language);
    communities++;
    speakers += e.speakers_est || 0;
    projects += (e.projects ? e.projects.length : 0);
  });

  document.getElementById('kpiLangs').textContent = langs.size;
  document.getElementById('kpiCommunities').textContent = communities;
  document.getElementById('kpiSpeakers').textContent = speakers.toLocaleString();
  document.getElementById('kpiProjects').textContent = projects;
}

// -------- Trend chart --------
let trendChart;
function buildTrendChart(){
  const ctx = document.getElementById('trendChart').getContext('2d');
  trendChart = new Chart(ctx, {
    type: 'line',
    data: { labels: TREND_YEARS, datasets: [{ label: 'Speakers (est.)', data: [], borderWidth: 2, tension: 0.2 }]},
    options: {
      responsive: true, aspectRatio: 1.9, maintainAspectRatio: true,
      scales: { y:{ beginAtZero: true, title:{ display:true, text: 'Speakers (est.)'} } },
      plugins: { legend:{ display:false } }
    }
  });
}
function updateTrend(entry){
  trendChart.data.datasets[0].data = entry.trend || [];
  trendChart.update();
  document.getElementById('trendTitle').textContent = (LANG==='en'?'Speakers trend: ':'Évolution des locuteurs : ') + entry.language;
}

// Default trend: aggregate average of filtered entries
function updateTrendAverage(){
  const fams = familySet();
  const arrs = ENTRIES.filter(e=>fams.has(e.family) && Array.isArray(e.trend)).map(e=>e.trend);
  if (!arrs.length) return;
  const avg = TREND_YEARS.map((_,i)=> Math.round(arrs.reduce((a,b)=>a+(b[i]||0),0)/arrs.length*100)/100);
  trendChart.data.datasets[0].data = avg;
  trendChart.update();
  document.getElementById('trendTitle').textContent = LANG==='en'?'Speakers trend: filtered average':'Évolution des locuteurs : moyenne filtrée';
}

// -------- Export helpers --------
function toCSV(rows){ return rows.map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); }
function download(name, text, type='text/plain'){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); }
function downloadCanvasPNG(canvasId, filename){ const a=document.createElement('a'); a.href=document.getElementById(canvasId).toDataURL('image/png'); a.download=filename; a.click(); }
function hookExports(){
  document.getElementById('btnTrendCSV').addEventListener('click', ()=>{
    const rows = [['Year'].concat(TREND_YEARS), ['Speakers (est.)'].concat(trendChart.data.datasets[0].data)];
    download('speakers_trend.csv', toCSV(rows), 'text/csv');
  });
  document.getElementById('btnTrendPNG').addEventListener('click', ()=> downloadCanvasPNG('trendChart','speakers_trend.png'));
}

// -------- Language & wiring --------
function initLang(){
  applyI18N();
  const langBtn = document.getElementById('langToggle');
  langBtn.addEventListener('click', ()=>{
    LANG = LANG==='en' ? 'fr' : 'en';
    localStorage.setItem('lang', LANG);
    applyI18N();
    refresh();
    updateTrendAverage();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initDark();
  initLang();
  initMap();
  buildTrendChart();
  refresh();
  updateTrendAverage();
  hookExports();

  ['familyAlg','familyAth','familyInu','familyIro','familySal','familyWak','familySio','familyMet','toggleAutonym'].forEach(id => {
    document.getElementById(id).addEventListener('change', ()=>{
      refresh();
      updateTrendAverage();
    });
  });
});
