/* The Circle: the people around the music, production credits, samples, and the song detail sheet.
   Bios stick to documented facts. Credit counts are computed from the catalogue's producer data. */
const CIRCLE=[
 {id:"geolier",name:"Geolier",tag:"Emanuele Palumbo · Secondigliano",group:"famiglia",
  bio:"Emanuele Palumbo, from Secondigliano on the northern edge of Naples, raps almost entirely in Neapolitan. Signed early to Luchè's label BFM Music, he finished second at Sanremo 2024 with I P’ ME, TU P’ TE, then sold out the Stadio Maradona three nights in a row in June 2024: 145,000 people, a first for any artist. Every album since Il coraggio dei bambini has debuted at #1 in Italy."},
 {id:"luche",name:"Luchè",tag:"Napoli · BFM Music",group:"famiglia",feat:"Luchè",
  bio:"The Neapolitan rap veteran whose label BFM Music, built around talent from Campania, signed Geolier early on. Together on RAP TUTORIAL (2021) and GIÀ LO SAI on Dio lo sa."},
 {id:"slf",name:"SLF",tag:"Crew · Napoli",group:"famiglia",feat:"Lele Blade",
  bio:"The Neapolitan crew of Lele Blade, Vale Lambo and MV Killa, with Yung Snapp producing. With Geolier on SARÒ CON TE (2024), built on a sample of Opus's Live Is Life, and on CLS from Dio lo sa."},
 {id:"datboidee",name:"Dat Boi Dee",tag:"Producer · from the start",group:"suono",prod:"Dat Boi Dee",
  bio:"Credited as producer on the debut Emanuele, then on Il coraggio dei bambini and Dio lo sa. Co-billed on early singles like Mexico and on the Red Bull 64 Bars freestyle Campioni in Italia."},
 {id:"poison",name:"Poison Beatz",tag:"Producer",group:"suono",prod:"Poison Beatz",
  bio:"Credited on Il coraggio dei bambini, Dio lo sa and Tutto è possibile, on SARÒ CON TE, and co-billed on Campioni in Italia."},
 {id:"michelangelo",name:"Michelangelo",tag:"Producer",group:"suono",prod:"Michelangelo",
  bio:"Michele Zocca. Credited as a producer on Il coraggio dei bambini and Dio lo sa."},
 {id:"takagi",name:"Takagi & Ketra",tag:"Producers · hitmakers",group:"suono",prod:"Takagi & Ketra",
  bio:"The Italian pop production duo behind CHIAGNE with Lazza (2022), credited on Dio lo sa, and the leads on EVERYDAY with Shiva, ANNA and Geolier (2023)."},
 {id:"snapp",name:"Yung Snapp",tag:"Producer · SLF",group:"suono",prod:"Yung Snapp",
  bio:"SLF's producer, credited on Dio lo sa and Tutto è possibile."},
 {id:"pino",name:"Pino Daniele",tag:"Napoli · legend",group:"napoli",feat:"Pino Daniele",
  bio:"The voice of Neapolitan blues, who died in 2015. The title track of Tutto è possibile is built on an unreleased recording of his, made possible with his son Alessandro, who heads the Pino Daniele Foundation."},
 {id:"nicola",name:"Nicola Siciliano",tag:"Napoli",group:"napoli",feat:"Nicola Siciliano",
  bio:"Neapolitan rapper on P Secondigliano (2018), one of Geolier's first singles, named after the neighbourhood."},
 {id:"lazza",name:"Lazza",tag:"Rap italiano",group:"feat",feat:"Lazza",
  bio:"The Milan rapper and his most frequent big-name partner here: from the Narcos remix on Emanuele to CHIAGNE, IDEE CHIARE and NON SEI PIÙ TU. Also credited as a producer on Tutto è possibile."},
 {id:"sfera",name:"Sfera Ebbasta",tag:"Rap italiano",group:"feat",feat:"Sfera Ebbasta",
  bio:"One song on each album from Il coraggio dei bambini on: X CASO, IO T’O GIUR’ and 2 GIORNI DI FILA."},
 {id:"ultimo",name:"Ultimo",tag:"Pop",group:"feat",feat:"Ultimo",
  bio:"The Roman singer-songwriter on L'ULTIMA POESIA (2024), Italian pop meeting Neapolitan rap."}]
