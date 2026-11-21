/* Games: Name That Tune, Cover Zoom, Trivia, Higher or Lower, Odd One Out, Timeline, Daily Challenge */
let RNG=Math.random
const gshuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(RNG()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const gpick=a=>a[Math.floor(RNG()*a.length)]
const gtake=(a,n)=>gshuf(a).slice(0,n)
const uniqT=list=>{const seen=new Set();return list.filter(s=>{const k=norm(s.t);if(seen.has(k))return false;seen.add(k);return true})}
const byStreams=()=>D.songs.filter(s=>s.st).sort((x,y)=>y.st-x.st)
function songPool(diff){const ranked=byStreams();if(diff==="easy")return ranked.slice(0,120);if(diff==="medium")return ranked.slice(0,250);return D.songs.filter(s=>s.pv)}

const GDEF={
 snippet:{name:"Name That Tune",tag:"Hear a clip, name the song",bg:()=>A.dls.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"7-second clips from his biggest songs. 4 choices.",clip:7,n:4,base:100,T:20},
         medium:{label:"Medium",desc:"4-second clips from 250 songs. Similar-sounding choices.",clip:4,n:4,base:150,T:15},
         hard:{label:"Hard",desc:"2 seconds, any song, 6 choices from the same era.",clip:2,n:6,base:250,T:12},
         legend:{label:"Legend",desc:"1 second, any song, no choices. Type it.",clip:1,n:0,base:400,T:25}}},
 cover:{name:"Cover Zoom",tag:"Name the cover from a close-up",bg:()=>A.tep.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"Light zoom, albums only, 4 choices.",zoom:2.3,n:4,base:100,T:15},
         medium:{label:"Medium",desc:"Deep zoom, albums and EPs, 6 choices.",zoom:4.2,n:6,base:150,T:12},
         hard:{label:"Hard",desc:"Extreme zoom in black and white, singles included.",zoom:7.5,n:6,base:250,T:12,gray:true}}},
 trivia:{name:"Trivia",tag:"Years, features, tracklists, charts",bg:()=>A.em.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"The hits. Albums, years, #1s.",base:100,T:15},
         medium:{label:"Medium",desc:"Features, first weeks, track counts.",base:150,T:12},
         hard:{label:"Hard",desc:"Deep cuts, openers, closers. Tight clock.",base:250,T:9}}},
 hilo:{name:"Higher or Lower",tag:"Which has more Spotify streams",bg:()=>A.em.art2,
  diffs:{easy:{label:"Easy",desc:"Big gaps between songs.",gap:2.2,mult:1},
         medium:{label:"Medium",desc:"Closer calls.",gap:1.35,mult:1.5},
         hard:{label:"Hard",desc:"Within a few hundred million. Pure instinct.",gap:0,mult:2.5}}},
 odd:{name:"Odd One Out",tag:"Three share an album. Find the stray.",bg:()=>A.tep.art2,rounds:10,
  diffs:{easy:{label:"Easy",desc:"The stray is from a different era.",yrs:5,base:100,T:15},
         medium:{label:"Medium",desc:"The stray is from a nearby album.",yrs:2,base:150,T:12},
         hard:{label:"Hard",desc:"Same era, same sound. Know your tracklists.",yrs:0,base:250,T:10}}},
 timeline:{name:"Timeline",tag:"Put them in release order",bg:()=>A.cdb.art,rounds:5,
  diffs:{easy:{label:"Easy",desc:"4 albums.",n:4,mode:"albums",base:60},
         medium:{label:"Medium",desc:"5 songs from across his career.",n:5,mode:"songs",base:80},
         hard:{label:"Hard",desc:"6 songs, release dates close together.",n:6,mode:"close",base:120}}}}

const Game={id:null,diff:null,i:0,n:10,score:0,right:0,marks:[],q:null,qs:null,answered:false,au:null,t0:0,raf:0,replays:0,
 stopAudio(){if(this.au){this.au.pause()}cancelAnimationFrame(this.raf);clearTimeout(this.snipT)}}

/* question generators. Each returns {prompt, choices[{id,label,sub,img}], answer, reveal, ...} */
function songChoice(s){return{id:s.id,label:s.t,sub:A[s.a].t,img:null}}
function distractSongs(s,n,mode){let pool=uniqT(D.songs.filter(x=>x.id!==s.id&&norm(x.t)!==norm(s.t)))
 if(mode==="similar")pool=pool.filter(x=>x.l===s.l||Math.abs(songYear(x)-songYear(s))<=2)
 if(mode==="era"){const same=pool.filter(x=>x.a===s.a),near=pool.filter(x=>x.a!==s.a&&Math.abs(songYear(x)-songYear(s))<=2);return uniqT(gtake(same,Math.ceil(n/2)).concat(gtake(near,n))).slice(0,n)}
 if(mode==="hits")pool=pool.filter(x=>x.st&&x.st>2e8)
 return gtake(pool,n)}
const revealSong=(s,extra)=>`<div class="reveal"><img src="${art(s)}" alt=""><div><b>${esc(s.t)}</b><small class="hint">${esc(A[s.a].t)} · ${songYear(s)}${s.st?" · "+fmtS(s.st)+" streams":""}</small>${extra?`<p class="hint" style="margin-top:4px">${extra}</p>`:""}<div class="row" style="margin-top:8px">${pvBtn(s)}<a class="btn small ghost" href="${songLink(s)}" target="_blank" rel="noopener">Spotify</a></div></div></div>`

function genSnippet(diff,src){const c=GDEF.snippet.diffs[diff];let pool=songPool(diff)
 if(src&&src!=="all"){if(src==="mine")pool=myTop(60);else if(A[src])pool=BYA[src]}
 pool=pool.filter(s=>s.pv);const s=gpick(pool)
 const off=c.clip>=7?5+RNG()*14:2+RNG()*(27-c.clip)
 const mode=diff==="easy"?(src&&A[src]?"any":"hits"):diff==="medium"?"similar":"era"
 let wrong=c.n?(src&&A[src]?gtake(uniqT(BYA[src].filter(x=>x.id!==s.id&&norm(x.t)!==norm(s.t))),c.n-1):distractSongs(s,c.n-1,mode)):[]
 if(wrong.length<c.n-1)wrong=wrong.concat(distractSongs(s,c.n-1-wrong.length,"any"))
 return{kind:"snip",song:s,audio:{src:s.pv,off,clip:c.clip},type:!c.n,choices:c.n?gshuf([s,...wrong]).map(songChoice):null,answer:s.id,reveal:revealSong(s),T:c.T,base:c.base}}
