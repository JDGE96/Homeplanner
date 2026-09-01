const DEFAULT={settings:{income:4004,savings:0,savingsGoal:4000,userName:"",moveDate:"",area:"",housingNotes:"",buyPrice:250000,buyDown:20000,buyRate:6.5,buyTerm:30,buyTaxes:3000,buyInsurance:1500,buyHoa:0,buyUtilities:200,buyRoommate:700,buyClosingPct:3,buyReserves:5000},bills:[{name:"Car payment",amount:0},{name:"Car insurance",amount:0},{name:"Phone",amount:0},{name:"Internet",amount:0},{name:"Subscriptions",amount:0},{name:"Other",amount:0}],moveCosts:[{name:"First month's rent",amount:0},{name:"Security deposit",amount:0},{name:"Application / admin fees",amount:0},{name:"Utility deposits / setup",amount:0},{name:"Moving truck / movers",amount:0},{name:"Furniture / household items",amount:0}],apartments:[],checks:{}};let data=load();
function load(){try{return Object.assign(structuredClone(DEFAULT),JSON.parse(localStorage.getItem("homePlannerData")||"{}"))}catch{return structuredClone(DEFAULT)}}
function persist(){localStorage.setItem("homePlannerData",JSON.stringify(data))}
function save(){persist();renderAll()}
function money(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)||0)}
function val(id){return Number(document.getElementById(id)?.value)||0}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function budget(){let income=+data.settings.income||0,bills=(data.bills||[]).reduce((s,b)=>s+(+b.amount||0),0);return{comfort:Math.max(0,income*.3-bills),stretch:Math.max(0,income*.35-bills),max:Math.max(0,income*.4-bills)}}
function aptTotal(a){return["rent","amenity","trash","water","parking","internet","otherFee","electric","insurance","utilities"].reduce((s,k)=>s+(+a[k]||0),0)}
function go(id){document.querySelectorAll(".section").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.section===id));scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".tab").forEach(x=>x.onclick=()=>go(x.dataset.section));document.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>go(x.dataset.go));

function aptCard(a){let t=aptTotal(a),b=budget(),cls=t<=b.comfort?"good":t<=b.stretch?"warn":"danger";return `<article class="card apt"><span class="badge">${esc(a.status)}</span><h3>${esc(a.name)}</h3><div class="price">${money(t)}<small class="muted"> / mo true cost</small></div><div class="meta"><div><small>Advertised</small>${money(a.rent)}</div><div><small>Vs comfortable</small><span class="${cls}">${t>b.comfort?"+":""}${money(t-b.comfort)}</span></div></div><div class="apt-actions">${a.url?`<a class="url" href="${esc(a.url)}" target="_blank" rel="noopener">Open listing ↗</a>`:""}<button class="secondary small edit" data-id="${a.id}">Edit</button><button class="secondary small del" data-id="${a.id}">Delete</button></div></article>`}
function bindApts(){document.querySelectorAll(".edit").forEach(x=>x.onclick=()=>editApt(x.dataset.id));document.querySelectorAll(".del").forEach(x=>x.onclick=()=>{if(confirm("Delete this apartment?")){data.apartments=data.apartments.filter(a=>a.id!==x.dataset.id);save()}})}
function renderApts(){let html=data.apartments.length?data.apartments.map(aptCard).join(""):`<div class="card empty">No apartments saved yet.<br><br><button class="primary" id="emptyNew">＋ Add your first apartment</button></div>`;document.getElementById("apartmentList").innerHTML=html;document.getElementById("dashboardApartments").innerHTML=data.apartments.slice(0,3).map(aptCard).join("")||`<div class="empty">No apartments saved yet.</div>`;bindApts();document.getElementById("emptyNew")?.addEventListener("click",newApt)}
function renderBudget(){let b=budget();document.getElementById("income").value=data.settings.income;document.getElementById("budgetComfort").textContent=money(b.comfort);document.getElementById("budgetStretch").textContent=money(b.stretch);document.getElementById("budgetMax").textContent=money(b.max);document.getElementById("billInputs").innerHTML=data.bills.map((x,i)=>`<div class="billrow"><input data-bn="${i}" value="${esc(x.name)}"><input data-ba="${i}" type="number" min="0" value="${x.amount}"><button class="remove" data-br="${i}">×</button></div>`).join("");document.querySelectorAll("[data-bn]").forEach(x=>x.oninput=()=>{data.bills[x.dataset.bn].name=x.value;persist()});document.querySelectorAll("[data-ba]").forEach(x=>x.oninput=()=>{data.bills[x.dataset.ba].amount=x.value;persist();renderBudget();renderDashboard()});document.querySelectorAll("[data-br]").forEach(x=>x.onclick=()=>{data.bills.splice(+x.dataset.br,1);save()})}
function renderDashboard(){let b=budget(),s=+data.settings.savings||0,g=+data.settings.savingsGoal||0,p=g?Math.min(100,s/g*100):0;document.getElementById("dashIncome").textContent=money(data.settings.income);document.getElementById("dashComfort").textContent=money(b.comfort);document.getElementById("dashStretch").textContent=money(b.stretch);document.getElementById("dashMax").textContent=money(b.max);document.getElementById("dashSavings").textContent=money(s);document.getElementById("dashProgress").style.width=p+"%";document.getElementById("dashSavingsText").textContent=g?`${money(Math.max(0,g-s))} still needed to reach your goal.`:"Set your savings goal in Settings."}
function renderMove(){document.getElementById("savings").value=data.settings.savings;document.getElementById("savingsGoal").value=data.settings.savingsGoal;document.getElementById("moveInputs").innerHTML=data.moveCosts.map((x,i)=>`<div class="moverow"><input data-mn="${i}" value="${esc(x.name)}"><input data-ma="${i}" type="number" min="0" value="${x.amount}"><button class="remove" data-mr="${i}">×</button></div>`).join("");document.querySelectorAll("[data-mn]").forEach(x=>x.oninput=()=>{data.moveCosts[x.dataset.mn].name=x.value;persist()});document.querySelectorAll("[data-ma]").forEach(x=>x.oninput=()=>{data.moveCosts[x.dataset.ma].amount=x.value;persist();renderMoveTotals()});document.querySelectorAll("[data-mr]").forEach(x=>x.onclick=()=>{data.moveCosts.splice(+x.dataset.mr,1);save()});renderMoveTotals()}
function renderMoveTotals(){let t=data.moveCosts.reduce((s,x)=>s+(+x.amount||0),0),g=+data.settings.savingsGoal||0,s=+data.settings.savings||0,p=g?Math.min(100,s/g*100):0;document.getElementById("moveTotal").textContent=money(t);document.getElementById("moveProgress").style.width=p+"%";document.getElementById("moveProgressText").textContent=g?`${money(s)} saved of ${money(g)} goal (${Math.round(p)}%).`:"Set a goal above."}
const lists={generalChecklist:["Confirm total monthly cost including mandatory fees","Ask about income requirements","Ask about credit requirements","Confirm exact move-in amount","Ask which utilities you pay","Ask whether renters insurance is required","Ask about application/admin fees","Ask about pet restrictions and fees"],tourChecklist:["Check cell service","Check water pressure and hot water","Look for leaks, stains, mold, or damage","Check windows and locks","Test appliances","Ask about parking","Check noise from neighbors / road","Ask who handles maintenance","Check laundry situation","Look at the actual unit"],leaseChecklist:["Read every mandatory fee","Check lease length","Check renewal/rent increase terms","Check early termination rules","Check security deposit terms","Document existing damage","Confirm utilities before move-in","Get promises in writing","Save a copy of the signed lease"]};
function renderChecks(){Object.entries(lists).forEach(([group,items])=>{let box=document.getElementById(group);box.innerHTML=items.map((x,i)=>{let k=group+i;return `<label class="checkitem"><input type="checkbox" data-check="${k}" ${data.checks[k]?"checked":""}><span>${x}</span></label>`}).join("");box.querySelectorAll("[data-check]").forEach(x=>x.onchange=()=>{data.checks[x.dataset.check]=x.checked;persist()})})}

