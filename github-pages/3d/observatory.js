'use strict';
const OBSERVATORY_STRUCTURE={id:'observatory',name:'INTELLIGENCE OBSERVATORY',role:'MCP-backed topology, thermodynamics, memory evolution, and skill development surface.',x:0,z:-16,w:7.2,d:4.2,h:7.2,color:'#ff2bd6',status:'observing'};
if(!DISTRICTS.some(item=>item.id===OBSERVATORY_STRUCTURE.id))DISTRICTS.push(OBSERVATORY_STRUCTURE);
const originalChoose=choose;
choose=function(item){originalChoose(item);if(item.id==='observatory'){setPanel('observatory');if(normalize(document.querySelector('#baseUrl').value))syncObservatory()}};
const directoryRoot=document.querySelector('#directory');directoryRoot.innerHTML='';buildDirectory();

const obsCanvas=document.querySelector('#observatoryCanvas'),obsCtx=obsCanvas.getContext('2d');
const obsStatus=document.querySelector('#observatoryStatus'),obsMetrics=document.querySelector('#observatoryMetrics'),obsFeed=document.querySelector('#observatoryFeed');
const obsDistrict=document.querySelector('#observatoryDistrict'),obsSync=document.querySelector('#observatorySync'),obsSnapshot=document.querySelector('#observatorySnapshot');
const obsTabs=[...document.querySelectorAll('[data-observatory-view]')];
const VIEW_TOOL={topology:'get_agentropolis_topology',thermodynamics:'get_agentropolis_thermodynamics',memory_evolution:'get_agentropolis_memory_evolution',skill_development:'get_agentropolis_skill_development'};
const DISTRICT_NAMES=['ALL DISTRICTS','NEURO','CHAOS CODE','CHAOS RANK','789 STUDIOS','NEURA','NTRU','CHAOSPHERE','ECHO','FEN'];
let obsView='topology',obsData=preview('topology'),obsMode='preview',obsTime=0;
for(const name of DISTRICT_NAMES){const option=document.createElement('option');option.value=name==='ALL DISTRICTS'?'':name;option.textContent=name;obsDistrict.appendChild(option)}
obsTabs.forEach(button=>button.onclick=()=>{obsView=button.dataset.observatoryView;obsTabs.forEach(item=>item.classList.toggle('active',item===button));obsData=preview(obsView);obsMode='preview';updateObservatory('CANONICAL PREVIEW · CONNECT HERMES MCP FOR RECEIPT-BACKED DATA')});
obsDistrict.onchange=()=>updateObservatory(obsStatus.textContent);
obsSync.onclick=syncObservatory;
document.querySelector('[data-open="observatory"]').addEventListener('click',()=>{if(normalize(document.querySelector('#baseUrl').value))syncObservatory()});
window.addEventListener('resize',resizeObservatory);
resizeObservatory();updateObservatory('CANONICAL PREVIEW · NOT LIVE TELEMETRY');requestAnimationFrame(animateObservatory);

async function syncObservatory(){
  const base=normalize(document.querySelector('#baseUrl').value);
  if(!base){obsStatus.className='readout offline';obsStatus.textContent='ENTER A VALID HERMES WORKER URL IN HERMES DOCK FIRST.';return}
  obsStatus.className='readout checking';obsStatus.textContent=`CALLING MCP TOOL · ${VIEW_TOOL[obsView]}`;
  obsSync.disabled=true;
  try{
    const response=await fetch(`${base}/mcp`,{method:'POST',headers:{'content-type':'application/json','mcp-protocol-version':'2025-06-18'},body:JSON.stringify({jsonrpc:'2.0',id:`obs-${Date.now()}`,method:'tools/call',params:{name:VIEW_TOOL[obsView],arguments:{}}})});
    const payload=await response.json();
    if(!response.ok||payload.error)throw Error(payload.error?.message||`HTTP ${response.status}`);
    obsData=payload.result?.structuredContent?.observatory||JSON.parse(payload.result?.content?.[0]?.text||'{}').observatory;
    if(!obsData?.data)throw Error('MCP response did not include observatory data');
    obsMode=obsData.liveTelemetry?'receipt-backed':'baseline';
    const receipt=payload.result?._meta?.receiptId||obsData.receipt?.id||'unavailable';
    updateObservatory(`${obsData.liveTelemetry?'LIVE RECEIPT-BACKED':'CANONICAL BASELINE'} · RECEIPT ${receipt}`,'online');
  }catch(error){
    obsData=preview(obsView);obsMode='preview';
    updateObservatory(`MCP UNREACHABLE · ${error.message} · SHOWING SAFE PREVIEW`,'offline');
  }finally{obsSync.disabled=false}
}

