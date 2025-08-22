// Great Canadian Places Index
// Bilingual EN/FR, Leaflet map with filters, seasonality chart, dark mode.

// ---------------- Meta ----------------
const APP_VERSION = "v0.9.0";
const DATA_AS_OF = "Compiled: 2025-08-22 (sample dataset)";
document.addEventListener('DOMContentLoaded', () => {
  const ver = document.getElementById('version'); if (ver) ver.textContent = APP_VERSION;
  const asof = document.getElementById('dataAsOf'); if (asof) asof.textContent = DATA_AS_OF;
});

// ---------------- Dark mode ----------------
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

// ---------------- i18n ----------------
let LANG = localStorage.getItem('lang') || 'en';
const I18N = {
  en: {
    title: "Great Canadian Places Index",
    intro: "Celebrate parks, trails, UNESCO sites, and small-town main streets — reasons to love Canada. Explore the map and see when each place shines through the seasons.",
    filter_nature: "Nature",
    filter_culture: "Culture",
    filter_food: "Food",
    toggle_indig: "Show Indigenous name (when available)",
    kpi_places: "Places displayed",
    kpi_nature: "Nature",
    kpi_culture: "Culture",
    kpi_food: "Food",
    map_title: "Map of Great Canadian Places",
    map_sub: "Click a marker to see details and seasonality.",
    seasonality_sub: "Monthly visit index (normalized, 100 = peak).",
    list_title: "Places (filtered)",
    list_sub: "Click a row to focus on the map and update the seasonality chart.",
    col_name: "Name",
    col_category: "Category",
    col_province: "Province/Territory",
    col_source: "Source",
    footer: "Built for exploration & pride. Bilingual UI, Indigenous names where provided."
  },
  fr: {
    title: "Index des Grands Lieux du Canada",
    intro: "Célébrez les parcs, sentiers, sites de l’UNESCO et les centres-villes — des raisons d’aimer le Canada. Explorez la carte et voyez quand chaque lieu brille selon les saisons.",
    filter_nature: "Nature",
    filter_culture: "Culture",
    filter_food: "Gastronomie",
    toggle_indig: "Afficher le nom autochtone (lorsqu’il est disponible)",
    kpi_places: "Lieux affichés",
    kpi_nature: "Nature",
    kpi_culture: "Culture",
    kpi_food: "Gastronomie",
    map_title: "Carte des grands lieux du Canada",
    map_sub: "Cliquez sur un marqueur pour voir les détails et la saisonnalité.",
    seasonality_sub: "Indice mensuel des visites (normalisé, 100 = pic).",
    list_title: "Lieux (filtrés)",
    list_sub: "Cliquez sur une ligne pour centrer la carte et mettre à jour la saisonnalité.",
    col_name: "Nom",
    col_category: "Catégorie",
    col_province: "Province/Territoire",
    col_source: "Source",
    footer: "Conçu pour l’exploration et la fierté. Interface bilingue, noms autochtones lorsqu’ils sont fournis."
  }
};
function t(key){ return (I18N[LANG] && I18N[LANG][key]) || key; }
function applyI18N(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.getElementById('langToggle').textContent = LANG==='en'?'FR':'EN';
  document.getElementById('seasonalityTitle').textContent = LANG==='en'?'Seasonality':'Saisonnalité';
}