function buyingCalc(){
  const price=+data.settings.buyPrice||0, down=Math.min(Math.max(+data.settings.buyDown||0,0),price);
  const rate=(+data.settings.buyRate||0)/100, years=+data.settings.buyTerm||30;
  const loan=Math.max(0,price-down), n=years*12, r=rate/12;
  const pi=loan===0?0:(r===0?loan/n:loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1));
  const taxes=(+data.settings.buyTaxes||0)/12, ins=(+data.settings.buyInsurance||0)/12;
  const hoa=+data.settings.buyHoa||0, utilities=+data.settings.buyUtilities||0;
  const ltv=price?loan/price:0;
  // Simple planning estimate: 0.5% of the original loan per year when under 20% down.
  const pmi=ltv>0.8?loan*0.005/12:0;
  const total=pi+taxes+ins+hoa+utilities+pmi;
  const roommate=+data.settings.buyRoommate||0;
  const share=Math.max(0,total-roommate);
  const closing=price*(+data.settings.buyClosingPct||0)/100;
  const reserves=+data.settings.buyReserves||0;
  return {price,down,loan,pi,taxes,ins,hoa,utilities,pmi,total,roommate,share,closing,reserves,cash:down+closing+reserves};
}
function renderBuying(){
  const keys=["buyPrice","buyDown","buyRate","buyTerm","buyTaxes","buyInsurance","buyHoa","buyUtilities","buyRoommate","buyClosingPct","buyReserves"];
  keys.forEach(k=>{const el=document.getElementById(k);if(el)el.value=data.settings[k]??""});
  const c=buyingCalc(), b=budget();
  document.getElementById("buyPI").textContent=money(c.pi);
  document.getElementById("buyTotal").textContent=money(c.total);
  document.getElementById("buyShare").textContent=money(c.share);
  document.getElementById("buyDownOut").textContent=money(c.down);
  document.getElementById("buyClosingOut").textContent=money(c.closing);
  document.getElementById("buyReserveOut").textContent=money(c.reserves);
  document.getElementById("buyCashOut").textContent=money(c.cash);
  document.getElementById("buyAfford").textContent=money(c.share);
  const cashAvailable=+data.settings.savings||0;
  const cashMsg=document.getElementById("buyCashMessage");
  cashMsg.textContent=c.cash<=cashAvailable
    ? `${money(cashAvailable-c.cash)} would remain from your current savings.`
    : `${money(c.cash-cashAvailable)} more cash would be needed than your current savings.`;
  cashMsg.className=c.cash<=cashAvailable?"good":"danger";
  const m=document.getElementById("buyBudgetMessage");
  m.textContent=c.share<=b.comfort
    ? `${money(b.comfort-c.share)} under your comfortable target.`
    : c.share<=b.stretch
      ? `${money(c.share-b.comfort)} above comfortable, within stretch.`
      : c.share<=b.max
        ? `${money(c.share-b.stretch)} above stretch, below maximum.`
        : `${money(c.share-b.max)} above your maximum.`;
  m.className=c.share<=b.comfort?"good":c.share<=b.stretch?"warn":"danger";
}

