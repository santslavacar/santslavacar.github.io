import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification,signOut,updateProfile} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,collection,onSnapshot,setDoc,updateDoc,deleteDoc,addDoc,query,where,runTransaction,deleteField,arrayUnion,getDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const FB={apiKey:"AIzaSyBoqBROe9vmXqK8N8tY0d9b96NvxA-yJwM",authDomain:"santslavacar.firebaseapp.com",projectId:"santslavacar",storageBucket:"santslavacar.firebasestorage.app",messagingSenderId:"984432354821",appId:"1:984432354821:web:393b71cb42358f893d1e6c"};
const fbApp=initializeApp(FB),auth=getAuth(fbApp),db=getFirestore(fbApp);auth.languageCode='pt-BR';
const EMPRESAS=['gstsoares27@gmail.com'];
const GALLERY=[
 {service:'Higienização de bancos',img:'bancos-1',alt:'Banco traseiro com metade já higienizada, mostrando a diferença da limpeza'},
 {service:'Higienização de bancos',img:'bancos-2',alt:'Extratora retirando sujeira do tecido do banco'},
 {service:'Higienização de bancos',img:'bancos-3',alt:'Banco cinza com a faixa limpa ao lado da parte ainda suja'},
 {service:'Restauração de plásticos e borrachas',img:'plasticos',alt:'Coluna da porta antes e depois da restauração'},
 {service:'Polimento e vitrificação de faróis',img:'farois',alt:'Farol amarelado antes e farol transparente depois'},
 {service:'Enceramento',img:'enceramento',alt:'Capô preto encerado refletindo os prédios'},
];
/* ===== Base e regras ===== */
const SIZES={moto:'Moto',p:'Pequeno',m:'Médio',g:'Grande',gg:'Extra grande'};
const SIZE_HINT={moto:'Todas as motos',p:'Celta, Kwid, Mobi',m:'Onix Plus, Creta, Strada',g:'Sportage, Corolla, Compass',gg:'Hilux, S10, SW4, vans'};
const SIZE_KEYS=['moto','p','m','g','gg'];
const VEH=[];
Object.entries(CARS).forEach(([b,o])=>Object.entries(o).forEach(([s,l])=>l.split(',').forEach(m=>VEH.push({type:'carro',brand:b,model:m,size:s}))));
Object.entries(BIKES).forEach(([b,l])=>l.split(',').forEach(m=>VEH.push({type:'moto',brand:b,model:m,size:'moto'})));
const SVC0=[
 {id:'simples',name:'Simples',group:'pacote',tier:'blue',icon:'shower',items:['Lavagem externa','Secagem','Pretinho'],min:{moto:30,p:30,m:40,g:50,gg:60}},
 {id:'completa',name:'Completa',group:'pacote',tier:'green',icon:'vacuum',items:['Lavagem externa','Secagem','Aspiração','Silicone em painéis e plásticos','Pretinho'],min:{moto:45,p:60,m:75,g:90,gg:110}},
 {id:'plus',name:'Plus',group:'pacote',tier:'orange',icon:'star',items:['Tudo da Completa','Lavagem técnica dos plásticos do interior','Revitalização dos plásticos internos','Acabamento superior dos pneus'],min:{moto:null,p:120,m:150,g:180,gg:210}},
 {id:'premium',name:'Premium',group:'pacote',tier:'purple',icon:'gem',items:['Tudo da Lavagem Plus','Limpeza detalhada de cantos, grades e emblemas','Descontaminação dos vidros','Finalização com brilho intenso e toque liso'],min:{moto:null,p:180,m:210,g:240,gg:300}},
 {id:'black',name:'Black',group:'pacote',tier:'gold',icon:'crown',items:['Tudo da Lavagem Premium','Lavagem técnica detalhada completa','Descontaminação química e mecânica','Restauração e revitalização dos plásticos internos e externos','Limpeza detalhada de rodas e caixa de rodas','Acabamento de frestas, emblemas e cantos','Proteção da pintura e vidros com toque liso','Enceramento'],min:{moto:null,p:300,m:360,g:420,gg:480}},
 {id:'polimento',name:'Polimento técnico',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:180,m:240,g:300,gg:360}},
 {id:'bancos',name:'Higienização de bancos',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:90,m:120,g:150,gg:180}},
 {id:'carpetes',name:'Higienização de carpetes',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:45,m:60,g:75,gg:90}},
 {id:'teto',name:'Higienização de teto',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:40,m:50,g:60,gg:75}},
 {id:'vit-pintura',name:'Vitrificação da pintura',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:240,m:300,g:360,gg:480}},
 {id:'vit-plasticos',name:'Vitrificação de plásticos',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:60,m:75,g:90,gg:120}},
 {id:'farois',name:'Revitalização de faróis',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:60,m:60,g:75,gg:90}},
 {id:'rec-bancos',name:'Recuperação de bancos em tecido',group:'extra',tier:'sky',icon:'spark',items:[],min:{moto:null,p:120,m:150,g:180,gg:240}},
];
const ICON={
 shower:'<path d="M5 21V8a4 4 0 0 1 8 0"/><path d="M9 8h8l1 3H8z"/><path d="M10 14v2M13 14v3M16 14v2M11 19v1M15 19v1"/>',
 vacuum:'<circle cx="7" cy="18" r="3"/><path d="M7 15V7a4 4 0 0 1 8 0v10h5"/><path d="M12 21h8"/>',
 star:'<path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.3L12 17l-5.6 3.2 1.2-6.3L3 9.6l6.3-.8z"/>',
 gem:'<path d="M7 4h10l4 6-9 11L3 10z"/><path d="M3 10h18M9 10l3 11 3-11-3-6z"/>',
 crown:'<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 10H5z"/><path d="M5 21h14"/>',
 spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
 home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5L5 20"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',car:'<path d="M5 12 7 6h10l2 6"/><path d="M3 18v-4l2-2h14l2 2v4z"/><path d="M6 18v2M18 18v2M7 15h1M16 15h1"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 tag:'<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="8" cy="8" r="1.5"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',wa:'<path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 19z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 1c-1 0-2-1-2-2l1-1-1-2z"/>',plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="m15 5-7 7 7 7"/>',check:'<path d="m5 12 5 5 9-10"/>'
};
const ic=(n,s=22)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||''}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pdate=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addD=(s,n)=>{const d=pdate(s);d.setDate(d.getDate()+n);return iso(d)};
const today=()=>iso(new Date());
const fT=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
const pT=s=>{const[a,b]=String(s).split(':').map(Number);return a*60+(b||0)};
const fD=m=>{if(m==null)return'—';const h=Math.floor(m/60),r=m%60;return h?(h+'h'+(r?pad(r):'')):r+'min'};
const WD=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const WDL=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MO=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const fDate=s=>{const d=pdate(s);return `${s===today()?'Hoje':s===addD(today(),1)?'Amanhã':WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]}`};
const money=v=>v==null?'A definir':'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:v%1?2:0,maximumFractionDigits:2});
const uid=()=>Math.random().toString(36).slice(2,9);
const vKey=v=>`${v.type}|${v.brand}|${v.model}`;

function defaults(){return {biz:{name:"Sant's Lava Car",whatsapp:'5511953594193',instagram:'sants_lava_car',pix:''},
 hours:[0,1,2,3,4,5,6].map(i=>({on:i!==0,open:480,close:i===6?840:1080})),boxes:1,blocks:[],
 services:SVC0.map(s=>({...JSON.parse(JSON.stringify(s)),active:true,price:{moto:null,p:null,m:null,g:null,gg:null}})),vehAdd:[],sizeOv:{},timeOv:{}}}
let D={...defaults(),bookings:[],requests:[],busy:[]};
const cfgOf=()=>{const{biz,hours,boxes,blocks,services,vehAdd,sizeOv,timeOv}=D;return JSON.parse(JSON.stringify({biz,hours,boxes,blocks,services,vehAdd,sizeOv,timeOv}))};
const fail=e=>{console.error(e);toast(e?.code==='permission-denied'?'Sem permissão para essa ação. Entre novamente.':'Não consegui salvar. Confira a internet e tente de novo.')};
function save(){return setDoc(doc(db,'config','app'),cfgOf()).catch(fail)}