// ---------------- Data ----------------
const PLACES = [
  // NATURE
  { id:'banff', category:['nature'], province:'AB',
    name_en:'Banff National Park', name_fr:'Parc national Banff',
    indigenous_name:null,
    lat:51.4968, lng:-115.9281,
    source:'https://parks.canada.ca/pn-np/ab/banff',
    season:[40,45,55,70,85,95,100,95,75,60,50,45]
  },
  { id:'grosmorne', category:['nature'], province:'NL',
    name_en:'Gros Morne National Park', name_fr:'Parc national du Gros-Morne',
    indigenous_name:null,
    lat:49.6499, lng:-57.7557,
    source:'https://parks.canada.ca/pn-np/nl/grosmorne',
    season:[20,25,35,60,85,100,95,80,50,35,25,20]
  },
  { id:'fundy', category:['nature'], province:'NB',
    name_en:'Fundy National Park', name_fr:'Parc national Fundy',
    indigenous_name:null,
    lat:45.5962, lng:-65.0219,
    source:'https://parks.canada.ca/pn-np/nb/fundy',
    season:[25,30,40,60,85,95,100,90,65,45,35,25]
  },
  { id:'nahanni', category:['nature'], province:'NT',
    name_en:'Nahanni National Park Reserve', name_fr:'Réserve de parc national Nahanni',
    indigenous_name:null,
    lat:61.0, lng:-124.5,
    source:'https://parks.canada.ca/pn-np/nt/nahanni',
    season:[5,10,20,40,70,100,95,60,30,15,10,5]
  },
  { id:'pacificrim', category:['nature'], province:'BC',
    name_en:'Pacific Rim National Park Reserve', name_fr:'Réserve de parc national Pacific Rim',
    indigenous_name:null,
    lat:49.034, lng:-125.664,
    source:'https://parks.canada.ca/pn-np/bc/pacificrim',
    season:[35,40,50,65,80,90,95,90,70,55,45,40]
  },
  { id:'kluanenp', category:['nature'], province:'YT',
    name_en:'Kluane National Park and Reserve', name_fr:'Parc national et réserve de parc national Kluane',
    indigenous_name:null,
    lat:60.75, lng:-138.6,
    source:'https://parks.canada.ca/pn-np/yt/kluane',
    season:[10,15,25,50,80,100,95,70,40,25,15,10]
  },
  { id:'gwaiihaan', category:['nature','culture'], province:'BC',
    name_en:'Gwaii Haanas National Park Reserve & Haida Heritage Site',
    name_fr:'Réserve de parc national Gwaii Haanas et site patrimonial haïda',
    indigenous_name:'Gwaii Haanas (Haida)',
    lat:52.5, lng:-131.2,
    source:'https://parks.canada.ca/pn-np/bc/gwaiihaanas',
    season:[10,15,25,50,80,100,95,70,40,25,15,10]
  },

  // CULTURE / UNESCO
  { id:'oldquebec', category:['culture'], province:'QC',
    name_en:'Historic District of Old Québec (UNESCO)', name_fr:'Arrondissement historique du Vieux-Québec (UNESCO)',
    indigenous_name:null,
    lat:46.8139, lng:-71.2080,
    source:'https://whc.unesco.org/en/list/300/',
    season:[30,35,45,60,80,95,100,95,75,55,40,35]
  },
  { id:'lunenburg', category:['culture'], province:'NS',
    name_en:'Old Town Lunenburg (UNESCO)', name_fr:'Vieille ville de Lunenburg (UNESCO)',
    indigenous_name:null,
    lat:44.3768, lng:-64.3180,
    source:'https://whc.unesco.org/en/list/741/',
    season:[20,25,35,55,80,95,100,90,65,45,30,20]
  },
  { id:'lanseauxmeadows', category:['culture'], province:'NL',
    name_en:'L’Anse aux Meadows (UNESCO)', name_fr:'L’Anse aux Meadows (UNESCO)',
    indigenous_name:null,
    lat:51.468, lng:-55.594,
    source:'https://whc.unesco.org/en/list/4/',
    season:[5,10,20,45,80,100,95,70,35,20,10,5]
  },
  { id:'rideau', category:['culture'], province:'ON',
    name_en:'Rideau Canal (UNESCO)', name_fr:'Canal Rideau (UNESCO)',
    indigenous_name:null,
    lat:45.423, lng:-75.697,
    source:'https://whc.unesco.org/en/list/1221/',
    season:[20,25,40,60,85,95,100,90,70,50,35,25]
  },
  { id:'cmhr', category:['culture'], province:'MB',
    name_en:'Canadian Museum for Human Rights', name_fr:'Musée canadien pour les droits de la personne',
    indigenous_name:null,
    lat:49.8994, lng:-97.1305,
    source:'https://humanrights.ca/',
    season:[15,20,30,45,60,70,75,70,55,40,30,20]
  },
  { id:'parliament', category:['culture'], province:'ON',
    name_en:'Parliament Hill', name_fr:'Colline du Parlement',
    indigenous_name:null,
    lat:45.4236, lng:-75.7009,
    source:'https://parl.ca/',
    season:[25,30,40,55,75,85,95,90,70,55,40,30]
  },

  // FOOD / MARKETS + SMALL TOWNS
  { id:'stlawrencemarket', category:['food'], province:'ON',
    name_en:'St. Lawrence Market (Toronto)', name_fr:'Marché St. Lawrence (Toronto)',
    indigenous_name:null,
    lat:43.6487, lng:-79.3716,
    source:'https://www.stlawrencemarket.com/',
    season:[40,45,55,60,65,70,75,75,70,60,50,45]
  },
  { id:'jeantalon', category:['food'], province:'QC',
    name_en:'Jean-Talon Market (Montréal)', name_fr:'Marché Jean‑Talon (Montréal)',
    indigenous_name:null,
    lat:45.535, lng:-73.614,
    source:'https://www.marchespublics-mtl.com/',
    season:[35,40,50,60,70,80,85,85,75,60,50,40]
  },
  { id:'victoriapm', category:['food'], province:'BC',
    name_en:'Victoria Public Market', name_fr:'Marché public de Victoria',
    indigenous_name:null,
    lat:48.429, lng:-123.365,
    source:'https://victoriapublicmarket.com/',
    season:[30,35,45,55,65,75,80,80,70,55,45,35]
  },
  { id:'halifaxmarket', category:['food'], province:'NS',
    name_en:'Halifax Seaport Farmers’ Market', name_fr:'Marché des fermiers du secteur riverain d’Halifax',
    indigenous_name:null,
    lat:44.640, lng:-63.569,
    source:'https://halifaxseaport.ca/farmers-market/',
    season:[25,30,40,50,60,70,75,75,65,50,40,30]
  },
  { id:'niagaraonthelake', category:['culture','food'], province:'ON',
    name_en:'Niagara‑on‑the‑Lake', name_fr:'Niagara‑on‑the‑Lake',
    indigenous_name:null,
    lat:43.255, lng:-79.074,
    source:'https://www.niagaraonthelake.com/',
    season:[25,30,40,55,75,90,100,95,70,50,35,25]
  },
  { id:'elora', category:['culture','food'], province:'ON',
    name_en:'Elora (Downtown & Gorge)', name_fr:'Elora (centre‑ville et gorge)',
    indigenous_name:null,
    lat:43.682, lng:-80.430,
    source:'https://elorafergus.ca/',
    season:[20,25,35,50,70,85,95,90,65,45,30,20]
  },
  { id:'mahonebay', category:['culture','food'], province:'NS',
    name_en:'Mahone Bay', name_fr:'Mahone Bay',
    indigenous_name:null,
    lat:44.448, lng:-64.382,
    source:'https://www.mahonebay.com/',
    season:[20,25,35,50,70,85,95,90,65,45,30,20]
  },
  { id:'standrews', category:['culture','food'], province:'NB',
    name_en:'St. Andrews by‑the‑Sea', name_fr:'St. Andrews by‑the‑Sea',
    indigenous_name:null,
    lat:45.074, lng:-67.053,
    source:'https://www.townofstandrews.ca/',
    season:[15,20,30,50,75,95,100,90,65,45,30,20]
  }
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ---------------- Map ----------------
let map, markers = {};
function initMap(){
  map = L.map('map').setView([56.1304, -106.3468], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://leafletjs.com/">Leaflet</a>'
  }).addTo(map);
}