function coverItems(diff){let items=D.albums.filter(a=>a.type!=="Singles").map(a=>({id:"a:"+a.k,label:a.t,sub:String(a.y),img:a.art}))
 if(diff!=="easy")items=items.concat(D.albums.filter(a=>a.art2).map(a=>({id:"d:"+a.k,label:a.t+": "+a.dname,sub:a.ddate.slice(0,4)+" · deluxe",img:a.art2})))
 if(diff==="hard")items=items.concat(BYA.singles.map(s=>({id:"s:"+s.id,label:s.t,sub:"Single · "+songYear(s),img:s.art})))
 return items}
function genCover(diff){const c=GDEF.cover.diffs[diff],items=coverItems(diff),it=gpick(items)
 const wrong=gtake(items.filter(x=>x.id!==it.id),c.n-1)
 return{kind:"cover",img:it.img,zoom:c.zoom,ox:15+RNG()*70,oy:15+RNG()*70,gray:!!c.gray,hint:true,prompt:"Whose cover is this?",choices:gshuf([it,...wrong]).map(x=>({id:x.id,label:x.label,sub:x.sub})),answer:it.id,
  reveal:`<div class="reveal"><img src="${it.img}" alt=""><div><b>${esc(it.label)}</b><small class="hint">${esc(it.sub)}</small></div></div>`,T:c.T,base:c.base,timed:true}}

const firstFeat=s=>s.f.split(/, | & | and /)[0].trim()
const ALBS=()=>D.albums.filter(a=>a.type!=="Singles")
const TQ={
 album(diff){const s=gpick(songPool(diff).filter(x=>x.a!=="singles"));let others=ALBS().filter(a=>a.k!==s.a)
  if(diff==="hard")others=others.sort((x,y)=>Math.abs(x.y-A[s.a].y)-Math.abs(y.y-A[s.a].y)).slice(0,5)
  const ch=gshuf([A[s.a],...gtake(others,3)])
  return{prompt:`Which project is “${esc(s.t)}” on?`,choices:ch.map(a=>({id:a.k,label:a.t,sub:String(a.y)})),answer:s.a,reveal:revealSong(s)}},
 year(diff){const s=gpick(songPool(diff)),y=songYear(s),opts=new Set([y]);while(opts.size<4){const d=Math.round((RNG()*8)-4);if(d&&y+d>=2009&&y+d<=2026)opts.add(y+d)}
  return{prompt:`What year did “${esc(s.t)}” come out?`,choices:gshuf([...opts]).map(v=>({id:String(v),label:String(v)})),answer:String(y),reveal:revealSong(s)}},
 feat(diff){const pool=songPool(diff==="easy"?"medium":diff).filter(s=>s.f&&s.a!=="ssss");const s=gpick(pool),ans=firstFeat(s)
  const all=[...new Set(D.songs.filter(x=>x.f).map(firstFeat))].filter(x=>x!==ans&&!s.f.includes(x))
  return{prompt:`Who's featured on “${esc(s.t)}”?`,choices:gshuf([ans,...gtake(all,3)]).map(x=>({id:x,label:x})),answer:ans,reveal:revealSong(s,`Credited: ${esc(s.f)}`)}},
 one(diff){const o=gpick(ONES),s=find(o[0],o[1]);const nonOnes=diff==="easy"?byStreams().slice(0,80).filter(x=>!isOne(x)):PEAKS.map(p=>find(p[0],p[1])).filter(Boolean)
  const ch=gshuf([s,...gtake(uniqT(nonOnes),3)])
  return{prompt:"Which of these hit #1 on the Hot 100?",choices:ch.map(songChoice),answer:s.id,reveal:revealSong(s,`${o[3]} week${o[3]>1?"s":""} at #1 in ${o[2]}.`)}},
 streams(diff){const pool=songPool(diff).filter(s=>s.st);const ch=uniqT(gtake(pool,6)).slice(0,4),top=ch.slice().sort((x,y)=>y.st-x.st)[0]
  return{prompt:"Which has the most Spotify streams?",choices:ch.map(songChoice),answer:top.id,reveal:revealSong(top,ch.slice().sort((x,y)=>y.st-x.st).map(s=>esc(s.t)+" "+fmtS(s.st)).join(" · "))}},
 earlier(){const ch=gtake(ALBS().filter(a=>a.type!=="EP"),4),first=ch.slice().sort((x,y)=>x.date.localeCompare(y.date))[0]
  return{prompt:"Which came out first?",choices:ch.map(a=>({id:a.k,label:a.t})),answer:first.k,reveal:`<div class="reveal"><img src="${first.art}" alt=""><div><b>${esc(first.t)}</b><small class="hint">${ch.slice().sort((x,y)=>x.date.localeCompare(y.date)).map(a=>esc(a.t)+" "+a.y).join(" · ")}</small></div></div>`}},
 firstweek(){const ch=gtake(D.albums.filter(a=>a.units),4),top=ch.slice().sort((x,y)=>y.units-x.units)[0]
  return{prompt:"Which had the biggest first week?",choices:ch.map(a=>({id:a.k,label:a.t,sub:String(a.y)})),answer:top.k,reveal:`<div class="reveal"><img src="${top.art}" alt=""><div><b>${esc(top.t)}</b><small class="hint">${ch.slice().sort((x,y)=>y.units-x.units).map(a=>esc(a.t)+" "+a.units+"K").join(" · ")}</small></div></div>`}},
 tracks(){const a=gpick(ALBS().filter(a=>!["tc","nwts","fatd","habibti","sfg","views"].includes(a.k))),opts=new Set([a.n]);while(opts.size<4){const d=Math.round(RNG()*10)-5;if(d&&a.n+d>=2)opts.add(a.n+d)}
  return{prompt:`How many tracks are on ${esc(a.t)}?`,choices:gshuf([...opts]).map(v=>({id:String(v),label:String(v)})),answer:String(a.n),reveal:`<div class="reveal"><img src="${a.art}" alt=""><div><b>${esc(a.t)}</b><small class="hint">${a.n} tracks · ${hrs(a.ms)}</small></div></div>`}},
 longest(diff){const base=diff==="hard"?BYA[gpick(ALBS().filter(a=>a.n>=6)).k]:songPool(diff);const ch=uniqT(gtake(base,6)).slice(0,4),top=ch.slice().sort((x,y)=>y.ms-x.ms)[0]
  return{prompt:"Which song is the longest?",choices:ch.map(songChoice),answer:top.id,reveal:revealSong(top,ch.slice().sort((x,y)=>y.ms-x.ms).map(s=>esc(s.t)+" "+fmt(s.ms)).join(" · "))}},
 deluxe(){const a=gpick(ALBS().filter(a=>a.nstd)),dl=BYA[a.k].filter(s=>s.x),st=BYA[a.k].filter(s=>!s.x),s=gpick(dl),ch=gshuf([s,...gtake(st,3)])
  return{prompt:`Which song was added on ${esc(a.t)}: ${esc(a.dname)}?`,choices:ch.map(x=>({id:x.id,label:x.t})),answer:s.id,reveal:revealSong(s,`One of ${a.n-a.nstd} songs added on the ${esc(a.dname)} edition.`)}},
 opener(){const a=gpick(ALBS().filter(a=>a.n>=6)),L=BYA[a.k].filter(s=>!s.x),s=L[0],ch=gshuf([s,...gtake(L.slice(1),3)])
  return{prompt:`Which song opens the standard edition of ${esc(a.t)}?`,choices:ch.map(x=>({id:x.id,label:x.t})),answer:s.id,reveal:revealSong(s,"Track 1.")}},
 boards(diff){return genBoards(diff)},
 sample(diff){return genSample(diff==="hard"?"hard":"easy")},
 closer(){const a=gpick(ALBS().filter(a=>a.n>=6&&a.type!=="EP"&&!["fatd","habibti","tc","nwts","sfg","views"].includes(a.k))),L=BYA[a.k],s=L[L.length-1],ch=gshuf([s,...gtake(L.slice(0,-1),3)])
  return{prompt:`Which song closes the standard edition of ${esc(a.t)}?`,choices:ch.map(x=>({id:x.id,label:x.t})),answer:s.id,reveal:revealSong(s,`Track ${L.length}.`)}}}