const ALBUM_NOTES={em:"The debut. Street rap in full Neapolitan, produced around Dat Boi Dee. The Marchio registrato reissue added six songs, including a Narcos remix with Lazza.",cdb:"The breakthrough. Debuted at #1 with six songs in the singles Top 10. Atto II added six more, including CHIAGNE with Lazza.",dls:"Released by Warner Music Italy in June 2024. Debuted at #1, certified 8× Platinum. Atto II added ten songs, including TU ED IO with Rose Villain and CCHIU' FORT with Cosang.",tep:"Opens on a title track built from an unreleased Pino Daniele recording. Debuted at #1, certified 5× Platinum. Atto II added ten songs and went to #1 itself.",singles:"Geolier-led singles and freestyles that never landed on an album."}
const featSongs=name=>D.songs.filter(s=>(s.f||"").includes(name)||(name==="Lele Blade"&&/MV Killa|Vale Lambo|SLF/.test(s.f||"")))
const albumsWith=name=>D.albums.filter(a=>(a.aprod||[]).includes(name))
const MONO={geolier:"081",luche:"L",slf:"SLF",datboidee:"DBD",poison:"PB",michelangelo:"M",takagi:"T&K",snapp:"YS",pino:"PD",nicola:"NS",lazza:"LZ",sfera:"SE",ultimo:"U"}
const monoOf=p=>MONO[p.id]||p.name.slice(0,2)
const plural=(n,w)=>n+" "+w+(n===1?"":"s")
function prodCounts(list){const c={};list.forEach(s=>prods(s).forEach(p=>c[p]=(c[p]||0)+1));return Object.entries(c).sort((a,b)=>b[1]-a[1])}
const prodSongs=name=>D.songs.filter(s=>prods(s).includes(name))
const slug=n=>encodeURIComponent(n)
function prodLink(n){return `<a class="plink" href="#producer-${slug(n)}">${esc(n)}</a>`}

function vCircle(){const feats={};D.songs.forEach(s=>{if(!s.f)return;s.f.split(/, | & | e /).map(x=>x.trim()).filter(Boolean).forEach(x=>feats[x]=(feats[x]||0)+1)})
 const ft=Object.entries(feats).sort((a,b)=>b[1]-a[1]).slice(0,14)
 const card=p=>{const n=p.prod?prodSongs(p.prod).length:p.feat?featSongs(p.feat).length:0,al=p.prod?albumsWith(p.prod).length:0,read=G.read&&G.read[p.id]
  return `<a class="person${read?" read":""}" href="#person-${p.id}"><span class="mono">${esc(monoOf(p))}</span><div><b>${esc(p.name)}</b><small>${esc(p.tag)}${n?` · ${plural(n,"song")}`:al?` · ${plural(al,"album")}`:""}</small></div></a>`}
 const grp=(g,t)=>`<div class="sec-h"><div><h2>${t}</h2></div></div><div class="people">${CIRCLE.filter(p=>p.group===g).map(card).join("")}</div>`
 return chips(LIBCHIPS,"circle")+`<p class="eyebrow">'A famiglia</p><h1 class="title foil">The Circle</h1><p class="hint" style="max-width:60ch">The crew, the producers and the Neapolitan lineage behind the music.</p>
 ${grp("famiglia","La Famiglia")}${grp("suono","Il Suono")}${grp("napoli","Napoli")}${grp("feat","Collaborators")}
 <div class="sec-h"><div><h2>Most Featured</h2><p>Guests across the catalogue, by number of songs.</p></div></div>
 <div class="hbars">${ft.map(([n,c])=>`<div class="hb"><span>${esc(n)}</span><div class="track"><i style="width:${c/ft[0][1]*100}%"></i></div><em class="num">${c}</em></div>`).join("")}</div>
 <div class="sec-h"><div><h2>Producers by Album</h2><p>Album-level production credits.</p></div></div>
 <div class="lanes">${D.albums.filter(a=>(a.aprod||[]).length).map(a=>`<div class="lane"><div class="row"><img src="${a.art}" alt="" style="width:48px;height:48px;border-radius:6px"><h3 style="font-size:22px">${esc(a.t)}</h3></div><div class="pchips" style="margin-top:10px">${a.aprod.map(n=>`<a class="pchip" href="#producer-${slug(n)}">${esc(n)}</a>`).join("")}</div></div>`).join("")}</div>
 <p class="note">Credits from Wikipedia. Per-track producers are listed for Il coraggio dei bambini; the other albums list producers for the whole record.</p>`}
