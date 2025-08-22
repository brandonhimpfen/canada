
const SITES=[
  {type:'hydro', name:'Hydro-Québec complex', lat:49.7, lng:-74.0},
  {type:'nuclear', name:'Bruce Nuclear', lat:44.33, lng:-81.59},
  {type:'wind', name:'Southern AB wind belt', lat:49.7, lng:-113.5},
  {type:'nickel', name:'Sudbury Nickel', lat:46.49, lng:-81.01},
  {type:'lithium', name:'James Bay Lithium', lat:52.0, lng:-76.0}
];
const COLORS={hydro:'#38bdf8', nuclear:'#a855f7', wind:'#22c55e', nickel:'#f59e0b', lithium:'#f43f5e'};
const PRODUCTION={'QC':{'hydro':95,'wind':40,'nuclear':0,'nickel':20,'lithium':15},'ON':{'hydro':35,'wind':30,'nuclear':90,'nickel':80,'lithium':5},'AB':{'hydro':10,'wind':85,'nuclear':0,'nickel':5,'lithium':10},'BC':{'hydro':80,'wind':25,'nuclear':0,'nickel':10,'lithium':8}};

function darkToggle(){document.getElementById('darkToggle').onclick=()=>document.documentElement.classList.toggle('dark');}
document.addEventListener('DOMContentLoaded',()=>{
  darkToggle();
  const map=L.map('map').setView([55,-96],4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OSM | Leaflet'}).addTo(map);
  SITES.forEach(s=>{
    const m=L.circleMarker([s.lat,s.lng],{radius:7,color:COLORS[s.type],fillColor:COLORS[s.type],fillOpacity:.85,weight:1}).addTo(map);
    m.bindPopup(`<strong>${s.name}</strong><br>Type: ${s.type}`);
  });
  const provs=Object.keys(PRODUCTION);
  const types=['hydro','wind','nuclear','nickel','lithium'];
  new Chart(document.getElementById('prodChart'),{
    type:'bar',data:{labels:provs,datasets:types.map(t=>({label:t,data:provs.map(p=>PRODUCTION[p][t]||0)}))},
    options:{responsive:true,aspectRatio:1.6,maintainAspectRatio:true,scales:{y:{beginAtZero:true}},plugins:{legend:{position:'bottom'}}}
  });
});