const TMIX={easy:["album","album","year","streams","earlier","deluxe"],medium:["album","year","feat","streams","longest","earlier","deluxe","opener","boards"],hard:["album","feat","longest","opener","closer","deluxe","year","boards","closer"]}
function genTrivia(diff){const c=GDEF.trivia.diffs[diff];const q=TQ[gpick(TMIX[diff])](diff);return Object.assign(q,{kind:"trivia",T:c.T,base:c.base,timed:true})}
function genOdd(diff){const c=GDEF.odd.diffs[diff];const albs=ALBS().filter(a=>uniqT(BYA[a.k]).length>=5)
 for(let t=0;t<50;t++){const a=gpick(albs);let others=D.songs.filter(s=>s.a!==a.k&&norm(s.t)!==""&&!BYA[a.k].some(x=>norm(x.t)===norm(s.t)))
  others=c.yrs?others.filter(s=>Math.abs(songYear(s)-a.y)>=c.yrs):others.filter(s=>Math.abs(songYear(s)-a.y)<=1)
  if(diff==="hard"){const lane=others.filter(s=>BYA[a.k].some(x=>x.l===s.l));if(lane.length)others=lane}
  if(!others.length)continue
  const three=gtake(uniqT(BYA[a.k]),3),odd=gpick(others),ch=gshuf([...three,odd])
  return{kind:"odd",prompt:"Which one isn't from the same project?",choices:ch.map(s=>({id:s.id,label:s.t})),answer:odd.id,reveal:revealSong(odd,`The other three are from ${esc(a.t)} (${a.y}).`),T:c.T,base:c.base,timed:true}}}
function genCompare(){const pool=byStreams().slice(0,200),a=gpick(pool);let b;do{b=gpick(pool)}while(b.id===a.id||norm(b.t)===norm(a.t))
 const top=a.st>b.st?a:b
 return{kind:"cmp",prompt:"Which has more Spotify streams?",choices:[a,b].map(songChoice),answer:top.id,reveal:revealSong(top,`${esc(a.t)} ${fmtS(a.st)} · ${esc(b.t)} ${fmtS(b.st)}`),T:12,base:150,timed:true}}
/* new games */
Object.assign(GDEF,{
 survival:{name:"Tune Survival",tag:"Three lives. How long can you last?",bg:()=>A.cdb.art2,rounds:999,endless:true,
  diffs:{easy:{label:"Easy",desc:"5-second clips from the hits.",clip:5,n:4,base:100,T:20,pool:"easy"},
         medium:{label:"Medium",desc:"3-second clips, 250 songs.",clip:3,n:4,base:150,T:15,pool:"medium"},
         hard:{label:"Hard",desc:"1.5 seconds, anything goes.",clip:1.5,n:4,base:250,T:12,pool:"hard"}}},
 speed:{name:"Speed Round",tag:"60 seconds. Answer everything.",bg:()=>A.dls.art2,rounds:999,endless:true,
  diffs:{easy:{label:"Easy",desc:"Albums, years and #1s from the hits.",mix:"easy"},medium:{label:"Medium",desc:"Features, first weeks, producers.",mix:"medium"},hard:{label:"Hard",desc:"Openers, closers, deep cuts.",mix:"hard"}}},
 boards:{name:"Behind the Boards",tag:"Name the producer",bg:()=>A.cdb.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"Il coraggio dei bambini credits, top producers only.",base:100,T:15},medium:{label:"Medium",desc:"Every credited song on Il coraggio dei bambini.",base:150,T:12},hard:{label:"Hard",desc:"Tight clock, every credited name.",base:250,T:10}}},
 samples:{name:"Sample Hunter",tag:"Name the song from what it samples",bg:()=>A.dls.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"4 choices from across his career.",n:4,base:100,T:20},hard:{label:"Hard",desc:"6 choices from the same era.",n:6,base:250,T:15}}},
 fill:{name:"Fill the Title",tag:"One word is missing",bg:()=>A.tep.art,rounds:10,
  diffs:{easy:{label:"Easy",desc:"The hits.",base:100,T:12},hard:{label:"Hard",desc:"Any song, sneaky options.",base:200,T:9}}}})