function vPerson(id){const p=CIRCLE.find(x=>x.id===id);if(!p)return vCircle()
 G.read=G.read||{};if(!G.read[id]){G.read[id]=1;gsave()}
 const songs=p.prod?prodSongs(p.prod):p.feat?featSongs(p.feat):[]
 return chips(LIBCHIPS,"circle")+`<a class="back" href="#circle">← The Circle</a><div class="card glow person-hero"><span class="mono big">${esc(monoOf(p))}</span><div><p class="eyebrow">${esc(p.tag)}</p><h1 class="title foil" style="font-size:clamp(34px,8vw,58px)">${esc(p.name)}</h1></div></div>
 <p class="lede-p">${esc(p.bio)}</p>${p.prod?producerBody(p.prod,songs):songs.length?producerBody(p.feat,songs,true):""}`}
function producerBody(name,songs,isFeat){const al=albumsWith(name)
 if(!songs.length)return al.length?`<div class="sec-h"><div><h2>Credited On</h2><p>Album-level producer credit.</p></div></div><div class="grid">${al.map(a=>`<a class="acard" href="#album-${a.k}"><div class="cov"><img src="${a.art}" alt=""></div><h3>${esc(a.t)}</h3><small>${a.y}</small></a>`).join("")}</div>`:`<p class="empty" style="margin-top:14px">No credits found.</p>`
const rated=songs.filter(s=>S.r[s.id]!=null),avg=rated.length?rated.reduce((t,s)=>t+S.r[s.id],0)/rated.length:null
 const L=S.nb?ladderIds(D.songs):[],pos={};L.forEach((id,i)=>pos[id]=i+1)
 const byAlb={};songs.forEach(s=>byAlb[s.a]=(byAlb[s.a]||0)+1),co=prodCounts(songs).filter(([n])=>n!==name).slice(0,6)
 const st=songs.reduce((t,s)=>t+(s.st||0),0),best=songs.filter(s=>pos[s.id]).sort((x,y)=>pos[x.id]-pos[y.id])[0]
 return `<div class="tiles" style="margin-top:18px"><div class="tile"><b class="num">${songs.length}</b><span>${isFeat?"songs together":"per-track credits"}${al.length?` · on ${plural(al.length,"album")}`:""}</span></div><div class="tile"><b class="num">${fmtS(st)}</b><span>Spotify streams on those songs</span></div><div class="tile"><b class="num">${avg!=null?avg.toFixed(2):"·"}</b><span>your average rating${rated.length?` (${rated.length} rated)`:""}</span></div><div class="tile"><b>${best?esc(best.t):"·"}</b><span>${best?"your highest-ranked, #"+pos[best.id]:"your favourite, once you rank"}</span></div></div>
 <div class="row" style="margin-top:14px"><button class="btn gold small" id="pq">▶ Play the songs</button>${co.length?`<span class="hint">Often with ${co.map(([n])=>prodLink(n)).join(", ")}</span>`:""}</div>
 <div class="sec-h"><div><h2>Credits</h2><p>Across ${Object.keys(byAlb).length} projects.</p></div></div><ol class="tracks">${songs.slice().sort((x,y)=>songDate(x).localeCompare(songDate(y))).map(songRow).join("")}</ol>`}