// ---------------- Filters & Table ----------------
function activeCategories(){
  const on = [];
  if (document.getElementById('filterNature').checked) on.push('nature');
  if (document.getElementById('filterCulture').checked) on.push('culture');
  if (document.getElementById('filterFood').checked) on.push('food');
  return new Set(on);
}
function categoryLabel(cats){
  const map = { nature: LANG==='en'?'Nature':'Nature', culture: LANG==='en'?'Culture':'Culture', food: LANG==='en'?'Food':'Gastronomie' };
  return cats.map(c=> map[c]||c).join(', ');
}
function placeDisplayName(p){
  const showIndig = document.getElementById('toggleIndigenous').checked && p.indigenous_name;
  const base = LANG==='en' ? p.name_en : p.name_fr;
  return showIndig ? `${base} · ${p.indigenous_name}` : base;
}

function refresh(){
  const cats = activeCategories();
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};
  const tbody = document.getElementById('placesTable');
  tbody.innerHTML = '';

  let counts = { total:0, nature:0, culture:0, food:0 };

  PLACES.forEach(p => {
    if (!p.category.some(c => cats.has(c))) return;

    const m = L.marker([p.lat, p.lng]).addTo(map);
    m.bindPopup(`<strong>${placeDisplayName(p)}</strong><br>${categoryLabel(p.category)} · ${p.province}<br><a href="${p.source}" target="_blank" rel="noopener">Source</a><br><button data-id="${p.id}" class="focusPlace" style="margin-top:.25rem;padding:.25rem .5rem;border:1px solid #cbd5e1;border-radius:.5rem;">${LANG==='en'?'View seasonality':'Voir la saisonnalité'}</button>`);
    m.on('click', ()=> updateSeasonality(p));
    markers[p.id] = m;

    const tr = document.createElement('tr');
    tr.className = "border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer";
    tr.innerHTML = `<td class="py-2 px-3">${placeDisplayName(p)}</td>
                    <td class="py-2 px-3">${categoryLabel(p.category)}</td>
                    <td class="py-2 px-3">${p.province}</td>
                    <td class="py-2 px-3"><a class="underline" href="${p.source}" target="_blank" rel="noopener">Link</a></td>`;
    tr.addEventListener('click', ()=>{ map.setView([p.lat, p.lng], 8); markers[p.id].openPopup(); updateSeasonality(p); });
    tbody.appendChild(tr);

    counts.total++;
    if (p.category.includes('nature')) counts.nature++;
    if (p.category.includes('culture')) counts.culture++;
    if (p.category.includes('food')) counts.food++;
  });

  document.getElementById('kpiPlaces').textContent = counts.total;
  document.getElementById('kpiNature').textContent = counts.nature;
  document.getElementById('kpiCulture').textContent = counts.culture;
  document.getElementById('kpiFood').textContent = counts.food;

  map.on('popupopen', (e)=>{
    const btn = e.popup.getElement().querySelector('.focusPlace');
    if (btn){
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        const p = PLACES.find(x=>x.id===id);
        if (p) updateSeasonality(p);
      });
    }
  });
}