const GORDER=["snippet","survival","cover","trivia","napoli","speed","boards","hilo","odd","fill","timeline"]
function genSurvival(diff){const c=GDEF.survival.diffs[diff];const pool=songPool(c.pool).filter(s=>s.pv),s=gpick(pool),off=2+RNG()*(27-c.clip)
 let wrong=distractSongs(s,c.n-1,diff==="easy"?"hits":"similar");if(wrong.length<c.n-1)wrong=wrong.concat(distractSongs(s,c.n-1-wrong.length,"any"))
 return{kind:"snip",song:s,audio:{src:s.pv,off,clip:c.clip},choices:gshuf([s,...wrong]).map(songChoice),answer:s.id,reveal:revealSong(s),T:c.T,base:c.base}}
const TOPPROD=()=>prodCounts(D.songs).slice(0,14).map(x=>x[0])
function genBoards(diff){const c=GDEF.boards.diffs[diff],gc={};prodCounts(D.songs).forEach(([n,k])=>gc[n]=k)
 let pool=(diff==="hard"?D.songs:songPool(diff)).filter(s=>prods(s).length)
 if(diff==="easy")pool=pool.filter(s=>prods(s).some(p=>TOPPROD().includes(p)))
 const s=gpick(pool),ans=prods(s).slice().sort((x,y)=>(gc[y]||0)-(gc[x]||0))[0]
 const others=(diff==="easy"?TOPPROD():prodCounts(D.songs).slice(0,40).map(x=>x[0])).filter(p=>!prods(s).includes(p))
 return{kind:"boards",prompt:`Who produced “${esc(s.t)}”?`,choices:gshuf([ans,...gtake(others,3)]).map(x=>({id:x,label:x})),answer:ans,reveal:revealSong(s,"Produced by "+prods(s).map(esc).join(", ")),T:c.T,base:c.base,timed:true}}