const allVeh=()=>[...VEH,...D.vehAdd,...(S.role==='master'?D.requests:[])];
const sizeOf=v=>D.sizeOv[vKey(v)]||v.size;
const svc=id=>D.services.find(s=>s.id===id);
function svcMin(v,id){const o=D.timeOv[vKey(v)];if(o&&o[id]!=null)return o[id];const s=svc(id);return s?s.min[sizeOf(v)]??null:null}
function dur(v,items){let t=0;for(const id of items){const m=svcMin(v,id);if(m==null)return null;t+=m}return t}
function totalPrice(v,items){let t=0;for(const id of items){const p=svc(id)?.price?.[sizeOf(v)];if(p==null)return null;t+=Number(p)}return t}
const live=b=>b.status==='pendente'||b.status==='confirmado';
function fits(date,start,m,exId){
 const h=D.hours[pdate(date).getDay()];if(!h.on||start<h.open||start+m>h.close)return false;
 const bs=D.busy.filter(b=>b.date===date&&b.id!==exId).map(b=>[b.start,b.start+b.minutes]);
 const blk=D.blocks.filter(b=>b.date===date);
 for(let t=start;t<start+m;t+=15){
  if(blk.some(b=>b.from<t+15&&b.to>t))return false;
  if(bs.filter(([s,e])=>s<t+15&&e>t).length>=D.boxes)return false;
 }
 return true;
}
function slots(date,m,exId){
 const h=D.hours[pdate(date).getDay()];const out=[];if(!h.on||!m)return out;
 const n=new Date();const now=date===today()?n.getHours()*60+n.getMinutes():-1;
 for(let t=h.open;t+m<=h.close;t+=30)if(t>now&&fits(date,t,m,exId))out.push(t);
 return out;
}
const bPrice=b=>b.price!==undefined?b.price:totalPrice(b.vehicle,b.items);
const svcNames=b=>b.items.map(id=>{const s=svc(id);return s?(s.group==='pacote'?'Lavagem '+s.name:s.name):id}).join(' + ');
const vehName=v=>`${v.brand} ${v.model}`;
const STATUS={pendente:'Aguardando aprovação',confirmado:'Confirmado',concluido:'Concluído',recusado:'Recusado',cancelado:'Cancelado'};
const pill=s=>`<span class="pill st-${s}">${STATUS[s]}</span>`;
const tierOf=b=>svc(b.items[0])?.tier||'blue';
const waLink=(ph,t)=>{const n=String(ph||'').replace(/\D/g,'');return n?`https://wa.me/${n.length<=11?'55'+n:n}?text=${encodeURIComponent(t)}`:''};

/* ===== Estado de tela ===== */
const S={role:'cliente',tab:'home',user:null,loginAs:'cliente',authErr:'',ready:false,sheet:null,w:null,agenda:null,gf:'todos',vq:'',vs:'',auth:null,login:false};
const app=document.getElementById('app'),sheetEl=document.getElementById('sheet'),toastEl=document.getElementById('toast');
let tt;function toast(m){toastEl.textContent=m;toastEl.hidden=false;clearTimeout(tt);tt=setTimeout(()=>toastEl.hidden=true,3400)}
const NAV={guest:[['home','home','Início'],['agendar','cal','Agendar'],['galeria','img','Resultados'],['entrar','user','Entrar']],cliente:[['home','home','Início'],['agendar','cal','Agendar'],['meus','list','Meus'],['galeria','img','Resultados'],['perfil','user','Perfil']],
 master:[['painel','chart','Painel'],['agenda','cal','Agenda'],['servicos','tag','Serviços'],['veiculos','car','Veículos'],['galeria','img','Resultados']]};

function render(){
 if(S.login){app.innerHTML=vLogin();sheetEl.hidden=true;return}
 const view={home:vHome,agendar:vWizard,meus:vMeus,galeria:vGaleria,perfil:vPerfil,painel:vPainel,agenda:vAgenda,servicos:vServicos,veiculos:vVeiculos}[S.tab]||vHome;
 const navs=S.user?NAV[S.role]:NAV.guest;
 app.innerHTML=`<main class="page">${view()}</main><nav class="nav">${navs.map(([k,i,l])=>`<button id="nav-${k}" data-a="tab" data-v="${k}" class="${S.tab===k?'on':''}" ${S.tab===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span>${S.role==='master'&&(k==='painel'||k==='agenda')?badge():''}</button>`).join('')}</nav>`;
 renderSheet();
}
let pend=false;
function refresh(){const x=document.activeElement;if(x&&/INPUT|TEXTAREA|SELECT/.test(x.tagName)){pend=true;return}pend=false;render()}
document.addEventListener('focusout',()=>{if(pend)setTimeout(refresh,50)});
function badge(){const n=D.bookings.filter(b=>b.status==='pendente').length;return n?`<i class="dot">${n}</i>`:''}
function head(t,sub,right=''){return `<header class="head"><div><h1>${t}</h1>${sub?`<p>${sub}</p>`:''}</div>${right}</header>`}
function tierTitle(s){return s.group==='pacote'?`<span class="eyebrow">Lavagem</span><strong class="tname">${esc(s.name)}</strong>`:`<strong class="xname">${esc(s.name)}</strong>`}

/* ===== Login ===== */
function vLogin(){const c=S.auth==='cad',r=S.auth==='rec';const hero=`<img class="hero" src="img/hero.jpg" alt="Sant's Lava Car: cuidado que seu carro merece, resultado que você vê">`;
 if(r)return `<main class="page login">${hero}<form id="rec-form" class="stack"><h1>Recuperar senha</h1><p class="muted">Informe o e-mail do cadastro. Enviamos um link para criar uma senha nova.</p>
 <label class="f">E-mail<input id="re-e" type="email" required autocomplete="email" placeholder="voce@email.com"></label><button class="btn pri" id="re-go">Enviar link</button></form><button class="btn ghost" data-a="authTo" data-v="" id="re-b">Voltar para entrar</button></main>`;
 const emp=S.loginAs==='empresa';
 return `<main class="page login">${hero}<div class="seg wide"><button id="as-cli" data-a="loginAs" data-v="cliente" class="${emp?'':'on'}">Cliente</button><button id="as-emp" data-a="loginAs" data-v="empresa" class="${emp?'on':''}">Empresa</button></div><form id="auth-form" class="stack"><h1>${c?'Criar cadastro':emp?'Acesso da empresa':'Entrar'}</h1>${S.authErr?`<p class="err" role="alert">${esc(S.authErr)}</p>`:''}
 ${c?`<label class="f">Nome<input id="au-n" required autocomplete="name" placeholder="Como devemos te chamar"></label><label class="f">WhatsApp<input id="au-p" required inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000"></label>`:''}
 <label class="f">E-mail<input id="au-e" type="email" required autocomplete="email" placeholder="voce@email.com"></label>
 <label class="f">Senha<input id="au-s" required type="password" minlength="6" autocomplete="${c?'new-password':'current-password'}" placeholder="Mínimo de 6 caracteres"></label>
 ${c?'':`<button type="button" class="link" id="au-f" data-a="authTo" data-v="rec">Esqueci minha senha</button>`}
 <button class="btn pri" id="au-go">${c?'Criar cadastro':'Entrar'}</button></form>
 ${emp?'':`<button class="btn ghost" data-a="authTo" data-v="${c?'':'cad'}" id="au-sw">${c?'Já tenho cadastro':'Primeira vez? Criar cadastro'}</button>`}<button class="btn ghost" data-a="closeLogin" id="au-x">Voltar para o início</button></main>`}

/* ===== Cliente ===== */
const fromP=s=>{const l=['p','m','g','gg'].map(k=>s.price[k]).filter(x=>x!=null);return l.length?Math.min(...l):null};
function pkgCard(s,v,sel){
 const m=v?svcMin(v,s.id):null,p=v?s.price?.[sizeOf(v)]:null;
 return `<article class="pkg t-${s.tier}"><div class="pkg-i">${ic(s.icon,34)}</div><div class="pkg-b">${tierTitle(s)}
  ${s.items.length?`<ul>${s.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}${!v&&fromP(s)!=null?`<div class="pkg-m"><span>A partir de</span><b>${money(fromP(s))}</b></div>`:''}
  ${v?`<div class="pkg-m"><span>${ic('cal',15)} ${fD(m)}</span><b>${money(p)}</b></div>`:''}${sel||''}</div></article>`}
function vHome(){
 const vb=S.needVerify?`<section class="esp"><b>Confirme seu e-mail</b><p>Este e-mail tem acesso de empresa. Abra o link que enviamos e toque em Já confirmei.</p><button class="btn pri" id="v-now" data-a="verifyNow">Já confirmei</button><button class="link" id="v-res" data-a="resendVerify">Enviar o link de novo</button></section>`:'';
 const pk=D.services.filter(s=>s.active&&s.group==='pacote'),ex=D.services.filter(s=>s.active&&s.group==='extra');
 const nx=D.bookings.filter(b=>b.clientId===S.user?.id&&live(b)).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))[0];
 const wa=waLink(D.biz.whatsapp,'Olá! Quero saber dos pacotes especiais.');
 const pics=[GALLERY[4]];
 return `<img class="hero" src="img/hero.jpg" alt="Sant's Lava Car: cuidado que seu carro merece, resultado que você vê">${vb}
 <button class="btn pri big" id="cta" data-a="tab" data-v="agendar">${ic('cal')} Agendar lavagem</button>
 ${nx?`<section><h2>Seu próximo horário</h2><button class="row card t-${tierOf(nx)}" data-a="tab" data-v="meus"><div class="grow"><b>${fDate(nx.date)} às ${fT(nx.start)}</b><small>${esc(vehName(nx.vehicle))} · ${esc(svcNames(nx))}</small></div>${pill(nx.status)}</button></section>`:''}
 <section><h2>Pacotes</h2><div class="stack">${pk.map(s=>pkgCard(s)).join('')}</div></section>
 <section><h2>Também oferecemos</h2><div class="ext">${ex.map(s=>`<div>${ic(s.icon)}<span>${esc(s.name)}</span></div>`).join('')}</div></section>
 <section class="esp"><b>Pacotes especiais</b><p>Fazemos avaliação do seu veículo e montamos o melhor pacote para você.</p>${wa?`<a class="btn wa" target="_blank" rel="noopener" href="${wa}">${ic('wa')} Falar no WhatsApp</a>`:`<small>O botão do WhatsApp aparece quando o número é cadastrado.</small>`}</section>
 <section><h2>Antes e depois</h2><button class="peek" data-a="tab" data-v="galeria" id="peek">${pics.map(g=>`<span style="background-image:url('img/${g.img}.jpg')"></span>`).join('')}<em>Ver resultados</em></button></section>`;
}
function newW(){return {step:1,vid:S.user?.vehicles?.[0]?.id||'novo',nv:{type:'carro',brand:'',model:'',year:'',color:'',plate:'',size:'',other:false,otherModel:''},items:[],date:null,start:null,err:''}}
function wVeh(){const w=S.w;if(w.vid!=='novo')return S.user.vehicles.find(v=>v.id===w.vid);const n=w.nv;if(n.other)return n.brand&&n.otherModel&&n.size?{type:n.type,brand:n.brand,model:n.otherModel,size:n.size,year:n.year,color:n.color,plate:n.plate}:null;
 const f=allVeh().find(x=>x.type===n.type&&x.brand===n.brand&&x.model===n.model);return f?{...f,year:n.year,color:n.color,plate:n.plate}:null}