function updateObservatory(message,state){
  obsStatus.className=`readout ${state||''}`;obsStatus.textContent=message;
  const data=obsData.data||obsData;
  const summary=data.summary||{};
  obsMetrics.innerHTML=Object.entries(summary).slice(0,8).map(([key,value])=>`<div><span>${label(key)}</span><b>${format(value)}</b></div>`).join('');
  const district=obsDistrict.value;
  const rows=data.perDistrict||data.clusters||[];
  const selectedRows=district?rows.filter(item=>item.district===district):rows;
  const runtime=data.runtime||obsData.runtime||{};
  obsFeed.innerHTML=[
    `<li><i></i><span>VIEW</span><b>${label(obsView)}</b></li>`,
    `<li><i></i><span>MODE</span><b>${obsMode.toUpperCase()}</b></li>`,
    `<li><i></i><span>DISTRICT FILTER</span><b>${district||'ALL'}</b></li>`,
    `<li><i></i><span>RECEIPTS</span><b>${runtime.receiptCount||0}</b></li>`,
    `<li><i></i><span>AVG DURATION</span><b>${runtime.avgDurationMs||0} ms</b></li>`,
    `<li><i></i><span>VISIBLE RECORDS</span><b>${selectedRows.length||data.nodes?.length||data.layers?.length||0}</b></li>`
  ].join('');
  obsSnapshot.textContent=JSON.stringify(obsData,null,2);
}