function vProducer(n){n=decodeURIComponent(n);const songs=prodSongs(n);const p=CIRCLE.find(x=>x.prod===n);if(p)return vPerson(p.id)
 return chips(LIBCHIPS,"circle")+`<a class="back" href="#circle">← The Circle</a><p class="eyebrow">Producer</p><h1 class="title foil">${esc(n)}</h1>${songs.length?producerBody(n,songs):`<p class="empty">No credits found for ${esc(n)}.</p>`}`}
function afterPerson(){const b=$("#pq");if(!b)return;const h=decodeURIComponent(location.hash.slice(1));const name=h.startsWith("producer-")?h.slice(9):(CIRCLE.find(p=>"person-"+p.id===h)||{}).prod
 const p=CIRCLE.find(x=>"person-"+x.id===h),list=p&&p.feat&&!p.prod?featSongs(p.feat):prodSongs(name||"")
 b.onclick=()=>Player.queue(list.sort((x,y)=>(y.st||0)-(x.st||0)).map(s=>s.id),p&&p.feat&&!p.prod?"With "+p.name:"Produced by "+name)}

/* song detail sheet */
function openSong(id){const s=SONG[id];if(!s)return;const L=S.nb?ladderIds(D.songs):[],r=L.indexOf(id)+1,byS=D.songs.filter(x=>x.st).sort((x,y)=>y.st-x.st),sr=byS.indexOf(s)+1
 const sh=$("#sheet");sh.innerHTML=`<div class="sheet-bg" data-close></div><div class="sheet-card" role="dialog" aria-label="${esc(s.t)}"><button class="sheet-x" data-close aria-label="Close">✕</button>
 <div class="sheet-top"><img src="${art(s)}" alt=""><div><p class="eyebrow">${esc(A[s.a].t)} · ${songYear(s)}</p><h2>${esc(s.t)}</h2>${s.f?`<p class="hint">feat. ${esc(s.f)}</p>`:""}<div class="row" style="margin-top:10px">${pvBtn(s)}<a class="btn small ghost" href="${songLink(s)}" target="_blank" rel="noopener">Spotify</a><a class="btn small ghost" href="#album-${s.a}" data-close>Album</a></div></div></div>
 <div class="sheet-stats"><div><b>${r?"#"+r:"·"}</b><span>your rank</span></div><div><b>${S.r[id]??"·"}</b><span>your rating</span></div><div><b>${s.st?fmtS(s.st):"·"}</b><span>${sr?"#"+sr+" most streamed":"streams"}</span></div><div><b>${fmt(s.ms)}</b><span>${isOne(s)?"Hot 100 #1":"length"}</span></div></div>
 <div class="trk sheet-rate" data-id="${s.id}">${pips(s.id)}</div>
 <h4 class="eyebrow" style="margin:16px 0 6px">Produced by</h4><p>${prods(s).length?prods(s).map(prodLink).join(" · "):(A[s.a].aprod||[]).length?`<span class="hint">Album producers: </span>${A[s.a].aprod.map(prodLink).join(" · ")}`:`<span class="hint">Not credited in the source.</span>`}</p>
 ${s.wr?`<h4 class="eyebrow" style="margin:16px 0 6px">Written by</h4><p class="hint" style="color:var(--fg)">${esc(s.wr)}</p>`:""}
 ${s.sm?`<h4 class="eyebrow" style="margin:16px 0 6px">Campionamenti</h4>${s.sm.map(t=>`<p class="hint" style="color:var(--fg)">${esc(t)}</p>`).join("")}`:""}
 <h4 class="eyebrow" style="margin:16px 0 6px">Lane</h4><p class="hint">${esc(D.lanes[s.l])}${s.x?" · "+esc(s.x):""}</p></div>`
 sh.hidden=false;requestAnimationFrame(()=>sh.classList.add("open"));Player.render()
 $$("[data-close]",sh).forEach(e=>e.addEventListener("click",()=>closeSong()))}
function closeSong(){const sh=$("#sheet");sh.classList.remove("open");setTimeout(()=>{sh.hidden=true;sh.innerHTML=""},220)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-song]");if(t&&!e.target.closest("button,a,input")){openSong(t.dataset.song)}})
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#sheet").hidden)closeSong()})