function genSample(diff){const c=GDEF.samples.diffs[diff],pool=D.songs.filter(s=>s.sm&&(s.sm[0].match(/^((?:"[^"]+"(?:,\s*|\s+and\s+)?)+)/)||[""])[0].split('"').length<=3),s=gpick(pool)
 const txt=s.sm[0].replace(/^((?:"[^"]+"(?:,\s*|\s+and\s+)?)+)/,"This song ").replace(/^This song\s+contain\b/,"This song contains")
 let others=uniqT(D.songs.filter(x=>x.id!==s.id&&norm(x.t)!==norm(s.t)&&!(x.sm||[]).includes(s.sm[0])))
 if(diff==="hard")others=others.filter(x=>Math.abs(songYear(x)-songYear(s))<=2)
 return{kind:"sample",prompt:"Which Geolier song is this?",clue:txt,choices:gshuf([s,...gtake(others,c.n-1)]).map(songChoice),answer:s.id,reveal:revealSong(s),T:c.T,base:c.base,timed:true}}
function genFill(diff){const c=GDEF.fill.diffs[diff];const pool=(diff==="easy"?songPool("easy"):D.songs).filter(s=>s.t.replace(/\(.*?\)/g,"").trim().split(/\s+/).length>=3)
 for(let t=0;t<40;t++){const s=gpick(pool),words=s.t.replace(/\(.*?\)/g,"").trim().split(/\s+/),idx=words.map((w,i)=>[w,i]).filter(([w])=>w.replace(/[^A-Za-z0-9']/g,"").length>=3)
  if(!idx.length)continue;const [w,i]=gpick(idx),clean=w.replace(/[^A-Za-z0-9'$]/g,"")
  const bank=[...new Set(D.songs.flatMap(x=>x.t.split(/\s+/)).map(x=>x.replace(/[^A-Za-z0-9'$]/g,"")).filter(x=>x.length>=3&&norm(x)!==norm(clean)))]
  const near=diff==="hard"?bank.filter(x=>Math.abs(x.length-clean.length)<=1):bank
  const shown=words.map((x,j)=>j===i?x.replace(clean,"_____"):x).join(" ")
  return{kind:"fill",prompt:`“${esc(shown)}”`,choices:gshuf([clean,...gtake(near.length>=3?near:bank,3)]).map(x=>({id:x,label:x})),answer:clean,reveal:revealSong(s),T:c.T,base:c.base,timed:true}}}
function genSpeed(diff){const q=TQ[gpick(TMIX[GDEF.speed.diffs[diff].mix])](diff==="easy"?"easy":diff);return Object.assign(q,{kind:"speed",base:1})}
const GEN={snippet:genSnippet,cover:genCover,trivia:genTrivia,odd:genOdd,survival:genSurvival,boards:genBoards,samples:genSample,fill:genFill,speed:genSpeed}
GDEF.napoli={name:"Parla Napulitano",tag:"Neapolitan words. What do they mean?",bg:()=>A.tep.art2,rounds:10,
 diffs:{easy:{label:"Easy",desc:"Everyday Neapolitan: family, heart, time.",lvl:1,base:100,T:15},hard:{label:"Hard",desc:"Street slang and old words. Cazzimma included.",lvl:2,base:200,T:12}}}
function genNapoli(diff){const c=GDEF.napoli.diffs[diff],pool=WORDS.filter(w=>diff==="hard"?w[3]===2:w[3]===1),w=gpick(pool)
 const wrong=gtake(WORDS.filter(x=>x[1]!==w[1]&&(diff==="hard"||x[3]===1)),3)
 return{kind:"napoli",prompt:`What does “${esc(w[0])}” mean?`,choices:gshuf([w,...wrong]).map(x=>({id:x[1],label:x[1]})),answer:w[1],reveal:`<div class="reveal" style="grid-template-columns:1fr"><div><b>${esc(w[0])}</b><small class="hint">English: ${esc(w[1])} · Italiano: ${esc(w[2])}</small></div></div>`,T:c.T,base:c.base,timed:true}}
GEN.napoli=genNapoli

/* hub */
function vPlay(){const dd=G.daily[today()]
 return `<div class="sec-h"><div><p class="eyebrow">Level ${level().l} · ${esc(level().name)}</p><h2>Play</h2><p>Every game saves your best score and earns XP toward your level.</p></div></div>
 <a class="card glow" href="#daily" style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;text-decoration:none;margin-bottom:14px">
  <div><p class="eyebrow">Daily Challenge · ${today()}</p><b style="font-family:var(--display);font-weight:900;font-size:30px;text-transform:uppercase;display:block;line-height:1;margin-top:4px">${dd?"Done today":"5 questions, once a day"}</b><small class="hint">${dd?`You scored ${dd.right}/5. Back tomorrow.`:"Same five for everyone, new set at midnight."} Streak: ${G.streak||0} day${G.streak===1?"":"s"}.</small></div>
  <span class="btn gold">${dd?"See result":"Play"}</span></a>
 <div class="qplay">${GORDER.map(id=>{const g=GDEF[id],b=G.best[id]||{},top=Math.max(0,...Object.values(b))
  return `<a class="gtile" href="#game-${id}" style="--bgimg:url('${g.bg()}')">${top?`<span class="best">Best ${top.toLocaleString()}</span>`:""}<b>${g.name}</b><small>${g.tag}</small></a>`}).join("")}</div>`}

/* difficulty screen */
function vGameStart(id){const g=GDEF[id];Game.stopAudio();const b=G.best[id]||{}
 const src=id==="snippet"?`<div class="filters" style="margin:14px 0 0"><label for="gsrc">Song pool</label><select id="gsrc"><option value="all">All of Geolier</option>${S.nb>=30?`<option value="mine">My top 60</option>`:""}${D.albums.map(a=>`<option value="${a.k}">${esc(a.t)}</option>`).join("")}</select></div>`:""
 return `<div class="gamehead"><a href="#play">← Games</a></div>
 <p class="eyebrow">${g.tag}</p><h1 class="title foil">${g.name}</h1>
 ${id==="snippet"?`<p class="hint">Clips are 30-second Apple Music previews, cut to the length of your level. Turn your sound on.</p>`:""}
 ${src}<div class="diffs" style="margin-top:16px">${Object.entries(g.diffs).map(([k,d])=>`<button class="diff" data-d="${k}"><b>${d.label}</b><small>${d.desc}</small><em>${b[k]?"Best "+b[k].toLocaleString():"Not played yet"}</em></button>`).join("")}</div>`}
function afterGameStart(id){$$("[data-d]").forEach(b=>b.onclick=()=>{const src=$("#gsrc")?$("#gsrc").value:"all";startGame(id,b.dataset.d,src)})}

function startGame(id,diff,src,seed){Player.stop();Game.live=true;if(location.hash!=="#run-"+id)location.hash="#run-"+id
 if(!seed)Game.vs=null
 Game.seed=seed||Math.random().toString(36).slice(2,8);RNG=seeded([id,diff,src||"all",Game.seed].join("|"))
 Object.assign(Game,{id,diff,src,i:0,score:0,right:0,marks:[],answered:false,qs:null})
 if(id==="hilo")return hiloStart()
 if(id==="timeline"){Game.n=GDEF.timeline.rounds;return tlRound()}
 Game.n=GDEF[id].rounds;Game.lives=id==="survival"?3:0;Game.deadline=id==="speed"?performance.now()+60000:0
 nextQ();if(id==="speed")speedClock()}
function speedClock(){cancelAnimationFrame(Game.sraf);const step=()=>{if(Game.id!=="speed"||!Game.live)return;const f=Math.max(0,(Game.deadline-performance.now())/60000);const b=$("#tbar");if(b)b.style.width=(f*100)+"%";const t=$("#sleft");if(t)t.textContent=Math.ceil(f*60)+"s";if(f<=0){endGame();return}Game.sraf=requestAnimationFrame(step)};Game.sraf=requestAnimationFrame(step)}
function nextQ(){Game.answered=false;Game.replays=0;Game.zoomouts=0;Game.played=false;Game.t0=performance.now()
 Game.q=Game.qs?Game.qs[Game.i]:GEN[Game.id](Game.diff,Game.src);renderQ()}
function gameHead(){const label=Game.id==="daily"?"Daily Challenge":GDEF[Game.id].name+" · "+GDEF[Game.id].diffs[Game.diff].label
 return `<div class="gamehead"><a href="${Game.id==="daily"?"#daily":"#game-"+Game.id}" id="quit">← Quit</a><span class="hint">${label}</span><span class="sc num">${Game.score.toLocaleString()} pts</span></div>`}
function renderQ(){const q=Game.q,v=$("#view")
 const rl=Game.id==="survival"?`Clip ${Game.i+1} · <span class="lives">${"♥".repeat(Math.max(0,Game.lives))}<s>${"♥".repeat(3-Math.max(0,Game.lives))}</s></span>`:Game.id==="speed"?`<span id="sleft">${Math.ceil(Math.max(0,Game.deadline-performance.now())/1000)}s</span> · ${Game.right} right`:`${Game.i+1} of ${Game.n}`
 v.innerHTML=gameHead()+`<div class="stage"><div class="round">${rl}</div>
 ${q.prompt?`<p class="qtext">${q.prompt}</p>`:q.kind==="snip"?`<p class="qtext">Name this song</p>`:""}${q.clue?`<p class="clue">${esc(q.clue)}</p>`:""}
 ${q.audio?`<button class="bigplay" id="snip" aria-label="Play clip">${ICON.play}</button><div class="eq" id="eq"><i></i><i></i><i></i><i></i><i></i></div><p class="hint" id="sniphint">${q.audio.clip}-second clip. Tap to play. Replays cost points.</p>`:""}
 ${q.img?`<div class="zoombox"><img id="zimg" src="${q.img}" alt="Cover close-up" style="transform:scale(${q.zoom});transform-origin:${q.ox}% ${q.oy}%;${q.gray?"filter:grayscale(1) contrast(1.1)":""}"></div><button class="btn small ghost" id="zout" style="margin-top:10px">Zoom out (costs 30%)</button>`:""}
 ${q.type?`<div class="typein"><input type="text" id="tin" placeholder="Type the song title" autocomplete="off" autocapitalize="off" aria-label="Song title"><button class="btn" id="giveup">Give up</button></div><ul class="sugg" id="sugg"></ul>`:`<div class="choices">${q.choices.map(c=>`<button class="choice" data-c="${esc(c.id)}">${c.img?`<img src="${c.img}" alt="">`:""}<span>${esc(c.label)}${c.sub?`<small>${esc(c.sub)}</small>`:""}</span></button>`).join("")}</div>`}
 ${q.T||Game.id==="speed"?`<div class="timer"><i id="tbar"></i></div>`:""}<div id="after"></div></div>`
 $("#quit").onclick=()=>Game.stopAudio()
 $$(".choice").forEach(b=>b.onclick=()=>answer(b.dataset.c))
 if(q.audio){$("#snip").onclick=playSnip;if(!Game.au){Game.au=new Audio();Game.au.preload="auto"}Game.au.src=q.audio.src;try{Game.au.load()}catch(e){}}
 if(q.img){$("#zout").onclick=()=>{if(Game.answered)return;Game.zoomouts++;const z=Math.max(1,q.zoom/Math.pow(1.9,Game.zoomouts));$("#zimg").style.transform=`scale(${z})`;if(z<=1.05)$("#zout").disabled=true}}
 if(q.type){const inp=$("#tin"),sg=$("#sugg");inp.oninput=()=>{const t=norm(inp.value);if(t.length<2){sg.innerHTML="";return}
   const hits=uniqT(D.songs.filter(s=>norm(s.t).includes(t))).slice(0,6);sg.innerHTML=hits.map(s=>`<li><button data-t="${s.id}">${esc(s.t)} <small>${esc(A[s.a].t)}</small></button></li>`).join("")
   $$("[data-t]",sg).forEach(b=>b.onclick=()=>answer(b.dataset.t))}
  inp.onkeydown=e=>{if(e.key==="Enter"){const t=norm(inp.value);const m=D.songs.find(s=>norm(s.t)===t);answer(m?m.id:"__")}}
  $("#giveup").onclick=()=>answer(null)}
 if(q.T&&!q.audio)startTimer()}
function startTimer(){const q=Game.q;Game.t0=performance.now();cancelAnimationFrame(Game.raf)
 const step=()=>{if(Game.answered)return;const f=Math.max(0,1-(performance.now()-Game.t0)/(q.T*1000));const b=$("#tbar");if(b)b.style.width=(f*100)+"%";if(f<=0){answer(null);return}Game.raf=requestAnimationFrame(step)};Game.raf=requestAnimationFrame(step)}
function playSnip(){const q=Game.q,a=Game.au;if(!a||Game.answered&&!q.audio)return;Player.stop()
 if(Game.played&&!Game.answered)Game.replays++
 clearTimeout(Game.snipT);a.muted=true
 const end=q.audio.off+q.audio.clip
 const stop=()=>{a.pause();$("#snip")&&$("#snip").classList.remove("playing");$("#eq")&&$("#eq").classList.remove("on")}
 const onTime=()=>{if(a.currentTime>=end){a.removeEventListener("timeupdate",onTime);stop()}}
 a.addEventListener("timeupdate",onTime)
 const p=a.play();$("#snip").classList.add("playing");$("#eq").classList.add("on")
 const seekGo=()=>{try{a.currentTime=q.audio.off}catch(e){}a.muted=false;Game.snipT=setTimeout(stop,q.audio.clip*1000+700)}
 if(p&&p.then)p.then(()=>{if(a.readyState>=1)seekGo();else a.addEventListener("loadedmetadata",seekGo,{once:true})}).catch(()=>{stop();toast("Couldn't play the clip. Check your connection and tap again.")})
 if(!Game.played){Game.played=true;if(q.T)startTimer()}
 const h=$("#sniphint");if(h&&Game.replays)h.textContent=`Replayed ${Game.replays}x. Max points down ${Math.min(60,Game.replays*20)}%.`}
function answer(cid){if(Game.answered)return;const q=Game.q;Game.answered=true;cancelAnimationFrame(Game.raf);clearTimeout(Game.snipT)
 let ok=cid!=null&&cid===q.answer
 if(!ok&&q.kind==="snip"&&cid&&SONG[cid])ok=norm(SONG[cid].t)===norm(q.song.t)
 const tf=q.T?Math.max(0,1-(performance.now()-Game.t0)/(q.T*1000)):1
 const pen=Math.max(0.4,1-0.2*(Game.replays||0)-0.3*(Game.zoomouts||0))
 const pts=ok?Math.round(q.base*pen*(0.6+0.4*(Game.played||!q.audio?tf:1))):0
 $$(".choice").forEach(b=>{b.disabled=true;if(b.dataset.c===q.answer)b.classList.add("right");else if(b.dataset.c===cid)b.classList.add("wrong")})
 if(Game.id==="speed"){if(ok){Game.score++;Game.right++;SFX.right()}else SFX.wrong();setTimeout(()=>{if(!Game.live)return;Game.i++;nextQ()},ok?260:700);return}
 Game.score+=pts;if(ok)Game.right++;Game.marks.push(ok?1:0);if(ok)SFX.right();else SFX.wrong()
 if(Game.id==="survival"&&!ok)Game.lives--
 if(Game.id==="daily")dailySave()
 if(q.img)$("#zimg").style.transform="scale(1)",$("#zimg").style.filter="none"
 if(q.type){$("#tin").disabled=true;$("#sugg").innerHTML="";$("#giveup").disabled=true}
 if(q.audio&&Game.au){const a=Game.au;a.pause()}
 const last=Game.id==="survival"?Game.lives<=0:Game.i+1>=Game.n
 $("#after").innerHTML=`<div class="verdict ${ok?"ok":"no"}">${ok?"+"+pts:cid==null?"Time":"Nope"}</div>${q.reveal}<button class="btn gold" id="nextq" style="margin-top:14px;width:100%">${last?"See results":"Next"}</button>`
 $(".sc").textContent=Game.score.toLocaleString()+" pts"
 $("#nextq").onclick=()=>{Player.stop();Game.i++;if(last)endGame();else nextQ()}
 $("#nextq").scrollIntoView({block:"nearest",behavior:"smooth"})}
function endGame(){Game.stopAudio();Game.live=false;const id=Game.id,diff=Game.diff
 if(id==="daily")return dailyEnd()
 cancelAnimationFrame(Game.sraf)
 const endless=!!GDEF[id].endless,metric=endless?Game.right:Game.score
 G.best[id]=G.best[id]||{};const prev=G.best[id][diff]||0,isBest=metric>prev;if(isBest)G.best[id][diff]=metric
 G.plays[id]=(G.plays[id]||0)+1
 if(id==="snippet"&&diff!=="easy"&&Game.right===Game.n)G.badges.ear=1
 if(id==="snippet"&&diff==="legend"&&Game.right>=7)G.badges.legend=1
 if(id==="cover"&&diff==="hard"&&Game.right===Game.n)G.badges.cover=1
 if(id==="trivia"&&diff==="hard"&&Game.right===Game.n)G.badges.trivia=1
 if(id==="boards"&&diff==="hard"&&Game.right>=8)G.badges.boards=1
 if(id==="napoli"&&diff==="hard"&&Game.right>=9)G.badges.parla=1
 gsave();const xp=id==="speed"?Game.right*15:id==="survival"?Game.right*20:Math.round(Game.score/10);addXP(xp)
 const perfect=!endless&&Game.right===Game.n;if(perfect||(isBest&&prev)){setTimeout(()=>{confetti(perfect?180:100);SFX.win()},200)}
 const big=endless?Game.right:Game.score.toLocaleString(),unit=id==="speed"?"right in 60 seconds":id==="survival"?"clips survived":`${Game.right} of ${Game.n} right`
 $("#view").innerHTML=`<div class="gamehead"><a href="#play">← Games</a></div><div class="stage endcard"><p class="eyebrow">${GDEF[id].name} · ${GDEF[id].diffs[diff].label}</p>
 <div class="big foil num">${big}</div><p class="hint">${unit}${isBest?" · new personal best":` · best ${prev.toLocaleString()}`} · +${xp} XP</p>
 ${endless?"":`<p style="font-size:22px;letter-spacing:4px;margin:10px 0">${Game.marks.map(m=>m?"🟨":"⬛").join("")}</p>`}
 ${vsLine(metric)}
 <div class="row" style="justify-content:center;margin-top:14px"><button class="btn gold" id="chal">Challenge a friend</button><button class="btn" id="again">Play again</button><a class="btn ghost" href="#game-${id}">Change level</a></div></div>`
 RNG=Math.random;$("#again").onclick=()=>startGame(id,diff,Game.src);$("#chal").onclick=shareChallenge}
function vsLine(mine){if(!Game.vs)return "";const t=Game.vs.sc,n=esc(Game.vs.n)
 return `<div class="verdict ${mine>t?"ok":mine===t?"":"no"}" style="font-size:24px">${mine>t?`You beat ${n}`:mine===t?`Tied with ${n}`:`${n} wins this one`}</div><p class="hint">${n}: ${t.toLocaleString()} · you: ${mine.toLocaleString()}</p>`}

/* Higher or Lower */
function hiloNext(a){const c=GDEF.hilo.diffs[Game.diff],pool=byStreams().slice(0,260);let b,t=0
 do{b=gpick(pool);t++;const r=Math.max(a.st,b.st)/Math.min(a.st,b.st);if(b.id===a.id||norm(b.t)===norm(a.t))continue;if(c.gap?r>=c.gap:r<1.35)break}while(t<200)
 return b}
function hiloStart(){const pool=byStreams().slice(0,260);Game.a=gpick(pool);Game.b=hiloNext(Game.a);Game.streak=0;Game.answered=false;hiloRender()}
function hiloRender(){const a=Game.a,b=Game.b,best=(G.best.hilo||{})[Game.diff]||0
 $("#view").innerHTML=`<div class="gamehead"><a href="#game-hilo">← Quit</a><span class="hint">Higher or Lower · ${GDEF.hilo.diffs[Game.diff].label}</span><span class="sc num">Streak ${Game.streak} · best ${best}</span></div>
 <div class="stage"><p class="qtext" style="margin:0 0 14px">Does the right one have more or fewer streams?</p><div class="hilo">
 <div class="side"><img src="${art(a)}" alt=""><b>${esc(a.t)}</b><small class="hint">${esc(A[a.a].t)}</small><div class="n foil num">${fmtS(a.st)}</div></div>
 <div class="side"><img src="${art(b)}" alt=""><b>${esc(b.t)}</b><small class="hint">${esc(A[b.a].t)}</small><div class="n num" id="bn">?</div></div></div>
 <div class="row" style="justify-content:center;margin-top:16px" id="hlbtn"><button class="btn gold" data-h="hi">▲ Higher</button><button class="btn" data-h="lo">▼ Lower</button></div><div id="after"></div></div>`
 $$("[data-h]").forEach(x=>x.onclick=()=>hiloAnswer(x.dataset.h))}
function hiloAnswer(h){if(Game.answered)return;Game.answered=true;const a=Game.a,b=Game.b,ok=(h==="hi")===(b.st>=a.st)
 const el=$("#bn"),t0=performance.now();const tick=()=>{const f=Math.min(1,(performance.now()-t0)/700);el.textContent=fmtS(Math.round(b.st*f));if(f<1)requestAnimationFrame(tick);else el.classList.add("foil")};tick()
 $("#hlbtn").hidden=true;if(ok)SFX.right();else SFX.wrong()
 setTimeout(()=>{if(ok){Game.streak++;Game.a=b;Game.b=hiloNext(b);Game.answered=false;hiloRender()}else hiloEnd()},ok?900:1100)}
function hiloEnd(){Game.live=false;const c=GDEF.hilo.diffs[Game.diff];G.best.hilo=G.best.hilo||{};const prev=G.best.hilo[Game.diff]||0,isBest=Game.streak>prev;if(isBest)G.best.hilo[Game.diff]=Game.streak
 G.plays.hilo=(G.plays.hilo||0)+1;gsave();const xp=Math.round(Game.streak*15*c.mult);addXP(xp)
 $("#after").innerHTML=`<div class="endcard" style="margin-top:14px"><div class="verdict no">Streak over</div><div class="big foil num">${Game.streak}</div><p class="hint">${isBest?"New best":"Best "+prev} · +${xp} XP</p>${vsLine(Game.streak)}<div class="row" style="justify-content:center;margin-top:12px"><button class="btn gold" id="chal">Challenge a friend</button><button class="btn" id="again">Play again</button><a class="btn ghost" href="#game-hilo">Change level</a></div></div>`
 RNG=Math.random;$("#again").onclick=()=>startGame("hilo",Game.diff);$("#chal").onclick=shareChallenge}

/* Timeline */
function tlItems(c){if(c.mode==="albums")return gtake(ALBS().filter(a=>a.type!=="EP"),c.n).map(a=>({id:a.k,t:a.t,sub:a.type,img:a.art,d:a.date,y:a.y}))
 const all=D.songs.map(s=>({id:s.id,t:s.t,sub:A[s.a].t,img:art(s),d:songDate(s),y:songYear(s)}))
 for(let t=0;t<200;t++){let set
  if(c.mode==="close"){const y=2019+Math.floor(RNG()*7);set=gtake(all.filter(x=>Math.abs(x.y-y)<=2),c.n*3)}else set=gtake(all,c.n*3)
  const out=[],dates=new Set();for(const x of set){if(!dates.has(x.d)){dates.add(x.d);out.push(x)}if(out.length===c.n)break}
  if(out.length===c.n)return out}
 return gtake(all,c.n)}
function tlRound(){const c=GDEF.timeline.diffs[Game.diff];Game.items=gshuf(tlItems(c));Game.answered=false
 $("#view").innerHTML=gameHead()+`<div class="stage"><div class="round">${Game.i+1} of ${Game.n}</div><p class="qtext">Oldest at the top</p><p class="hint">Drag by the handle to reorder, then lock it in.</p>
 <ol class="tl" id="tl">${Game.items.map(x=>`<li data-id="${x.id}"><span class="grip">⠿</span><img src="${x.img}" alt=""><div style="min-width:0"><b>${esc(x.t)}</b><small>${esc(x.sub)}</small></div><span class="yr"></span></li>`).join("")}</ol>
 <button class="btn gold" id="lock" style="margin-top:14px;width:100%">Lock it in</button><div id="after"></div></div>`
 if(window.Sortable)Sortable.create($("#tl"),{handle:".grip",animation:140})
 $("#lock").onclick=tlCheck}
function tlCheck(){if(Game.answered)return;Game.answered=true;const c=GDEF.timeline.diffs[Game.diff]
 const order=$$("#tl li").map(li=>li.dataset.id),truth=Game.items.slice().sort((x,y)=>x.d.localeCompare(y.d)).map(x=>x.id)
 let right=0;$$("#tl li").forEach((li,i)=>{const ok=order[i]===truth[i];if(ok)right++;li.classList.add(ok?"right":"wrong");const it=Game.items.find(x=>x.id===li.dataset.id);li.querySelector(".yr").textContent=it.d.slice(0,7).replace("-"," · ")})
 const pts=right*c.base+(right===order.length?c.base:0);Game.score+=pts;Game.right+=right===order.length?1:0;Game.marks.push(right===order.length?1:0)
 $("#lock").hidden=true;if(right===order.length)SFX.right();else SFX.wrong();const last=Game.i+1>=Game.n
 $("#after").innerHTML=`<div class="verdict ${right===order.length?"ok":"no"}">${right}/${order.length} in place · +${pts}</div><p class="hint">Correct order: ${truth.map(id=>esc(Game.items.find(x=>x.id===id).t)).join(" → ")}</p><button class="btn gold" id="nextq" style="margin-top:12px;width:100%">${last?"See results":"Next"}</button>`
 $(".sc").textContent=Game.score.toLocaleString()+" pts"
 $("#nextq").onclick=()=>{Game.i++;if(Game.i>=Game.n)endGame();else tlRound()}}

/* Daily Challenge: same five questions for everyone on a given day */
function dailyQs(date){RNG=seeded("geohub-"+date)
 const qs=[genTrivia("medium"),genSnippet("medium","all"),genCompare(),genOdd("medium"),genCover("medium")]
 RNG=Math.random;return qs}
function dailySave(){G.daily[today()]={score:Game.score,right:Game.right,marks:Game.marks.slice(),partial:true};gsave()}
function vDaily(){const d=today(),done=G.daily[d]
 if(done&&done.partial)return `<div class="gamehead"><a href="#play">← Games</a></div><p class="eyebrow">${d}</p><h1 class="title foil">Daily Challenge</h1><p class="hint">You've answered ${done.marks.length} of 5. Your answers are locked in, so pick up where you left off.</p><button class="btn gold" id="dresume" style="margin-top:18px">Resume</button>`
 if(done)return `<div class="gamehead"><a href="#play">← Games</a></div><div class="stage endcard"><p class="eyebrow">Daily Challenge · ${d}</p><div class="big foil num">${done.right}/5</div><p class="hint">${done.score.toLocaleString()} pts · streak ${G.streak} day${G.streak===1?"":"s"}</p><div class="share" id="sharetxt">${esc(shareText(d,done))}</div><div class="row" style="justify-content:center"><button class="btn gold" id="sharebtn">Share result</button><a class="btn" href="#play">More games</a></div><p class="hint" style="margin-top:12px">New set at midnight.</p></div>`
 return `<div class="gamehead"><a href="#play">← Games</a></div><p class="eyebrow">${d}</p><h1 class="title foil">Daily Challenge</h1><p class="hint">Five questions: trivia, a 4-second clip, a streams call, odd one out and a cover close-up. One try a day. Keep the streak alive.</p><button class="btn gold" id="dstart" style="margin-top:18px">Start</button>`}
function afterDaily(){const s=$("#dstart");if(s)s.onclick=()=>{Player.stop();Object.assign(Game,{id:"daily",diff:"medium",i:0,n:5,score:0,right:0,marks:[],qs:dailyQs(today()),live:true,vs:null});location.hash="#run-daily";nextQ()}
 const r=$("#dresume");if(r)r.onclick=()=>{const p=G.daily[today()];Player.stop();Object.assign(Game,{id:"daily",diff:"medium",i:p.marks.length,n:5,score:p.score,right:p.right,marks:p.marks.slice(),qs:dailyQs(today()),live:true,vs:null});location.hash="#run-daily";if(Game.i>=5)dailyEnd();else nextQ()}
 const b=$("#sharebtn");if(b)b.onclick=async()=>{const t=$("#sharetxt").textContent;try{if(navigator.share){await navigator.share({text:t});return}}catch(e){return}try{await navigator.clipboard.writeText(t);toast("Copied")}catch(e){toast("Select the text to copy it")}}}
function shareText(d,r){return `Geolier Hub Daily ${d}\n${r.marks.map(m=>m?"🟨":"⬛").join("")} ${r.right}/5\nStreak ${G.streak}\n${appURL()}#daily`}
function dailyEnd(){const d=today(),y=new Date(Date.now()-864e5),yd=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0")
 G.streak=G.lastDaily===yd?(G.streak||0)+1:1;G.lastDaily=d;G.daily[d]={score:Game.score,right:Game.right,marks:Game.marks};gsave()
 addXP(Math.round(Game.score/10)+100);if(Game.right===5)setTimeout(()=>{confetti(180);SFX.win()},300);location.replace("#daily")}