function renderSettings(){["userName","moveDate","area","housingNotes"].forEach(k=>document.getElementById(k).value=data.settings[k]||"")}
function renderAll(){renderDashboard();renderApts();renderBudget();renderMove();renderBuying();renderChecks();renderSettings()}
document.getElementById("income").oninput=e=>{data.settings.income=+e.target.value||0;persist();renderBudget();renderDashboard()};
document.getElementById("savings").oninput=e=>{data.settings.savings=+e.target.value||0;persist();renderMoveTotals();renderDashboard()};
document.getElementById("savingsGoal").oninput=e=>{data.settings.savingsGoal=+e.target.value||0;persist();renderMoveTotals();renderDashboard()};
document.getElementById("addBillBtn").onclick=()=>{data.bills.push({name:"New bill",amount:0});save()};document.getElementById("addMoveBtn").onclick=()=>{data.moveCosts.push({name:"New cost",amount:0});save()};
document.getElementById("saveSettingsBtn").onclick=()=>{["userName","moveDate","area","housingNotes"].forEach(k=>data.settings[k]=document.getElementById(k).value);save();alert("Settings saved.")};


["buyPrice","buyDown","buyRate","buyTerm","buyTaxes","buyInsurance","buyHoa","buyUtilities","buyRoommate","buyClosingPct","buyReserves"].forEach(k=>{
  const el=document.getElementById(k);
  if(el) el.oninput=e=>{data.settings[k]=e.target.value;persist();renderBuying()};
});
const modal=document.getElementById("modal"),ids=["id","name","url","rent","deposit","admin","oneTime","amenity","trash","water","parking","internet","otherFee","electric","insurance","utilities","notes","status"],els=["apartmentId","aName","aUrl","aRent","aDeposit","aAdmin","aOneTime","aAmenity","aTrash","aWater","aParking","aInternet","aOtherFee","aElectric","aInsurance","aUtilities","aNotes","aStatus"];
function newApt(){document.getElementById("modalTitle").textContent="Add Apartment";document.getElementById("apartmentForm").reset();document.getElementById("aStatus").value="Interested";modal.classList.remove("hidden");live()}
function editApt(id){let a=data.apartments.find(x=>x.id===id);if(!a)return;document.getElementById("modalTitle").textContent="Edit Apartment";ids.forEach((k,i)=>document.getElementById(els[i]).value=a[k]??"");modal.classList.remove("hidden");live()}
function close(){modal.classList.add("hidden")}function obj(){let o={};ids.forEach((k,i)=>o[k]=document.getElementById(els[i]).value);o.id=o.id||crypto.randomUUID();return o}
function live(){let t=aptTotal(obj()),b=budget(),m=document.getElementById("liveBudgetMessage");document.getElementById("liveTotal").textContent=money(t);m.textContent=t<=b.comfort?`${money(b.comfort-t)} under comfortable target.`:t<=b.stretch?`${money(t-b.comfort)} above comfortable, within stretch.`:t<=b.max?`${money(t-b.stretch)} above stretch, below maximum.`:`${money(t-b.max)} above your maximum.`;m.className=t<=b.comfort?"good":t<=b.stretch?"warn":"danger"}
document.getElementById("newApartmentBtn").onclick=newApt;document.getElementById("closeModal").onclick=close;document.getElementById("cancelApartment").onclick=close;modal.onclick=e=>{if(e.target===modal)close()};document.querySelectorAll("#apartmentForm input,#apartmentForm select").forEach(x=>x.oninput=live);
document.getElementById("apartmentForm").onsubmit=e=>{e.preventDefault();let a=obj(),i=data.apartments.findIndex(x=>x.id===a.id);i>=0?data.apartments[i]=a:data.apartments.unshift(a);save();close();go("apartments")};
document.getElementById("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="my-home-planner-backup.json";a.click();URL.revokeObjectURL(u)};
document.getElementById("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.settings||!x.apartments)throw 0;data=x;save();alert("Backup imported.")}catch{alert("Invalid My Home Planner backup.")}};r.readAsText(f)};
renderAll();