function resizeObservatory(){const rect=obsCanvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);obsCanvas.width=Math.max(1,Math.floor(rect.width*dpr));obsCanvas.height=Math.max(1,Math.floor(rect.height*dpr));obsCtx.setTransform(dpr,0,0,dpr,0,0)}
function animateObservatory(t){obsTime=t*.001;drawObservatory();requestAnimationFrame(animateObservatory)}
function drawObservatory(){const w=obsCanvas.clientWidth,h=obsCanvas.clientHeight;if(!w||!h)return;obsCtx.clearRect(0,0,w,h);drawBackdrop(w,h);const data=obsData.data||obsData;if(obsView==='topology')drawTopology(data,w,h);else if(obsView==='thermodynamics')drawThermodynamics(data,w,h);else if(obsView==='memory_evolution')drawMemory(data,w,h);else drawSkills(data,w,h)}
function drawBackdrop(w,h){const g=obsCtx.createRadialGradient(w*.5,h*.5,10,w*.5,h*.5,Math.max(w,h)*.75);g.addColorStop(0,'rgba(0,189,232,.13)');g.addColorStop(.55,'rgba(255,43,214,.045)');g.addColorStop(1,'rgba(1,3,6,.94)');obsCtx.fillStyle=g;obsCtx.fillRect(0,0,w,h);obsCtx.strokeStyle='rgba(0,245,212,.052)';obsCtx.lineWidth=1;for(let x=0;x<w;x+=32){obsCtx.beginPath();obsCtx.moveTo(x,0);obsCtx.lineTo(x,h);obsCtx.stroke()}for(let y=0;y<h;y+=32){obsCtx.beginPath();obsCtx.moveTo(0,y);obsCtx.lineTo(w,y);obsCtx.stroke()}}
function drawTopology(data,w,h){const nodes=data.nodes||[],edges=data.edges||[],map=new Map(),district=obsDistrict.value;const core=nodes.find(n=>n.type==='core')||nodes[0];map.set(core?.id,{x:w*.5,y:h*.72});const infra=nodes.filter(n=>n.type==='infrastructure');infra.forEach((n,i)=>{const a=-Math.PI*.88+i/(Math.max(1,infra.length-1))*Math.PI*1.76;map.set(n.id,{x:w*.5+Math.cos(a)*w*.22,y:h*.58+Math.sin(a)*h*.25})});const ds=nodes.filter(n=>n.type==='district');ds.forEach((n,i)=>{const a=-Math.PI*.95+i/(Math.max(1,ds.length-1))*Math.PI*1.9;map.set(n.id,{x:w*.5+Math.cos(a)*w*.43,y:h*.52+Math.sin(a)*h*.42})});obsCtx.lineWidth=1;for(const edge of edges){const a=map.get(edge.source),b=map.get(edge.target);if(!a||!b)continue;obsCtx.strokeStyle='rgba(0,189,232,.25)';obsCtx.beginPath();obsCtx.moveTo(a.x,a.y);obsCtx.quadraticCurveTo((a.x+b.x)/2,h*.48,b.x,b.y);obsCtx.stroke()}for(const node of nodes){const p=map.get(node.id);if(!p)continue;const active=!district||node.label===district||node.type!=='district';const color=node.type==='core'?'#00f5d4':node.type==='infrastructure'?'#00bde8':palette(node.index||0);glowNode(p.x,p.y,node.type==='core'?11:node.type==='infrastructure'?7:5,color,active?1:.16);if(active){obsCtx.fillStyle='#e9ffff';obsCtx.font=`${node.type==='district'?700:600} ${node.type==='core'?11:9}px ui-monospace,monospace`;obsCtx.textAlign='center';obsCtx.fillText(node.label,p.x,p.y+(node.type==='core'?25:16))}}}
function drawThermodynamics(data,w,h){const rows=filtered(data.perDistrict||[]),cx=w*.5,cy=h*.55;rows.forEach((row,i)=>{const a=i/Math.max(1,rows.length)*Math.PI*2-Math.PI/2,r=Math.min(w,h)*(.24+(i%3)*.055),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,heat=row.entropyRate||0,color=heat>.3?'#ff2a4f':heat>.2?'#ff2bd6':'#00f5d4';obsCtx.strokeStyle=`${color}44`;obsCtx.lineWidth=Math.max(1,row.energyIn/30);obsCtx.beginPath();obsCtx.moveTo(cx,cy);obsCtx.lineTo(x,y);obsCtx.stroke();glowNode(x,y,4+row.computeLoad/35,color,1);obsCtx.fillStyle='#e9ffff';obsCtx.font='8px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText(row.district,x,y+16)});const summary=data.summary||{};ring(cx,cy,Math.min(w,h)*.12,'#00bde8',summary.stabilityIndex||0);ring(cx,cy,Math.min(w,h)*.17,'#ff2bd6',100-(summary.coordinationFriction||0));obsCtx.fillStyle='#fff';obsCtx.font='700 24px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText(`${summary.stabilityIndex||0}%`,cx,cy+6);obsCtx.font='9px ui-monospace,monospace';obsCtx.fillStyle='#98a9ad';obsCtx.fillText('STABILITY INDEX',cx,cy+24)}
function drawMemory(data,w,h){const layers=data.layers||[],clusters=filtered(data.clusters||[]),cx=w*.5,cy=h*.54,max=Math.min(w,h)*.4;layers.forEach((layer,i)=>{const r=max*(i+1)/layers.length;obsCtx.strokeStyle=`${layer.color||palette(i)}66`;obsCtx.lineWidth=1.5;obsCtx.setLineDash([4+i*2,6]);obsCtx.beginPath();obsCtx.arc(cx,cy,r,0,Math.PI*2);obsCtx.stroke();obsCtx.setLineDash([]);obsCtx.fillStyle=layer.color||palette(i);obsCtx.font='8px ui-monospace,monospace';obsCtx.fillText(`${layer.id} ${layer.label}`,cx+r*.72,cy-r*.68)});clusters.forEach((item,i)=>{const a=i/Math.max(1,clusters.length)*Math.PI*2+obsTime*.03,r=max*(.28+(i%layers.length)/layers.length*.64),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;const color=palette(i);glowNode(x,y,4+item.confidence*4,color,1);obsCtx.fillStyle='#e9ffff';obsCtx.font='8px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText(item.district,x,y+15)});glowNode(cx,cy,12,'#00f5d4',1);obsCtx.fillStyle='#fff';obsCtx.font='700 10px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText('CORE MEMORY',cx,cy+28)}
function drawSkills(data,w,h){const stages=data.stages||[],rows=filtered(data.perDistrict||[]),startX=w*.1,endX=w*.9,y=h*.28;obsCtx.strokeStyle='rgba(0,245,212,.3)';obsCtx.lineWidth=2;obsCtx.beginPath();obsCtx.moveTo(startX,y);obsCtx.lineTo(endX,y);obsCtx.stroke();stages.forEach((stage,i)=>{const x=startX+i/(Math.max(1,stages.length-1))*(endX-startX),color=palette(i);glowNode(x,y,7,color,1);obsCtx.fillStyle='#e9ffff';obsCtx.font='8px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText(stage.label.toUpperCase(),x,y+22)});rows.forEach((row,i)=>{const x=startX+i/(Math.max(1,rows.length-1))*(endX-startX),base=h*.78,top=h*.48-(row.readiness||50)*1.1;obsCtx.strokeStyle=palette(i);obsCtx.lineWidth=2;obsCtx.beginPath();obsCtx.moveTo(x,base);obsCtx.lineTo(x,top);obsCtx.stroke();for(let j=0;j<5;j++){const bx=x+(j-2)*9,by=top-j*9-Math.sin(obsTime+i+j)*3;glowNode(bx,by,3,palette(i+j),1)}obsCtx.fillStyle='#e9ffff';obsCtx.font='8px ui-monospace,monospace';obsCtx.textAlign='center';obsCtx.fillText(row.district,x,base+16);obsCtx.fillStyle='#d7ff3f';obsCtx.fillText(`${row.readiness}%`,x,top-12)})}
function filtered(rows){return obsDistrict.value?rows.filter(row=>row.district===obsDistrict.value):rows}
function glowNode(x,y,r,color,alpha){obsCtx.save();obsCtx.globalAlpha=alpha;obsCtx.shadowColor=color;obsCtx.shadowBlur=14;obsCtx.fillStyle=color;obsCtx.beginPath();obsCtx.arc(x,y,r,0,Math.PI*2);obsCtx.fill();obsCtx.shadowBlur=0;obsCtx.fillStyle='#fff';obsCtx.globalAlpha=Math.min(1,alpha+.15);obsCtx.beginPath();obsCtx.arc(x,y,Math.max(1,r*.35),0,Math.PI*2);obsCtx.fill();obsCtx.restore()}
function ring(x,y,r,color,value){obsCtx.strokeStyle='rgba(255,255,255,.08)';obsCtx.lineWidth=7;obsCtx.beginPath();obsCtx.arc(x,y,r,0,Math.PI*2);obsCtx.stroke();obsCtx.strokeStyle=color;obsCtx.lineCap='round';obsCtx.beginPath();obsCtx.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,Math.min(100,value))/100);obsCtx.stroke();obsCtx.lineCap='butt'}
function palette(i){return['#00f5d4','#00bde8','#536dfe','#a75cff','#ff2bd6','#ff2a4f','#f3cf72','#d7ff3f'][i%8]}
function label(value){return String(value).replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase()}
function format(value){return typeof value==='number'&&value%1?value.toFixed(2):String(value)}
function preview(view){const names=DISTRICT_NAMES.slice(1);const runtime={receiptCount:0,avgDurationMs:0,lastReceiptAt:null,toolCalls:[]};if(view==='topology'){const nodes=[{id:'grid-core',label:'GRID CORE',type:'core'}];['Agent Runtime','Memory Layer','Skill Registry','Dispatch Protocol','MCP Capability Membrane','Receipt Ledger'].forEach((name,i)=>nodes.push({id:`infra-${i}`,label:name,type:'infrastructure',index:i}));names.forEach((name,i)=>nodes.push({id:`district-${i}`,label:name,type:'district',index:i}));const edges=nodes.slice(1,7).map(n=>({source:'grid-core',target:n.id}));names.forEach((_,i)=>{edges.push({source:`infra-${i%6}`,target:`district-${i}`});edges.push({source:`infra-${(i+2)%6}`,target:`district-${i}`})});return{view,data:{summary:{nodeCount:nodes.length,edgeCount:edges.length,districtCount:names.length,connectedComponents:1,averageDegree:2.3},nodes,edges,runtime}}}if(view==='thermodynamics'){const perDistrict=names.map((district,i)=>({district,energyIn:60+i*3,computeLoad:44+i*2,valueOut:48+i*2,friction:12+i*2,entropyRate:.12+i*.02,drift:6+i,stability:91-i*2}));return{view,data:{summary:{energyIn:73,valueOut:58,coordinationFriction:21,entropyRate:.21,drift:11,stabilityIndex:87},perDistrict,runtime}}}if(view==='memory_evolution'){const layers=['CORE','EARLY','DEVELOPING','RECENT','NEWEST'].map((name,i)=>({id:`L${i}`,label:name,count:90+i*56,color:palette(i)}));const clusters=names.map((district,i)=>({district,episodic:34+i,semantic:28+i,procedural:18+i,constitutional:12,confidence:.82+i*.01,provenanceCoverage:84+i,contradictions:i%3}));return{view,data:{summary:{totalMemories:1124,averageConfidence:.91,provenanceCoverage:92,contradictions:7,archived:104},layers,clusters,runtime}}}const stages=['Observation','Training','Sandbox Testing','Council Review','Bounded Deployment','Verified Competence'].map((name,i)=>({id:`s${i}`,label:name,order:i+1}));const perDistrict=names.map((district,i)=>({district,observation:94-i,training:84-i,sandbox:72-i,councilReview:63-i,boundedDeployment:54-i,verifiedCompetence:43-i,readiness:76-i*2}));return{view,data:{summary:{trackedCapabilities:126,verifiedCapabilities:34,averageReadiness:68,approvalState:'human-governed',selfPromotionAllowed:false},stages,perDistrict,runtime}}}