function vWizard(){
 if(!S.w)S.w=newW();const w=S.w;
 if(w.done)return vDone();
 const steps=['Veículo','Serviço','Horário','Confirmar'];
 const bar=`<ol class="steps">${steps.map((s,i)=>`<li class="${i+1===w.step?'on':i+1<w.step?'ok':''}">${s}</li>`).join('')}</ol>`;
 const back=w.step>1?`<button class="btn ghost" id="w-back" data-a="wBack">${ic('back',18)} Voltar</button>`:'';
 const err=w.err?`<p class="err" role="alert">${esc(w.err)}</p>`:'';
 if(w.step===1)return head('Qual é o veículo?','O tempo da lavagem depende do porte.')+bar+wStep1()+err+`<div class="foot"><button class="btn pri" id="w-next" data-a="wNext1">Ver serviços</button></div>`;
 const v=wVeh();
 if(w.step===2){
  const offered=D.services.filter(s=>s.active&&s.min[sizeOf(v)]!=null);
  const pk=offered.filter(s=>s.group==='pacote'),ex=offered.filter(s=>s.group==='extra');
  const m=dur(v,w.items);
  return head('Escolha o serviço',`${esc(vehName(v))} · porte ${SIZES[sizeOf(v)].toLowerCase()}`)+bar+
  `<div class="stack">${pk.map(s=>`<button class="pick ${w.items.includes(s.id)?'on':''}" id="pk-${s.id}" data-a="wPack" data-v="${s.id}" aria-pressed="${w.items.includes(s.id)}">${pkgCard(s,v)}</button>`).join('')}</div>
  ${ex.length?`<h2 class="mt">Adicionar à lavagem</h2><div class="stack tight">${ex.map(s=>`<label class="chk"><input type="checkbox" id="ex-${s.id}" data-c="wExtra" value="${s.id}" ${w.items.includes(s.id)?'checked':''}><span class="grow">${esc(s.name)}</span><small>+ ${fD(svcMin(v,s.id))} · ${money(s.price[sizeOf(v)])}</small></label>`).join('')}</div>`:''}
  ${err}<div class="foot sum"><div><small>Tempo</small><b>${w.items.length?fD(m):'—'}</b></div><div><small>Total</small><b id="w-total">${w.items.length?money(totalPrice(v,w.items)):'—'}</b></div><button class="btn pri" id="w-next" data-a="wNext2">Ver horários</button></div>${back}`;
 }
 const m=dur(v,w.items);
 if(w.step===3){
  const days=[];for(let i=0;i<21;i++){const d=addD(today(),i);if(D.hours[pdate(d).getDay()].on)days.push(d)}
  const av=days.map(d=>[d,slots(d,m)]);
  if(!w.date||!av.find(([d])=>d===w.date))w.date=(av.find(([,s])=>s.length)||av[0]||[null])[0];
  const sl=w.date?slots(w.date,m):[];const none=av.every(([,s])=>!s.length);
  return head('Quando?',`Só aparecem horários em que cabem ${fD(m)} de serviço.`)+bar+
  `<div class="days" role="group" aria-label="Dias">${av.map(([d,s])=>{const dd=pdate(d);return `<button id="d-${d}" data-a="wDay" data-v="${d}" class="${d===w.date?'on':''}" ${s.length?'':'disabled'}><small>${WD[dd.getDay()]}</small><b>${dd.getDate()}</b><small>${s.length?s.length+' hor.':'cheio'}</small></button>`}).join('')}</div>
  ${none?`<div class="empty"><b>Esse serviço não cabe em um único dia aberto.</b><p>Reduza os adicionais ou combine direto com o Giovanni.</p></div>`:`<div class="slots">${sl.map(t=>`<button id="s-${t}" data-a="wSlot" data-v="${t}" class="${w.start===t?'on':''}">${fT(t)}<small>até ${fT(t+m)}</small></button>`).join('')}</div>`}
  ${err}<div class="foot"><button class="btn pri" id="w-next" data-a="wNext3">Revisar pedido</button></div>${back}`;
 }
 return head('Confira o pedido','O horário fica reservado até o Giovanni responder.')+bar+
 `<dl class="dl card"><div><dt>Veículo</dt><dd>${esc(vehName(v))}${v.year?' '+esc(v.year):''}${v.color?' · '+esc(v.color):''}</dd></div>
 <div><dt>Porte</dt><dd>${SIZES[sizeOf(v)]}</dd></div><div><dt>Data</dt><dd>${fDate(w.date)}, ${fT(w.start)} às ${fT(w.start+m)}</dd></div><div><dt>Tempo estimado</dt><dd>${fD(m)}</dd></div></dl>
 <dl class="dl card">${w.items.map(id=>`<div><dt>${esc(svcNames({items:[id]}))}</dt><dd>${money(svc(id).price[sizeOf(v)])}</dd></div>`).join('')}<div class="tot"><dt>Total</dt><dd id="r-total">${money(totalPrice(v,w.items))}</dd></div></dl>${pixBox()}
 <p class="note">Depois de avaliar o veículo, o Giovanni pode ajustar o tempo. Você vê a mudança em Meus agendamentos.</p>
 ${err}<div class="foot"><button class="btn pri" id="w-send" data-a="wSend">Pedir agendamento</button></div>${back}`;
}
function wStep1(){
 const w=S.w,n=w.nv;
 const saved=S.user.vehicles.map(v=>`<label class="chk"><input type="radio" name="vs" id="vs-${v.id}" data-c="wVid" value="${v.id}" ${w.vid===v.id?'checked':''}><span class="grow"><b>${esc(vehName(v))}</b> ${esc(v.year||'')}<small>${esc(v.color||'')} · ${SIZES[sizeOf(v)]}</small></span></label>`).join('');
 let form='';
 if(w.vid==='novo'){
  const brands=[...new Set(allVeh().filter(x=>x.type===n.type).map(x=>x.brand))].sort((a,b)=>a.localeCompare(b));
  const models=allVeh().filter(x=>x.type===n.type&&x.brand===n.brand).map(x=>x.model).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true}));
  const f=wVeh();
  form=`<div class="stack card"><div class="seg wide"><button id="ty-c" data-a="wType" data-v="carro" class="${n.type==='carro'?'on':''}">Carro</button><button id="ty-m" data-a="wType" data-v="moto" class="${n.type==='moto'?'on':''}">Moto</button></div>
  <label class="f">Marca<select id="nv-brand" data-c="nvBrand"><option value="">Selecione</option>${brands.map(b=>`<option ${b===n.brand?'selected':''}>${esc(b)}</option>`).join('')}<option value="__o" ${n.brandOther?'selected':''}>Outra marca</option></select></label>
  ${n.brandOther?`<label class="f">Qual marca?<input id="nv-bo" data-i="brand" value="${esc(n.brand)}"></label>`:''}
  ${n.brand||n.brandOther?(n.brandOther?'':`<label class="f">Modelo<select id="nv-model" data-c="nvModel"><option value="">Selecione</option>${models.map(m=>`<option ${m===n.model?'selected':''}>${esc(m)}</option>`).join('')}<option value="__o" ${n.other?'selected':''}>Não achei meu modelo</option></select></label>`):''}
  ${n.other?`<label class="f">Modelo<input id="nv-om" data-i="otherModel" value="${esc(n.otherModel)}"></label>
   ${n.type==='moto'?'':`<fieldset class="f"><legend>Tamanho parecido com</legend><div class="sizes">${['p','m','g','gg'].map(s=>`<button type="button" id="sz-${s}" data-a="nvSize" data-v="${s}" class="${n.size===s?'on':''}"><b>${SIZES[s]}</b><small>${SIZE_HINT[s]}</small></button>`).join('')}</div></fieldset>`}`:''}
  ${f&&!n.other?`<p class="porte">${ic('car',18)} Porte <b>${SIZES[sizeOf(f)]}</b></p>`:''}
  <div class="two"><label class="f">Ano<input id="nv-year" data-i="year" inputmode="numeric" maxlength="4" value="${esc(n.year)}" placeholder="2008"></label><label class="f">Cor<input id="nv-color" data-i="color" value="${esc(n.color)}" placeholder="Prata"></label></div>
  <label class="f">Placa (opcional)<input id="nv-plate" data-i="plate" value="${esc(n.plate)}" maxlength="8" style="text-transform:uppercase"></label></div>`;
 }
 return `<div class="stack tight">${saved}<label class="chk"><input type="radio" name="vs" id="vs-novo" data-c="wVid" value="novo" ${w.vid==='novo'?'checked':''}><span class="grow"><b>Outro veículo</b></span></label></div>${form}`;
}
function pixBox(){const k=D.biz.pix;if(!k)return '';return `<div class="pix card"><b>Pagamento por Pix</b><small>Se preferir, pague pelo Pix. Também dá para pagar no Lava Car.</small>${k?`<div class="pix-k"><code>${esc(k)}</code><button class="btn ghost sm" id="pix-cp" data-a="copyPix">Copiar</button></div>`:`<p class="muted">A chave Pix do Lava Car vai aparecer aqui.</p>`}</div>`}
function vDone(){const b=S.w.doneB;return `<div class="done"><span class="ok-ic">${ic('check',34)}</span><h1>Pedido enviado</h1><p>Seu horário está reservado para ${fDate(b.date).toLowerCase()} às ${fT(b.start)}. Agora é só aguardar a aprovação do Giovanni.</p>
 ${pixBox()}<button class="btn pri" id="d-see" data-a="tab" data-v="meus">Ver meus agendamentos</button></div>`}