// ---------------- Seasonality chart ----------------
let seasonChart;
function buildSeasonChart(){
  const ctx = document.getElementById('seasonChart').getContext('2d');
  seasonChart = new Chart(ctx, {
    type: 'line',
    data: { labels: MONTHS, datasets: [{ label: 'Index', data: [], borderWidth: 2, tension: 0.2 }]},
    options: {
      responsive: true, aspectRatio: 1.9, maintainAspectRatio: true,
      scales: { y:{ beginAtZero:true, suggestedMax: 100, title:{ display:true, text: 'Index (100 = peak)'} } },
      plugins: { legend:{ display:false } }
    }
  });
}
function updateSeasonality(place){
  seasonChart.data.datasets[0].data = place.season;
  seasonChart.update();
  document.getElementById('seasonalityTitle').textContent = `${LANG==='en'?'Seasonality:':'Saisonnalité :'} ${placeDisplayName(place)}`;
}
function updateSeasonalityAverage(){
  const cats = activeCategories();
  const arrs = PLACES.filter(p=> p.category.some(c=>cats.has(c))).map(p=>p.season);
  if (arrs.length===0) return;
  const avg = Array.from({length:12}, (_,i)=> Math.round(arrs.reduce((a,b)=>a+b[i],0)/arrs.length));
  seasonChart.data.datasets[0].data = avg;
  seasonChart.update();
  document.getElementById('seasonalityTitle').textContent = LANG==='en'?'Seasonality: Filtered average':'Saisonnalité : moyenne filtrée';
}

// ---------------- Exports ----------------
function toCSV(rows){ return rows.map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'); }
function download(name, text, type='text/plain'){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); }
function downloadCanvasPNG(canvasId, filename){ const a=document.createElement('a'); a.href=document.getElementById(canvasId).toDataURL('image/png'); a.download=filename; a.click(); }
function hookExports(){
  document.getElementById('btnSeasonCSV').addEventListener('click', ()=>{
    const rows = [ ['Month'].concat(MONTHS), ['Index'].concat(seasonChart.data.datasets[0].data) ];
    download('seasonality.csv', toCSV(rows), 'text/csv');
  });
  document.getElementById('btnSeasonPNG').addEventListener('click', ()=> downloadCanvasPNG('seasonChart', 'seasonality.png'));
}

// ---------------- Wiring ----------------
function initLang(){
  applyI18N();
  const langBtn = document.getElementById('langToggle');
  langBtn.addEventListener('click', ()=>{
    LANG = LANG==='en' ? 'fr' : 'en';
    localStorage.setItem('lang', LANG);
    applyI18N();
    refresh();
    updateSeasonalityAverage();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initDark();
  initLang();
  initMap();
  buildSeasonChart();
  refresh();
  updateSeasonalityAverage();
  hookExports();

  ['filterNature','filterCulture','filterFood','toggleIndigenous'].forEach(id => {
    document.getElementById(id).addEventListener('change', ()=>{
      refresh();
      updateSeasonalityAverage();
    });
  });
});
