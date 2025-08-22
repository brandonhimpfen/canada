// Indigenous Languages Living Atlas (demo scaffolding)
// EN/FR UI, Leaflet family map, speaker trend chart, dark mode, CSV/PNG export.

// -------- Meta --------
const APP_VERSION = "v0.9.0";
const DATA_AS_OF = "Updated: 2021 Census family counts (StatCan, released 2025-03-31)";
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
    stewardship: "This dashboard uses publicly released, national-level 2021 Census indicators (e.g., “knowledge of an Indigenous language”) and deliberately avoids community-level points. The simple map overlays are illustrative and not authoritative boundaries or territories. Any future, production use should be co-designed with Indigenous partners and guided by Indigenous data governance principles — including OCAP® in Canada and the CARE Principles — with appropriate consent, protocols, and context. Please treat names, locations, and counts here as UI scaffolding; they may be updated in consultation with communities.",
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
    stewardship: "Cette tableau de bord utilise des indicateurs nationaux issus du Recensement de 2021 (p. ex. « connaissance d’une langue autochtone ») et évite volontairement les points à l’échelle des communautés. Les superpositions cartographiques sont schématiques et ne représentent pas des limites ou des territoires officiels. Tout déploiement en production devrait être co-conçu avec des partenaires autochtones et guidé par les principes de gouvernance des données autochtones — notamment OCAP® au Canada et les principes CARE — avec les consentements, protocoles et mises en contexte appropriés. Les noms, emplacements et dénombrements présentés servent de support d’interface et pourront être adaptés en concertation avec les communautés.",
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
  document.getElementById('trendTitle').textContent = 'Family counts (2021 snapshot)';
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

const ENTRIES = [{"id":"fam_algonquian","family":"Algonquian","language":"Algonquian (family total)","autonym":"—","lat":53.0,"lng":-91.0,"province":"Multiple regions","speakers_est":163815,"trend":[163815,163815,163815,163815,163815,163815,163815],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025002-eng.htm"}]},{"id":"fam_athabaskan","family":"Athabaskan/Dene","language":"Athabaskan/Dene (family total)","autonym":"—","lat":61.0,"lng":-117.0,"province":"NWT/YT/AB/BC","speakers_est":20390,"trend":[20390,20390,20390,20390,20390,20390,20390],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025003-eng.htm"}]},{"id":"fam_inuktut","family":"Inuit","language":"Inuktut (family total)","autonym":"ᐃᓄᒃᑐᑦ","lat":66.0,"lng":-90.0,"province":"NU/NV/NL/NWT","speakers_est":42800,"trend":[42800,42800,42800,42800,42800,42800,42800],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025004-eng.htm"}]},{"id":"fam_iroquoian","family":"Iroquoian","language":"Iroquoian (family total)","autonym":"—","lat":44.0,"lng":-77.0,"province":"ON/QC","speakers_est":2055,"trend":[2055,2055,2055,2055,2055,2055,2055],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025005-eng.htm"}]},{"id":"fam_salish","family":"Salishan","language":"Salishan (family total)","autonym":"—","lat":50.0,"lng":-122.0,"province":"BC","speakers_est":5305,"trend":[5305,5305,5305,5305,5305,5305,5305],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025009-eng.htm"}]},{"id":"fam_wakashan","family":"Wakashan","language":"Wakashan (family total)","autonym":"—","lat":50.0,"lng":-128.0,"province":"BC","speakers_est":2205,"trend":[2205,2205,2205,2205,2205,2205,2205],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025010-eng.htm"}]},{"id":"fam_siouan","family":"Siouan","language":"Siouan (family total)","autonym":"—","lat":50.0,"lng":-106.0,"province":"SK/MB","speakers_est":2965,"trend":[2965,2965,2965,2965,2965,2965,2965],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025006-eng.htm"}]},{"id":"fam_tsimshian","family":"Tsimshian","language":"Tsimshianic (family total)","autonym":"—","lat":54.5,"lng":-130.0,"province":"BC","speakers_est":2665,"trend":[2665,2665,2665,2665,2665,2665,2665],"projects":[{"name":"StatCan family report (2025)","url":"https://www150.statcan.gc.ca/n1/pub/41-20-0002/412000022025008-eng.htm"}]}];
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
    data: { labels: TREND_YEARS, datasets: [{ label: 'Total speakers (knowledge) — selected families (2021 snapshot)', data: [], borderWidth: 2, tension: 0.2 }]},
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
  document.getElementById('trendTitle').textContent = 'Family counts (2021 snapshot)';
}

// Default trend: aggregate average of filtered entries
function updateTrendAverage(){
  const fams = familySet();
  const arrs = ENTRIES.filter(e=>fams.has(e.family) && Array.isArray(e.trend)).map(e=>e.trend);
  if (!arrs.length) return;
  const avg = TREND_YEARS.map((_,i)=> Math.round(arrs.reduce((a,b)=>a+(b[i]||0),0)/arrs.length*100)/100);
  trendChart.data.datasets[0].data = avg;
  trendChart.update();
  document.getElementById('trendTitle').textContent = 'Family counts (2021 snapshot)';
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