function vMeus(){
 const mine=D.bookings.filter(b=>b.clientId===S.user.id).sort((a,b)=>(b.date+pad(b.start)).localeCompare(a.date+pad(a.start)));
 return head('Meus agendamentos')+(mine.length?`<div class="stack">${mine.map(b=>`<article class="card bk t-${tierOf(b)}"><div class="bk-h"><b>${fDate(b.date)}, ${fT(b.start)}</b>${pill(b.status)}</div><p>${esc(vehName(b.vehicle))}${b.vehicle.color?' '+esc(b.vehicle.color.toLowerCase()):''}</p><p class="muted">${esc(svcNames(b))} · ${fD(b.minutes)} · ${money(bPrice(b))}</p>
  ${b.minutes!==b.estMinutes?`<p class="note">O Giovanni ajustou o tempo de ${fD(b.estMinutes)} para ${fD(b.minutes)}.</p>`:''}${b.note?`<p class="note">Giovanni: ${esc(b.note)}</p>`:''}
  ${live(b)?(S.armCancel===b.id?`<div class="two"><button class="btn ghost" data-a="noCancel">Manter</button><button class="btn dng" id="c-yes-${b.id}" data-a="doCancel" data-v="${b.id}">Cancelar pedido</button></div>`:`<button class="link" data-a="armCancel" data-v="${b.id}">Cancelar agendamento</button>`):''}</article>`).join('')}</div>`:`<div class="empty"><b>Nenhum agendamento ainda.</b><p>Escolha um serviço e veja os horários livres.</p><button class="btn pri" data-a="tab" data-v="agendar">Agendar lavagem</button></div>`);
}
function vPerfil(){return head(esc(S.user.name),esc(S.user.email||'')+(S.user.phone?' · '+esc(S.user.phone):''))+`<section><h2>Meus veículos</h2><div class="stack tight">${S.user.vehicles.length?S.user.vehicles.map(v=>`<div class="chk"><span class="grow"><b>${esc(vehName(v))}</b> ${esc(v.year||'')}<small>${esc(v.color||'')} · ${SIZES[sizeOf(v)]}</small></span></div>`).join(''):'<p class="muted">Seu veículo fica salvo no primeiro agendamento.</p>'}</div></section>
 <section><h2>Colocar na tela do celular</h2><div class="card stack tight"><p><b>Android (Chrome):</b> toque nos três pontinhos e em Adicionar à tela inicial.</p><p><b>iPhone (Safari):</b> toque em Compartilhar e em Adicionar à Tela de Início.</p></div></section>
 <button class="btn ghost" id="sair" data-a="logout">Sair</button>`}

/* ===== Galeria ===== */
function vGaleria(){
 const ig=D.biz.instagram?`<a class="btn ghost" target="_blank" rel="noopener" href="https://www.instagram.com/${esc(D.biz.instagram.replace('@',''))}/">Ver mais no Instagram</a>`:'';
 return head('Antes e depois','Alguns resultados. As novidades ficam no Instagram.')+ig+`<div class="gal">${GALLERY.map(g=>`<figure class="gi"><figcaption><b>${esc(g.service)}</b></figcaption><img class="ph" loading="lazy" src="img/${g.img}.jpg" alt="${esc(g.alt)}"></figure>`).join('')}</div>`;
}

