
const ITEMS=[
  {year:1874,title:'Telephone (Bell)',meta:'Montréal / Brantford',link:'https://www.thecanadianencyclopedia.ca/en/article/telephone'},
  {year:1921,title:'Insulin (Banting, Best, Macleod, Collip)',meta:'Toronto',link:'https://www.nobelprize.org/prizes/medicine/1923/summary/'},
  {year:1950,title:'Avro CF-100 / Aerospace advances',meta:'Malton, ON',link:'#'},
  {year:1981,title:'Canadarm',meta:'NRC/CSA–MDA',link:'https://www.asc-csa.gc.ca/eng/canadarm/'},
  {year:1999,title:'BlackBerry smartphones',meta:'Waterloo, ON',link:'#'},
  {year:2012,title:'Deep learning breakthroughs',meta:'Toronto, Montréal',link:'#'},
  {year:2021,title:'mRNA manufacturing expansion',meta:'Montréal, QC',link:'#'}
];
function darkToggle(){document.getElementById('darkToggle').onclick=()=>document.documentElement.classList.toggle('dark');}
function buildTimeline(){
  const ul=document.getElementById('timeline'); ul.innerHTML='';
  ITEMS.sort((a,b)=>a.year-b.year).forEach(it=>{
    const li=document.createElement('li'); li.className='timeline-item';
    li.innerHTML=`<div class="timeline-title">${it.year} — ${it.title}</div><div class="timeline-meta">${it.meta} • <a class="underline" href="${it.link}" target="_blank">Source</a></div>`;
    ul.appendChild(li);
  });
}
function decadeCounts(){
  const counts={}; ITEMS.forEach(it=>{const d=Math.floor(it.year/10)*10; counts[d]=(counts[d]||0)+1;}); return counts;
}
document.addEventListener('DOMContentLoaded',()=>{
  darkToggle(); buildTimeline();
  const dc=decadeCounts();
  new Chart(document.getElementById('decadeChart'),{type:'bar',data:{labels:Object.keys(dc),datasets:[{label:'Count',data:Object.values(dc)}]},options:{responsive:true,aspectRatio:1.6,maintainAspectRatio:true}});
});
