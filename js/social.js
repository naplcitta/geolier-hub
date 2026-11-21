/* Social: your name, share cards, compare links, game challenges, install help.
   There's no server. Everything travels inside the link itself. */
const appURL=()=>location.origin+location.pathname
const myName=()=>localGet("name","")
const b64e=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")
const b64d=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/")))))

async function shareOut({title,text,url,file}){
 try{if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title,text});return}
  if(navigator.share){await navigator.share({title,text,url});return}}catch(e){if(e.name==="AbortError")return}
 if(file){const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();a.remove();toast("Image saved");return}
 try{await navigator.clipboard.writeText([text,url].filter(Boolean).join("\n"));toast("Link copied")}catch(e){prompt("Copy this link",url)}}

/* share card image: your top 10 in black and gold */
function loadImg(u){return new Promise(r=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>r(i);i.onerror=()=>r(null);i.src=u+(u.includes("?")?"&":"?")+"cors=1"})}
async function topCard(){const top=myTop(10);if(top.length<10){toast("Battle a few more songs first");return}
 toast("Making your card…")
 try{await document.fonts.load('900 60px "Big Shoulders Display"');await document.fonts.load('700 30px "Manrope"')}catch(e){}
 const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d")
 x.fillStyle="#040a16";x.fillRect(0,0,W,H)
 const glow=x.createRadialGradient(W*.85,0,0,W*.85,0,W);glow.addColorStop(0,"rgba(18,160,215,.24)");glow.addColorStop(1,"rgba(18,160,215,0)");x.fillStyle=glow;x.fillRect(0,0,W,H)
 const foil=x.createLinearGradient(0,60,0,220);foil.addColorStop(0,"#ffffff");foil.addColorStop(.5,"#7fd3ff");foil.addColorStop(1,"#12a0d7")
 x.fillStyle="#8fa6c6";x.font='500 26px "IBM Plex Mono", monospace';x.fillText((myName()?myName().toUpperCase()+"'S ":"MY ")+"ALL-TIME",72,108)
 x.fillStyle=foil;x.font='900 128px "Big Shoulders Display", Impact, sans-serif';x.fillText("GEOLIER TOP 10",66,228)
 const imgs=await Promise.all(top.map(s=>loadImg(art(s))))
 top.forEach((s,i)=>{const y=280+i*94
  x.fillStyle=i<3?foil:"#4e6687";x.font='900 64px "Big Shoulders Display", Impact, sans-serif';x.textAlign="right";x.fillText(String(i+1),140,y+66);x.textAlign="left"
  if(imgs[i])x.drawImage(imgs[i],166,y+6,80,80);else{x.fillStyle="#10203a";x.fillRect(166,y+6,80,80)}
  x.fillStyle="#eef5ff";x.font='800 38px "Manrope", sans-serif';let t=s.t;while(x.measureText(t).width>740&&t.length>4)t=t.slice(0,-2);if(t!==s.t)t+="…";x.fillText(t,272,y+44)
  x.fillStyle="#8fa6c6";x.font='500 25px "Manrope", sans-serif';x.fillText(A[s.a].t+" · "+songYear(s),272,y+80)})
 x.fillStyle="#1b2f4f";x.fillRect(72,H-96,W-144,2)
 x.fillStyle="#12a0d7";x.font='800 28px "Big Shoulders Display", Impact, sans-serif';x.fillText("GEOLIER HUB",72,H-48)
 x.fillStyle="#4e6687";x.font='500 22px "IBM Plex Mono", monospace';x.textAlign="right";x.fillText(`ranked from ${S.nb.toLocaleString()} head-to-heads`,W-72,H-48);x.textAlign="left"
 let blob;try{blob=await new Promise(r=>c.toBlob(r,"image/png"))}catch(e){blob=null}
 if(!blob){toast("Couldn't build the image. Try again with a connection.");return}
 shareOut({title:"My Geolier Top 10",text:"My Geolier top 10. Rank yours:",url:appURL(),file:new File([blob],"geolier-top-10.png",{type:"image/png"})})}

/* compare: your top 25 inside a link */
function compareLink(){const t=myTop(25).map(s=>s.id);return appURL()+"#vs-"+b64e({n:myName()||"A friend",t})}
function shareCompare(){if(myTop(25).length<25||S.nb<50){toast("Fight at least 50 battles first so your top 25 means something");return}
 shareOut({title:"Compare Geolier rankings",text:`${myName()||"I"} ranked every Geolier song. See how your taste matches:`,url:compareLink()})}
function tasteMatch(theirs,mine){const pos={};mine.forEach((id,i)=>pos[id]=i);let score=0,max=0
 theirs.forEach((id,i)=>{const w=25-i;max+=w;if(pos[id]!=null)score+=w*Math.max(0,1-Math.abs(pos[id]-i)/25)})
 return Math.round(score/max*100)}