/* ===== Master ===== */
function vPainel(){
 const t=today(),td=D.bookings.filter(b=>b.date===t&&live(b)).sort((a,b)=>a.start-b.start),pend=D.bookings.filter(b=>b.status==='pendente').sort((a,b)=>(a.date+pad(a.start)).localeCompare(b.date+pad(b.start)));
 let cap=0,used=0,rev=0,miss=0;for(let i=0;i<7;i++){const d=addD(t,i),h=D.hours[pdate(d).getDay()];if(h.on)cap+=(h.close-h.open)*D.boxes;D.bookings.filter(b=>b.date===d&&live(b)).forEach(b=>{used+=b.minutes;if(b.status==='confirmado'){const p=bPrice(b);p==null?miss++:rev+=p}})}
 const occ=cap?Math.round(used/cap*100):0;
 return head(`Olá, ${esc((S.user?.name||'').split(' ')[0]||'empresa')}`,fDate(t),`<button class="iconb" id="cfg" data-a="cfgOpen" aria-label="Ajustes">${ic('gear')}</button>`)+
 `<div class="kpis"><div><small>Hoje</small><b>${td.length}</b><span>${td.length===1?'serviço':'serviços'}</span></div><div class="${pend.length?'warn':''}"><small>Para aprovar</small><b>${pend.length}</b><span>pedidos</span></div><div><small>7 dias</small><b>${occ}%</b><span>ocupado</span></div></div>
 <div class="rev"><small>A receber nos próximos 7 dias</small><b>${miss&&!rev?'Defina os preços':money(rev)}</b>${miss?`<button class="link" id="to-prices" data-a="tab" data-v="servicos">${miss} ${miss===1?'serviço':'serviços'} sem preço</button>`:''}</div>
 <section><h2>Para aprovar</h2>${pend.length?`<div class="stack tight">${pend.map(bRow).join('')}</div>`:'<p class="muted">Nenhum pedido aguardando.</p>'}</section>
 <section><h2>Hoje</h2>${td.length?`<div class="stack tight">${td.map(bRow).join('')}</div>`:'<p class="muted">Nenhum serviço para hoje.</p>'}</section>
 <button class="btn ghost" id="to-hours" data-a="hoursOpen">${ic('cal',18)} Liberar horários</button>`;
}
function bRow(b){return `<button class="row card t-${tierOf(b)}" id="b-${b.id}" data-a="bOpen" data-v="${b.id}"><time>${b.date===today()?'':`<small>${pdate(b.date).getDate()}/${pad(pdate(b.date).getMonth()+1)}</small>`}${fT(b.start)}</time><div class="grow"><b>${esc(b.clientName)} · ${esc(vehName(b.vehicle))}</b><small>${esc(svcNames(b))} · ${fD(b.minutes)}</small></div>${b.status==='pendente'?'<span class="pill st-pendente">Aprovar</span>':''}</button>`}
function vAgenda(){
 if(!S.agenda)S.agenda=today();const a=S.agenda,days=[];for(let i=-1;i<20;i++)days.push(addD(today(),i));
 const h=D.hours[pdate(a).getDay()],bs=D.bookings.filter(b=>b.date===a&&live(b)||b.date===a&&b.status==='concluido').sort((x,y)=>x.start-y.start),bl=D.blocks.filter(b=>b.date===a);
 let line='<div class="empty"><b>Fechado neste dia.</b><p>Abra em Liberar horários.</p></div>';
 if(h.on){const px=1.25,hrs=[];for(let t=Math.ceil(h.open/60)*60;t<=h.close;t+=60)hrs.push(t);
  line=`<div class="tl" style="height:${(h.close-h.open)*px}px">${hrs.map(t=>`<div class="tl-h" style="top:${(t-h.open)*px}px"><span>${fT(t)}</span></div>`).join('')}
  ${bl.map(b=>`<div class="tl-b blk" style="top:${(b.from-h.open)*px}px;height:${(b.to-b.from)*px}px"><b>Bloqueado</b><small>${esc(b.why||'')}</small></div>`).join('')}
  ${bs.map(b=>`<button class="tl-b t-${tierOf(b)} ${b.status}" id="tl-${b.id}" data-a="bOpen" data-v="${b.id}" style="top:${(b.start-h.open)*px}px;height:${Math.max(b.minutes*px,44)}px"><b>${fT(b.start)} ${esc(vehName(b.vehicle))}</b><small>${esc(b.clientName)} · ${esc(svcNames(b))} · ${fD(b.minutes)}${b.status==='pendente'?' · aguardando':''}</small></button>`).join('')}</div>`}
 return head('Agenda',fDate(a),`<button class="btn ghost sm" id="hours" data-a="hoursOpen">Liberar horários</button>`)+
 `<div class="days">${days.map(d=>{const dd=pdate(d),n=D.bookings.filter(b=>b.date===d&&live(b)).length;return `<button id="ad-${d}" data-a="aDay" data-v="${d}" class="${d===a?'on':''}"><small>${WD[dd.getDay()]}</small><b>${dd.getDate()}</b><small>${n?n+' serv.':'—'}</small></button>`}).join('')}</div>${line}`;
}
function vServicos(){const g=(t,k)=>`<section><h2>${t}</h2><div class="stack tight">${D.services.filter(s=>s.group===k).map(s=>{const pr=Object.values(s.price).some(p=>p!=null);return `<button class="row card t-${s.tier} ${s.active?'':'off'}" id="sv-${s.id}" data-a="svOpen" data-v="${s.id}"><span class="sv-i">${ic(s.icon)}</span><div class="grow"><b>${esc(s.name)}</b><small>${s.active?'':'Oculto · '}${s.min.g!=null?fD(s.min.g)+' no carro grande':'Sob consulta'} · ${pr?'com preço':'preço a definir'}</small></div></button>`}).join('')}</div></section>`;
 return head('Serviços','Tempo e preço variam por porte. Os valores atuais são exemplos.',`<button class="btn pri sm" id="sv-new" data-a="svNew">${ic('plus',18)} Novo</button>`)+g('Pacotes','pacote')+g('Outros serviços','extra')}
function vVeiculos(){
 const q=S.vq.toLowerCase(),rev=D.requests,l=allVeh().filter(v=>(!S.vs||sizeOf(v)===S.vs)&&(!q||`${v.brand} ${v.model}`.toLowerCase().includes(q)));
 const lrn=Object.entries(D.timeOv).flatMap(([k,o])=>Object.entries(o).map(([id,m])=>({k,id,m})));
 return head('Veículos',`${allVeh().length} modelos na base. Quanto mais você ajusta, melhor fica.`,`<button class="btn pri sm" id="vh-new" data-a="vhNew">${ic('plus',18)} Novo</button>`)+
 (rev.length?`<section><h2>Modelos novos para revisar</h2><div class="stack tight">${rev.map(vRow).join('')}</div></section>`:'')+
 (lrn.length?`<section><h2>Tempos aprendidos</h2><div class="stack tight">${lrn.map(x=>{const[,b,mo]=x.k.split('|');return `<div class="row card"><div class="grow"><b>${esc(b)} ${esc(mo)}</b><small>${esc(svc(x.id)?.name||x.id)}: ${fD(x.m)}</small></div><button class="link" id="lr-${esc(mo)}-${x.id}" data-a="lrnDel" data-v="${esc(x.k)}::${x.id}">Remover</button></div>`}).join('')}</div></section>`:'')+
 `<section><label class="f">Buscar<input id="v-q" data-q value="${esc(S.vq)}" placeholder="Marca ou modelo"></label>
 <div class="chips">${[['','Todos'],...SIZE_KEYS.map(k=>[k,SIZES[k]])].map(([k,t])=>`<button id="vs-f-${k||'all'}" data-a="vsF" data-v="${k}" class="${S.vs===k?'on':''}">${t}</button>`).join('')}</div>
 <div class="stack tight" id="v-list">${vList(l)}</div></section>`;
}
function vList(l){return l.slice(0,50).map(vRow).join('')+(l.length>50?`<p class="muted">Mostrando 50 de ${l.length}. Busque para achar o modelo.</p>`:'')+(l.length?'':'<p class="muted">Nenhum modelo encontrado.</p>')}
function vRow(v){const k=vKey(v);return `<div class="row card vr"><div class="grow"><b>${esc(v.brand)} ${esc(v.model)}</b>${D.timeOv[k]?'<small>Tempo ajustado</small>':''}</div>${v.type==='moto'?'<span class="muted">Moto</span>':`<select aria-label="Porte de ${esc(v.model)}" data-c="vSize" data-k="${esc(k)}">${['p','m','g','gg'].map(s=>`<option value="${s}" ${sizeOf(v)===s?'selected':''}>${SIZES[s]}</option>`).join('')}</select>`}</div>`}

