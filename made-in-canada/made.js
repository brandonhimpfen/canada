
const PRODUCTS=[
  {id:'autos', name:'Autos', lat:42.98, lng:-82.42, provinces:['ON','QC'], canadianContent:0.65},
  {id:'aerospace', name:'Aerospace', lat:45.5, lng:-73.56, provinces:['QC','ON','MB'], canadianContent:0.58},
  {id:'agri', name:'Agri-food', lat:50.45, lng:-104.61, provinces:['SK','AB','MB'], canadianContent:0.72},
  {id:'battery', name:'EV batteries', lat:43.25, lng:-79.87, provinces:['ON','QC','NL'], canadianContent:0.61}
];
const PROV_INPUTS={'ON':30,'QC':24,'BC':8,'AB':12,'MB':6,'SK':9,'NS':4,'NB':3,'NL':2,'PE':1,'YT':1,'NT':0.5,'NU':0.5};

function darkToggle(){document.getElementById('darkToggle').onclick=()=>document.documentElement.classList.toggle('dark');}
document.addEventListener('DOMContentLoaded',()=>{
  darkToggle();
  const map=L.map('map').setView([54.5,-96],4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OSM | Leaflet'}).addTo(map);
  PRODUCTS.forEach(p=>{
    const m=L.marker([p.lat,p.lng]).addTo(map);
    m.bindPopup(`<strong>${p.name}</strong><br>Provinces: ${p.provinces.join(', ')}<br>Canadian content: ${(p.canadianContent*100).toFixed(0)}%`);
  });

  new Chart(document.getElementById('contentChart'),{
    type:'bar',data:{labels:PRODUCTS.map(p=>p.name),datasets:[{label:'Canadian content %',data:PRODUCTS.map(p=>Math.round(p.canadianContent*100))}]},
    options:{responsive:true,aspectRatio:1.9,maintainAspectRatio:true,scales:{y:{beginAtZero:true,max:100}}}
  });
  new Chart(document.getElementById('provChart'),{
    type:'bar',data:{labels:Object.keys(PROV_INPUTS),datasets:[{label:'Input share (index)',data:Object.values(PROV_INPUTS)}]},
    options:{indexAxis:'y',responsive:true,aspectRatio:1.2,maintainAspectRatio:true}
  });
});