function vVs(code){let d;try{d=b64d(code)}catch(e){return `<p class="empty" style="margin-top:30px">That compare link is broken. Ask your friend to send it again.</p>`}
 const theirs=(d.t||[]).filter(id=>SONG[id]),name=esc(d.n||"A friend"),have=S.nb>=50
 const L=ladderIds(D.songs),pos={};L.forEach((id,i)=>pos[id]=i+1)
 const mine=have?L.slice(0,25):[],match=have?tasteMatch(theirs,L.slice(0,100)):null,both=theirs.filter(id=>mine.includes(id))
 const row=(id,i,other)=>{const s=SONG[id];return `<li><span class="p">${i+1}</span><img src="${art(s)}" alt=""><span>${esc(s.t)}</span><i>${other?other:""}</i></li>`}
 return `<p class="eyebrow">Compare</p><h1 class="title foil">${name} vs you</h1>
 ${have?`<div class="card glow" style="margin-bottom:14px"><div class="row" style="align-items:end"><b class="foil num" style="font-family:var(--display);font-weight:900;font-size:64px;line-height:1">${match}%</b><span class="hint" style="margin-bottom:10px">taste match</span></div><p class="hint">${both.length} songs are in both of your top 25s.${both.length?" Shared: "+both.slice(0,5).map(id=>esc(SONG[id].t)).join(", ")+(both.length>5?"…":""):""}</p></div>`
 :`<div class="card glow" style="margin-bottom:14px"><p class="hint"><b>Rank your own list to see your taste match.</b> Around 50 head-to-heads gives a first read.</p><a class="btn gold" href="#rank" style="margin-top:10px">Start ranking</a></div>`}
 <div class="two" style="margin-top:0"><div class="card"><p class="eyebrow">${name}'s top 25</p><ol class="mini-list" style="margin-top:10px">${theirs.map((id,i)=>row(id,i,have?"you #"+pos[id]:"")).join("")}</ol></div>
 ${have?`<div class="card"><p class="eyebrow">Your top 25</p><ol class="mini-list" style="margin-top:10px">${mine.map((id,i)=>row(id,i,theirs.includes(id)?"them #"+(theirs.indexOf(id)+1):"")).join("")}</ol></div>`:""}</div>
 ${have?`<button class="btn gold" id="vs-back" style="margin-top:14px">Send them yours</button>`:""}`}
function afterVs(){const b=$("#vs-back");if(b)b.onclick=shareCompare}

/* challenges: a friend plays the exact same game you just played */
function challengeLink(){const d={g:Game.id,d:Game.diff,s:Game.seed,src:Game.src&&Game.src!=="mine"?Game.src:"all",sc:Game.id==="hilo"?Game.streak:GDEF[Game.id].endless?Game.right:Game.score,n:myName()||"A friend"}
 return appURL()+"#ch-"+b64e(d)}
function shareChallenge(){if(Game.src==="mine"){toast("Challenges need a shared song pool. Pick All of Geolier or an album.");return}
 const sc=Game.id==="hilo"?`a streak of ${Game.streak}`:Game.id==="survival"?`${Game.right} clips survived`:Game.id==="speed"?`${Game.right} right in 60 seconds`:`${Game.score.toLocaleString()} points`
 shareOut({title:"Geolier Hub challenge",text:`I got ${sc} on ${GDEF[Game.id].name} (${GDEF[Game.id].diffs[Game.diff].label}). Same questions, your turn:`,url:challengeLink()})}
function vChallenge(code){let d;try{d=b64d(code)}catch(e){d=null}
 if(!d||!GDEF[d.g]||!GDEF[d.g].diffs[d.d])return `<p class="empty" style="margin-top:30px">That challenge link is broken. Ask your friend to send it again.</p>`
 const g=GDEF[d.g],what=d.g==="hilo"?`a streak of ${d.sc}`:d.g==="survival"?`${d.sc} clips`:d.g==="speed"?`${d.sc} in 60 seconds`:`${Number(d.sc).toLocaleString()} points`
 return `<p class="eyebrow">Challenge</p><h1 class="title foil">${esc(d.n)} got ${what}</h1>
 <div class="card glow"><p class="hint">${g.name} · ${g.diffs[d.d].label}. You get the exact same ${d.g==="hilo"?"songs":"questions"} in the same order. Beat it.</p>${d.g==="snippet"?`<p class="hint" style="margin-top:6px">Turn your sound on.</p>`:""}<button class="btn gold" id="ch-go" style="margin-top:12px">Accept the challenge</button></div>`}
function afterChallenge(code){const b=$("#ch-go");if(!b)return;const d=b64d(code)
 b.onclick=()=>{Game.vs={n:d.n,sc:Number(d.sc)};startGame(d.g,d.d,d.src||"all",d.s)}}

/* install help */
let installEvt=null
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;const b=$("#inst-btn");if(b)b.hidden=false})
function installCard(){if(standalone()||localGet("instDismiss","")==="1")return ""
 const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)
 return `<div class="card" id="inst" style="margin-bottom:12px;display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center"><img src="icons/icon-192.png" alt="" style="width:52px;height:52px;border-radius:12px"><div><b style="display:block">Get the app</b><small class="hint">${ios?"In Safari, tap Share, then Add to Home Screen.":"Install it for full screen and offline play."}</small></div><div class="row" style="gap:6px"><button class="btn small gold" id="inst-btn"${installEvt?"":" hidden"}>Install</button><button class="btn small ghost" id="inst-x" aria-label="Dismiss">✕</button></div></div>`}
function afterInstall(){const x=$("#inst-x");if(x)x.onclick=()=>{localSet("instDismiss","1");$("#inst").remove()}
 const b=$("#inst-btn");if(b)b.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;b.hidden=true}}