/* ===== Bottom sheets ===== */
function renderSheet(){
 const s=S.sheet;if(!s){sheetEl.hidden=true;sheetEl.innerHTML='';return}
 const old=sheetEl.querySelector('.sh');const top=old?old.scrollTop:0;
 const body={booking:shBooking,service:shService,hours:shHours,cfg:shCfg,veh:shVeh}[s.type]();
 sheetEl.hidden=false;sheetEl.innerHTML=`<div class="sh-bg" data-a="shClose"></div><div class="sh" role="dialog" aria-modal="true"><button class="iconb close" id="sh-x" data-a="shClose" aria-label="Fechar">${ic('x')}</button>${body}</div>`;
 sheetEl.querySelector('.sh').scrollTop=top;
}
function shBooking(){
 const s=S.sheet,b=D.bookings.find(x=>x.id===s.id),v=b.vehicle;
 const can=live(b),ok=fits(s.date,s.start,s.min,b.id);
 const opts=[...new Set([...slots(s.date,s.min,b.id),...(ok?[s.start]:[])])].sort((a,c)=>a-c);
 const wa=waLink(b.phone,`Olá ${b.clientName}! Aqui é o Giovanni, do Sant's Lava Car. Sobre sua lavagem de ${fDate(b.date).toLowerCase()} às ${fT(b.start)}: `);
 const ch=s.min!==b.minutes||s.start!==b.start||s.date!==b.date;
 return `<div class="bk-h"><h2>${esc(b.clientName)}</h2>${pill(b.status)}</div>
 <dl class="dl"><div><dt>Veículo</dt><dd>${esc(vehName(v))}${v.year?' '+esc(v.year):''}${v.color?' · '+esc(v.color):''}${v.plate?' · '+esc(v.plate.toUpperCase()):''}</dd></div><div><dt>Porte</dt><dd>${SIZES[sizeOf(v)]}</dd></div><div><dt>Serviço</dt><dd>${esc(svcNames(b))}</dd></div><div><dt>Quando</dt><dd>${fDate(b.date)}, ${fT(b.start)} às ${fT(b.start+b.minutes)}</dd></div><div><dt>Valor</dt><dd>${money(bPrice(b))}</dd></div><div><dt>WhatsApp</dt><dd>${esc(b.phone)}</dd></div></dl>
 ${wa?`<a class="btn wa" target="_blank" rel="noopener" href="${wa}">${ic('wa')} Avisar no WhatsApp</a>`:''}
 ${can?`<div class="adj card"><div class="adj-h"><div><small>Tempo do serviço</small><b id="adj-t">${fD(s.min)}</b>${s.min!==b.estMinutes?`<small>Estimado: ${fD(b.estMinutes)}</small>`:''}</div>
  <div class="step"><button id="m30" data-a="adj" data-v="-30" aria-label="Menos 30 minutos">−30</button><button id="m15" data-a="adj" data-v="-15" aria-label="Menos 15 minutos">−15</button><button id="p15" data-a="adj" data-v="15" aria-label="Mais 15 minutos">+15</button><button id="p30" data-a="adj" data-v="30" aria-label="Mais 30 minutos">+30</button></div></div>
  <label class="f">Dia<input type="date" id="adj-d" data-c="adjDate" min="${today()}" value="${s.date}"></label><label class="f">Início<select id="adj-s" data-c="adjStart">${opts.map(t=>`<option value="${t}" ${t===s.start?'selected':''}>${fT(t)} às ${fT(t+s.min)}</option>`).join('')}${ok?'':`<option selected disabled>Não cabe às ${fT(s.start)}</option>`}</select></label>
  ${ok?'':`<p class="err" role="alert">${fD(s.min)} não cabe a partir de ${fT(s.start)}. ${opts.length?'Escolha outro início.':'Não há horário livre nesse dia para esse tempo. Troque o dia.'}</p>`}
  ${s.min!==b.estMinutes?`<label class="chk flat"><input type="checkbox" id="adj-l" data-c="adjLearn" ${s.learn?'checked':''}><span class="grow">Usar ${fD(s.min)} nos próximos ${esc(vehName(v))} com ${esc(svc(b.items[0])?.name||'')}${b.items.length>1?' (mesma diferença)':''}</span></label>`:''}</div>
  ${b.status==='pendente'?`<button class="btn pri" id="approve" data-a="bApprove" ${ok?'':'disabled'}>${ch?'Aprovar com ajuste':'Aprovar'}</button>`:`<button class="btn pri" id="b-save" data-a="bApprove" ${ok&&(ch||s.learn)?'':'disabled'}>Salvar alteração</button><button class="btn ghost" id="b-done" data-a="bDone">Marcar como concluído</button>`}
  ${s.refuse?`<label class="f">Motivo, o cliente vê<input id="r-why" data-sh="why" value="${esc(s.why||'')}" placeholder="Ex.: sem vaga nesse dia"></label><button class="btn dng" id="r-go" data-a="bRefuse">Confirmar recusa</button>`:`<button class="link center" id="r-open" data-a="bRefOpen">${b.status==='pendente'?'Recusar pedido':'Cancelar agendamento'}</button>`}`:''}`;
}
function shService(){const s=S.sheet,f=s.f;const sizes=SIZE_KEYS;
 return `<h2>${s.isNew?'Novo serviço':esc(f.name)}</h2><div class="stack">
 <label class="f">Nome<input id="sv-name" data-sv="name" value="${esc(f.name)}"></label>
 <div class="seg wide"><button id="sv-g-p" data-a="svGroup" data-v="pacote" class="${f.group==='pacote'?'on':''}">Pacote</button><button id="sv-g-e" data-a="svGroup" data-v="extra" class="${f.group==='extra'?'on':''}">Outro serviço</button></div>
 <label class="f">O que inclui (um item por linha)<textarea id="sv-items" data-sv="itemsT" rows="4">${esc(f.itemsT)}</textarea></label>
 <div class="ovx"><table class="mx"><thead><tr><th>Porte</th><th>Minutos</th><th>Preço R$</th></tr></thead><tbody>${sizes.map(k=>`<tr><th>${SIZES[k]}</th><td><input id="mn-${k}" data-mn="${k}" inputmode="numeric" value="${f.min[k]??''}" placeholder="Não faz"></td><td><input id="pr-${k}" data-pr="${k}" inputmode="decimal" value="${f.price[k]??''}" placeholder="A definir"></td></tr>`).join('')}</tbody></table></div>
 <p class="note">Sem minutos, o serviço não aparece para aquele porte.</p>
 <label class="chk flat"><input type="checkbox" id="sv-act" data-c="svAct" ${f.active?'checked':''}><span class="grow">Mostrar para os clientes</span></label>
 <p class="err" id="sv-err" hidden></p><button class="btn pri" id="sv-save" data-a="svSave">Salvar serviço</button>${s.isNew?'':`<button class="link center" id="sv-del" data-a="svDel">Remover serviço</button>`}</div>`}
function shHours(){return `<h2>Liberar horários</h2><p class="muted">Os clientes só veem horários dentro destes períodos.</p><div class="stack tight">
 ${D.hours.map((h,i)=>`<div class="hr"><label class="tog"><input type="checkbox" id="h-on-${i}" data-c="hOn" data-i2="${i}" ${h.on?'checked':''}><span>${WDL[i]}</span></label>${h.on?`<div class="hr-t"><input aria-label="Abre ${WDL[i]}" type="time" id="h-o-${i}" data-c="hOpen" data-i2="${i}" value="${fT(h.open)}"><span>às</span><input aria-label="Fecha ${WDL[i]}" type="time" id="h-c-${i}" data-c="hClose" data-i2="${i}" value="${fT(h.close)}"></div>`:'<span class="muted">Fechado</span>'}</div>`).join('')}</div>
 <label class="f mt">Carros ao mesmo tempo<select id="h-box" data-c="hBox">${[1,2,3,4].map(n=>`<option ${D.boxes===n?'selected':''}>${n}</option>`).join('')}</select></label>
 <h3 class="mt">Bloquear um período</h3><div class="stack tight"><label class="f">Dia<input type="date" id="bl-d" value="${S.agenda||today()}" min="${today()}"></label><div class="two"><label class="f">Das<input type="time" id="bl-f" value="12:00"></label><label class="f">Até<input type="time" id="bl-t" value="13:00"></label></div><label class="f">Motivo (opcional)<input id="bl-w" placeholder="Almoço, compromisso"></label><button class="btn ghost" id="bl-add" data-a="blAdd">Bloquear período</button>
 ${D.blocks.filter(b=>b.date>=today()).map(b=>`<div class="row card"><div class="grow"><b>${fDate(b.date)}, ${fT(b.from)} às ${fT(b.to)}</b><small>${esc(b.why||'Sem motivo')}</small></div><button class="link" data-a="blDel" data-v="${b.id}">Liberar</button></div>`).join('')}</div>`}
function shCfg(){return `<h2>Ajustes</h2><div class="stack"><label class="f">WhatsApp do Lava Car<input id="c-wa" data-c="cfg" data-f="whatsapp" inputmode="tel" value="${esc(D.biz.whatsapp)}" placeholder="(11) 90000-0000"></label><label class="f">Instagram<input id="c-ig" data-c="cfg" data-f="instagram" value="${esc(D.biz.instagram)}" placeholder="@usuario"></label><label class="f">Chave Pix<input id="c-px" data-c="cfg" data-f="pix" value="${esc(D.biz.pix)}" placeholder="CNPJ, celular, e-mail ou chave aleatória"></label><button class="btn ghost" id="c-out" data-a="logout">Sair</button></div>`}
function shVeh(){const f=S.sheet.f;return `<h2>Novo modelo</h2><div class="stack"><div class="seg wide"><button id="nh-c" data-a="vhT" data-v="carro" class="${f.type==='carro'?'on':''}">Carro</button><button id="nh-m" data-a="vhT" data-v="moto" class="${f.type==='moto'?'on':''}">Moto</button></div><label class="f">Marca<input id="nh-b" data-vh="brand" value="${esc(f.brand)}"></label><label class="f">Modelo<input id="nh-o" data-vh="model" value="${esc(f.model)}"></label>${f.type==='carro'?`<label class="f">Porte<select id="nh-s" data-c="vhS">${['p','m','g','gg'].map(s=>`<option value="${s}" ${f.size===s?'selected':''}>${SIZES[s]} (${SIZE_HINT[s]})</option>`).join('')}</select></label>`:''}<p class="err" id="nh-e" hidden></p><button class="btn pri" id="nh-go" data-a="vhSave">Adicionar modelo</button></div>`}

/* ===== Ações ===== */
const A={
 tab(v){if(v==='entrar'||(v==='agendar'&&!S.user)){S.login=true;S.auth=null;S.loginAs='cliente';S.authErr='';S.after=v==='agendar'?'agendar':null;render();scrollTo(0,0);return}if(v==='agendar'&&S.w?.done)S.w=null;S.tab=v;S.armCancel=null;render();scrollTo(0,0)},
 loginAs(v){S.loginAs=v;S.auth=null;S.authErr='';render()},closeLogin(){S.login=false;S.authErr='';render();scrollTo(0,0)},
 async verifyNow(){await auth.currentUser.reload();await auth.currentUser.getIdToken(true);startSession(auth.currentUser)},
 async resendVerify(){await sendEmailVerification(auth.currentUser).catch(fail);toast('Enviei o link para '+auth.currentUser.email+'.')},
 authTo(v){S.auth=v||null;S.authErr='';render();scrollTo(0,0)},copyPix(){const k=D.biz.pix;const ok=()=>toast('Chave Pix copiada.'),no=()=>toast('Toque e segure a chave para copiar.');try{navigator.clipboard.writeText(k).then(ok,no)}catch(e){no()}},
 logout(){S.sheet=null;S.w=null;signOut(auth)},
 wBack(){S.w.step--;S.w.err='';render();scrollTo(0,0)},
 wType(v){S.w.nv={...S.w.nv,type:v,brand:'',model:'',other:false,brandOther:false,size:v==='moto'?'moto':''};render()},
 nvSize(v){S.w.nv.size=v;S.w.err='';render()},
 wNext1(){const w=S.w,n=w.nv,v=wVeh();
  if(!v){w.err=n.other&&!n.size?'Escolha um tamanho parecido para calcular o tempo.':'Escolha a marca e o modelo do veículo.';render();return}
  if(w.vid==='novo'&&!n.color.trim()){w.err='Informe a cor do veículo.';render();return}
  w.err='';w.items=[];w.step=2;render();scrollTo(0,0)},
 wPack(v){const w=S.w,ex=w.items.filter(i=>svc(i).group==='extra'),cur=w.items.find(i=>svc(i).group==='pacote');w.items=cur===v?ex:[v,...ex];w.start=null;w.err='';render()},
 wNext2(){const w=S.w;if(!w.items.length){w.err='Escolha ao menos um serviço.';render();return}w.err='';w.start=null;w.date=null;w.step=3;render();scrollTo(0,0)},
 wDay(v){S.w.date=v;S.w.start=null;S.w.err='';render()},
 wSlot(v){S.w.start=+v;S.w.err='';render()},
 wNext3(){const w=S.w;if(w.start==null){w.err='Escolha um horário.';render();return}w.err='';w.step=4;render();scrollTo(0,0)},
 async wSend(){const w=S.w;if(w.sending)return;w.sending=true;const v0=wVeh(),m=dur(v0,w.items),uid_=auth.currentUser.uid,id=doc(collection(db,'bookings')).id;
  const isNew=w.vid==='novo',v=isNew?{...v0,id:uid()}:v0,known=VEH.concat(D.vehAdd).find(x=>vKey(x)===vKey(v));
  const b={clientId:uid_,clientName:S.user.name,phone:S.user.phone,email:S.user.email,vehicle:JSON.parse(JSON.stringify(v)),items:[...w.items],price:totalPrice(v,w.items),date:w.date,start:w.start,minutes:m,estMinutes:m,status:'pendente',note:'',createdAt:Date.now()};
  try{await runTransaction(db,async tx=>{const dr=doc(db,'days',w.date),ds=await tx.get(dr);const it=ds.exists()?ds.data().items||{}:{};
    D.busy=D.busy.filter(x=>x.date!==w.date).concat(Object.entries(it).map(([k,x])=>({id:k,date:w.date,...x})));
    if(!fits(w.date,w.start,m))throw new Error('ocupado');
    tx.set(dr,{date:w.date,lastKey:id,items:{[id]:{start:w.start,minutes:m,uid:uid_}}},{merge:true});tx.set(doc(db,'bookings',id),b)});
   if(isNew){await updateDoc(doc(db,'users',uid_),{vehicles:arrayUnion(JSON.parse(JSON.stringify(v)))}).catch(console.error);if(!known)addDoc(collection(db,'vehicleRequests'),{type:v.type,brand:v.brand,model:v.model,size:v.size,by:uid_}).catch(console.error)}
   w.done=id;w.doneB=b;render();scrollTo(0,0)
  }catch(e){w.sending=false;if(e.message==='ocupado'){w.err='Esse horário acabou de ser ocupado. Escolha outro.';w.step=3;w.start=null;render()}else fail(e)}},
 armCancel(v){S.armCancel=v;render()},noCancel(){S.armCancel=null;render()},
 async doCancel(v){const b=D.bookings.find(x=>x.id===v);S.armCancel=null;await changeBooking(b,{status:'cancelado'}).then(()=>toast('Agendamento cancelado.')).catch(fail)},
 shClose(){S.sheet=null;renderSheet()},
 bOpen(v){const b=D.bookings.find(x=>x.id===v);S.sheet={type:'booking',id:v,min:b.minutes,start:b.start,date:b.date,learn:false};renderSheet()},
 adj(v){const s=S.sheet;s.min=Math.max(15,s.min+Number(v));const b=D.bookings.find(x=>x.id===s.id);if(s.min===b.estMinutes)s.learn=false;else if(!s.touched){s.learn=true}renderSheet()},
 async bApprove(){const s=S.sheet,b=D.bookings.find(x=>x.id===s.id);if(!fits(s.date,s.start,s.min,b.id))return;
  const lrn=s.learn&&s.min!==b.estMinutes,was=b.status;
  try{await changeBooking(b,{minutes:s.min,start:s.start,date:s.date,status:'confirmado'});
   if(lrn){const k=vKey(b.vehicle),id=b.items[0],base=svcMin(b.vehicle,id)??0;D.timeOv[k]={...(D.timeOv[k]||{}),[id]:b.items.length===1?s.min:Math.max(15,base+s.min-b.estMinutes)};save()}
   S.sheet=null;render();toast(lrn?`${was==='pendente'?'Aprovado':'Salvo'}. Próximos ${vehName(b.vehicle)} já usam esse tempo.`:was==='pendente'?'Aprovado. O cliente vê a confirmação no app.':'Alteração salva.')
  }catch(e){if(e.message==='ocupado')toast('Esse horário acabou de ser ocupado. Escolha outro.');else fail(e)}},
 async bDone(){const b=D.bookings.find(x=>x.id===S.sheet.id);await changeBooking(b,{status:'concluido'}).then(()=>{S.sheet=null;render();toast('Serviço concluído.')}).catch(fail)},
 bRefOpen(){S.sheet.refuse=true;renderSheet()},
 async bRefuse(){const b=D.bookings.find(x=>x.id===S.sheet.id);await changeBooking(b,{status:b.status==='pendente'?'recusado':'cancelado',note:S.sheet.why||''}).then(()=>{S.sheet=null;render();toast('O horário voltou a ficar livre.')}).catch(fail)},
 aDay(v){S.agenda=v;render()},
 hoursOpen(){S.sheet={type:'hours'};renderSheet()},
 blAdd(){const d=document.getElementById('bl-d').value,f=pT(document.getElementById('bl-f').value),t=pT(document.getElementById('bl-t').value);if(!d||t<=f){toast('O fim precisa ser depois do início.');return}D.blocks.push({id:uid(),date:d,from:f,to:t,why:document.getElementById('bl-w').value});save();render();toast('Período bloqueado.')},
 blDel(v){D.blocks=D.blocks.filter(b=>b.id!==v);save();render()},
 svOpen(v){const s=svc(v);S.sheet={type:'service',id:v,f:{...JSON.parse(JSON.stringify(s)),itemsT:s.items.join('\n')}};renderSheet()},
 svNew(){S.sheet={type:'service',isNew:true,f:{name:'',group:'extra',tier:'sky',icon:'spark',itemsT:'',active:true,min:{moto:null,p:60,m:60,g:60,gg:60},price:{moto:null,p:null,m:null,g:null,gg:null}}};renderSheet()},
 svGroup(v){S.sheet.f.group=v;renderSheet()},
 svSave(){const s=S.sheet,f=s.f,e=document.getElementById('sv-err');if(!f.name.trim()){e.textContent='Dê um nome ao serviço.';e.hidden=false;return}
  const o={...f,name:f.name.trim(),items:f.itemsT.split('\n').map(x=>x.trim()).filter(Boolean)};delete o.itemsT;
  if(s.isNew){o.id=uid();D.services.push(o)}else D.services[D.services.findIndex(x=>x.id===s.id)]=o;save();S.sheet=null;render();toast('Serviço salvo.')},
 svDel(){const id=S.sheet.id;if(D.bookings.some(b=>live(b)&&b.items.includes(id))){const e=document.getElementById('sv-err');e.textContent='Há agendamentos com este serviço. Oculte em vez de remover.';e.hidden=false;return}D.services=D.services.filter(x=>x.id!==id);save();S.sheet=null;render()},
 vsF(v){S.vs=v;render()},
 vhNew(){S.sheet={type:'veh',f:{type:'carro',brand:'',model:'',size:'m'}};renderSheet()},vhT(v){S.sheet.f.type=v;renderSheet()},
 vhSave(){const f=S.sheet.f,e=document.getElementById('nh-e');if(!f.brand.trim()||!f.model.trim()){e.textContent='Informe marca e modelo.';e.hidden=false;return}D.vehAdd.push({type:f.type,brand:f.brand.trim(),model:f.model.trim(),size:f.type==='moto'?'moto':f.size});save();S.sheet=null;render();toast('Modelo adicionado.')},
 lrnDel(v){const[k,id]=v.split('::');delete D.timeOv[k][id];if(!Object.keys(D.timeOv[k]).length)delete D.timeOv[k];save();render()},
 cfgOpen(){S.sheet={type:'cfg'};renderSheet()},
};
const C={
 wVid(t){S.w.vid=t.value;S.w.err='';render()},
 nvBrand(t){const n=S.w.nv;n.model='';n.other=false;if(t.value==='__o'){n.brandOther=true;n.brand='';n.other=true}else{n.brandOther=false;n.brand=t.value}if(n.type==='moto')n.size='moto';render()},
 nvModel(t){const n=S.w.nv;if(t.value==='__o'){n.other=true;n.model=''}else{n.other=false;n.model=t.value}render()},
 wExtra(t){const w=S.w;w.items=t.checked?[...w.items,t.value]:w.items.filter(i=>i!==t.value);w.err='';render()},
 adjStart(t){S.sheet.start=+t.value;renderSheet()},adjDate(t){const s=S.sheet;if(!t.value)return;s.date=t.value;const o=slots(s.date,s.min,s.id);if(!fits(s.date,s.start,s.min,s.id)&&o.length)s.start=o[0];renderSheet()},adjLearn(t){S.sheet.learn=t.checked;S.sheet.touched=true;renderSheet()},
 svAct(t){S.sheet.f.active=t.checked},
 hOn(t){D.hours[t.dataset.i2].on=t.checked;save();render()},
 hOpen(t){const h=D.hours[t.dataset.i2],v=pT(t.value);if(v<h.close){h.open=v;save()}else toast('A abertura precisa ser antes do fechamento.');renderSheet()},
 hClose(t){const h=D.hours[t.dataset.i2],v=pT(t.value);if(v>h.open){h.close=v;save()}else toast('O fechamento precisa ser depois da abertura.');renderSheet()},
 hBox(t){D.boxes=+t.value;save();render()},
 vSize(t){const k=t.dataset.k,r=D.requests.find(v=>vKey(v)===k);if(r){D.vehAdd.push({type:r.type,brand:r.brand,model:r.model,size:t.value});deleteDoc(doc(db,'vehicleRequests',r.id)).catch(fail)}else D.sizeOv[k]=t.value;save();toast('Porte atualizado para os próximos agendamentos.')},
 vhS(t){S.sheet.f.size=t.value},
 cfg(t){D.biz[t.dataset.f]=t.value.trim();save();toast('Salvo.')},
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t||t.disabled)return;const fn=A[t.dataset.a];if(fn){e.preventDefault();fn(t.dataset.v)}});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.c&&C[t.dataset.c])C[t.dataset.c](t);
});
document.addEventListener('input',e=>{const t=e.target,d=t.dataset;
 if('ba' in d){t.parentElement.style.setProperty('--p',t.value+'%')}
 if(d.i)S.w.nv[d.i]=t.value;
 if(d.q!==undefined){S.vq=t.value;const q=S.vq.toLowerCase();document.getElementById('v-list').innerHTML=vList(allVeh().filter(v=>(!S.vs||sizeOf(v)===S.vs)&&(!q||`${v.brand} ${v.model}`.toLowerCase().includes(q))))}
 if(d.sh)S.sheet[d.sh]=t.value;if(d.sv)S.sheet.f[d.sv]=t.value;if(d.vh)S.sheet.f[d.vh]=t.value;
 if(d.mn){S.sheet.f.min[d.mn]=t.value===''?null:Math.max(1,parseInt(t.value)||0)||null}
 if(d.pr){const n=parseFloat(t.value.replace(',','.'));S.sheet.f.price[d.pr]=isNaN(n)?null:n}
 });
const authMsg=e=>({'auth/invalid-credential':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/user-not-found':'E-mail ou senha incorretos.','auth/email-already-in-use':'Esse e-mail já tem cadastro. Entre ou recupere a senha.','auth/weak-password':'Use uma senha com pelo menos 6 caracteres.','auth/invalid-email':'Confira o e-mail digitado.','auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente de novo.','auth/network-request-failed':'Sem conexão. Confira a internet.'}[e.code]||'Não consegui entrar. Tente de novo.');
document.addEventListener('submit',async e=>{e.preventDefault();const val=id=>document.getElementById(id).value.trim();
 if(e.target.id==='rec-form'){const m=val('re-e');try{await sendPasswordResetEmail(auth,m)}catch(_){ }S.auth=null;render();toast('Se '+m+' tiver cadastro, o link chega nesse e-mail. Confira também o spam.');return}
 if(e.target.id!=='auth-form')return;const em=val('au-e').toLowerCase(),pw=document.getElementById('au-s').value;S.authErr='';
 try{if(S.auth==='cad'){const name=val('au-n'),phone=val('au-p');S.pendingProfile={name,phone};const c=await createUserWithEmailAndPassword(auth,em,pw);await updateProfile(c.user,{displayName:name}).catch(console.error);await setDoc(doc(db,'users',c.user.uid),{name,email:em,phone,vehicles:[]});if(EMPRESAS.includes(em))await sendEmailVerification(c.user).catch(console.error)}
  else await signInWithEmailAndPassword(auth,em,pw)}catch(x){S.authErr=authMsg(x);render()}});
render();

/* ===== Firebase: sessão e dados em tempo real ===== */
async function changeBooking(b,patch){
 const id=b.id,oldD=doc(db,'days',b.date),nd=patch.date||b.date,newD=doc(db,'days',nd),st=patch.status||b.status,keep=st==='pendente'||st==='confirmado',start=patch.start??b.start,min=patch.minutes??b.minutes;
 await runTransaction(db,async tx=>{const ns=await tx.get(newD);if(nd!==b.date)await tx.get(oldD);
  if(keep){const it=ns.exists()?ns.data().items||{}:{};D.busy=D.busy.filter(x=>x.date!==nd).concat(Object.entries(it).map(([k,x])=>({id:k,date:nd,...x})));if(!fits(nd,start,min,id))throw new Error('ocupado');
   tx.set(newD,{date:nd,lastKey:id,items:{[id]:{start,minutes:min,uid:b.clientId}}},{merge:true});if(nd!==b.date)tx.update(oldD,{lastKey:id,['items.'+id]:deleteField()})}
  else tx.update(oldD,{lastKey:id,['items.'+id]:deleteField()});
  tx.update(doc(db,'bookings',id),patch)});
}
const sortB=l=>l.sort((x,y)=>(y.date+pad(y.start)).localeCompare(x.date+pad(x.start)));
let subs=[];const stop=()=>{subs.forEach(u=>u());subs=[]};
function startSession(u){stop();
 const em=(u.email||'').toLowerCase(),isEmp=EMPRESAS.includes(em)&&u.emailVerified;
 S.role=isEmp?'master':'cliente';S.needVerify=EMPRESAS.includes(em)&&!u.emailVerified;
 const prof=S.pendingProfile||{};S.user={id:u.uid,name:prof.name||u.displayName||'',email:em,phone:prof.phone||'',vehicles:[]};
 const wanted=S.after;S.after=null;S.login=false;S.tab=isEmp?'painel':(wanted||'home');S.w=null;S.authErr='';
 subs.push(onSnapshot(doc(db,'users',u.uid),s=>{if(s.exists()){S.user={...S.user,...s.data(),id:u.uid};refresh()}},console.error));
 subs.push(onSnapshot(isEmp?collection(db,'bookings'):query(collection(db,'bookings'),where('clientId','==',u.uid)),s=>{D.bookings=sortB(s.docs.map(x=>({id:x.id,...x.data()})));refresh()},console.error));
 subs.push(onSnapshot(collection(db,'days'),s=>{const t=addD(today(),-1);D.busy=[];s.docs.forEach(x=>{const dt=x.data();if(dt.date>=t)Object.entries(dt.items||{}).forEach(([k,i])=>D.busy.push({id:k,date:dt.date,...i}))});refresh()},console.error));
 if(isEmp)subs.push(onSnapshot(collection(db,'vehicleRequests'),s=>{D.requests=s.docs.map(x=>({id:x.id,...x.data()}));refresh()},console.error));
 if(S.loginAs==='empresa'&&!isEmp&&!S.needVerify)toast('Este e-mail não tem acesso de empresa.');
 render();scrollTo(0,0);
}
onSnapshot(doc(db,'config','app'),s=>{if(s.exists())Object.assign(D,s.data());refresh()},console.error);
onAuthStateChanged(auth,u=>{S.ready=true;if(u)startSession(u);else{stop();S.pendingProfile=null;D.bookings=[];D.busy=[];D.requests=[];S.user=null;S.role='cliente';S.tab='home';S.login=false;render()}});
if(window.__TEST__)window.__T={A,S,get D(){return D},dur,fits,auth};
