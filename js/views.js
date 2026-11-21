/* Library, ranking and stats screens */
/* Geolier: chart history is told as milestones; Italian charts don't map to a Hot 100 style list */
const ONES=[],PEAKS=[],DEEP=[],EDIT={}
const MILESTONES=[
 ["2023-01","Il coraggio dei bambini debuts at #1","Six of its songs land in the Italian singles Top 10 the same week.","cdb"],
 ["2024-02","Second at Sanremo","I P’ ME, TU P’ TE finishes second at the 2024 Festival.","dls"],
 ["2024-06","Three nights at the Maradona","21 to 23 June: three sold-out shows, 145,000 people, the first artist to sell out the stadium three nights in a row.","dls"],
 ["2024-06","Dio lo sa debuts at #1","Released by Warner Music Italy, later certified 8× Platinum.","dls"],
 ["2026-01","Tutto è possibile debuts at #1","Ten of its songs in the singles Top 10. The title track is built on an unreleased Pino Daniele recording. Certified 5× Platinum.","tep"],
 ["2026-06","Back at the Maradona","Three more sold-out nights, 26 to 28 June, broadcast worldwide on Prime Video.","tep"],
 ["2026-10","Atto II goes to #1","Tutto è possibile, Atto II debuts at #1, and the album retakes the top spot 38 weeks after release.","tep"]]
const LANE_DESC={solo:"Just Geolier. Most of the catalogue.",napoli:"With the city: Luchè, SLF, Cosang, Lele Blade and Pino Daniele.",rap:"Italian rap's biggest names: Lazza, Sfera Ebbasta, Guè, Marracash, Shiva.",pop:"Crossovers with Ultimo, Giorgia, Achille Lauro and Rose Villain.",world:"Beyond Italy: Anuel AA, Maria Becerra, 50 Cent."}
const isOne=s=>false

function chips(list,curr){return `<nav class="chips">${list.map(([h,t])=>`<a href="#${h}"${h===curr?" aria-current":""}>${t}</a>`).join("")}</nav>`}
const LIBCHIPS=[["albums","Albums"],["circle","The Circle"],["songs","All Songs"],["lanes","Lanes"],["charts","Charts"]]
const RANKCHIPS=[["rank","Head to Head"],["ranked","Rankings"]]

function pips(id){const v=S.r[id];let h=`<div class="pips" role="group" aria-label="Rate 1 to 10">`
 for(let i=1;i<=10;i++)h+=`<button class="pip${v!=null&&i<=v?" on":""}" data-id="${id}" data-v="${i}" style="--rc:${v?rc(v):""}" aria-label="${i} out of 10" aria-pressed="${v===i}">${i}</button>`
 return h+`</div>`}
function meta(s,showAlbum){const bits=[`<span class="sn">${s.st!=null?fmtS(s.st):"·"}</span>`];if(showAlbum)bits.push(esc(A[s.a].t));if(s.y)bits.push(s.y);if(s.f)bits.push("feat. "+esc(s.f));if(prods(s).length)bits.push("prod. "+esc(prodLine(s)));else bits.push(esc(D.lanes[s.l]))
 return bits.join(" · ")+(isOne(s)?`<span class="chip one">Hot 100 #1</span>`:"")+(s.x?`<span class="chip">${esc(s.x)}</span>`:"")}
function trackRow(s,pos,ranked){return `<li class="trk${ranked?" ranked":""}" data-id="${s.id}">${ranked?`<span class="grip" aria-label="Drag to reorder">⠿</span>`:`<span></span>`}<span class="no">${pos}</span><div class="tt" data-song="${s.id}"><b>${esc(s.t)}</b><small>${meta(s)}</small></div><span class="dur">${fmt(s.ms)}</span>${pips(s.id)}${pvBtn(s)}</li>`}
function songRow(s){return `<li class="trk srow" data-id="${s.id}"><img src="${art(s)}" alt="" loading="lazy" data-song="${s.id}"><div class="tt" data-song="${s.id}"><b>${esc(s.t)}</b><small>${meta(s,true)}</small></div><span class="score num">${S.r[s.id]??"·"}</span>${pips(s.id)}${pvBtn(s)}</li>`}

/* albums */
let albumMode=localGet("albumMode","grid"),trackMode="album"
function vAlbums(){
 let h=chips(LIBCHIPS,"albums")+`<div class="sec-h"><div><p class="eyebrow">${D.albums.length} projects · ${D.songs.length} songs · ${hrs(D.albums.reduce((a,b)=>a+b.ms,0))}</p><h2>The Discography</h2></div>
 <div class="seg" role="group" aria-label="Album view"><button data-am="grid" aria-pressed="${albumMode==="grid"}">Covers</button><button data-am="rank" aria-pressed="${albumMode==="rank"}">Rank albums</button></div></div>`
 if(albumMode==="grid"){
  h+=`<div class="grid">`+D.albums.map(a=>{const st=albumStats(a.k);const g=S.g[a.k],ag=autoGrade(st.avg)
   return `<a class="acard" href="#album-${a.k}" style="--c:${a.c}"><div class="cov">${cover(a.k)}${g?`<span class="badge">${g}</span>`:ag?`<span class="badge auto">${ag}</span>`:""}</div>
   <span class="eyebrow">${a.y} · ${a.type}</span><h3>${esc(a.t)}</h3><div class="prog"><i style="width:${st.rated/st.n*100}%"></i></div><small class="num">${st.rated}/${st.n} rated${st.avg!=null?" · avg "+st.avg.toFixed(1):""}</small></a>`}).join("")+`</div>`
 }else{
  const o=albumOrder()||D.albums.map(a=>a.k)
  h+=`<div class="toolbar" style="margin-top:0"><p class="hint">${S.ao.length?"Your order. Drag to change it.":"Release order for now. Drag albums into your ranking."}</p><div class="row"><button class="btn small" id="ao-auto">By my ratings</button><button class="btn small" id="ao-grade">By my grades</button></div></div>
  <ol class="alist" id="alist">`+o.map((k,i)=>{const a=A[k],st=albumStats(k),g=S.g[k]
   return `<li class="arow" data-k="${k}"><span class="grip" aria-label="Drag to reorder">⠿</span><span class="pos">${i+1}</span><img src="${a.art}" alt=""><div><b>${esc(a.t)}</b><small>${a.y} · ${st.rated}/${st.n} rated${st.avg!=null?" · avg "+st.avg.toFixed(2):""}</small></div><span class="badge${g?"":" auto"}" style="position:static">${g||autoGrade(st.avg)||"?"}</span></li>`}).join("")+`</ol>`}
 return h}
function afterAlbums(){
 $$("[data-am]").forEach(b=>b.onclick=()=>{albumMode=b.dataset.am;localSet("albumMode",albumMode);route()})
 const l=$("#alist");if(l&&window.Sortable)Sortable.create(l,{handle:".grip",animation:160,onEnd(){S.ao=[...l.children].map(li=>li.dataset.k);persist();[...l.children].forEach((li,i)=>li.querySelector(".pos").textContent=i+1);toast("Album ranking saved")}})
 const au=$("#ao-auto");if(au)au.onclick=()=>{S.ao=D.albums.map(a=>a.k).sort((x,y)=>(albumStats(y).avg??-1)-(albumStats(x).avg??-1));persist();route();toast("Ordered by your average song rating")}
 const ag=$("#ao-grade");if(ag)ag.onclick=()=>{const gi=k=>{const g=S.g[k];return g?GRADES.indexOf(g):99};S.ao=D.albums.map(a=>a.k).sort((x,y)=>gi(x)-gi(y));persist();route();toast("Ordered by your grades")}}
function vAlbum(k){const a=A[k];if(!a)return vAlbums()
 const st=albumStats(k),g=S.g[k],ag=autoGrade(st.avg),idx=D.albums.indexOf(a),prev=D.albums[idx-1],next=D.albums[idx+1],ranked=trackMode==="rank"
 const list=ranked?trackOrder(k).map(id=>SONG[id]):trackMode==="std"?BYA[k].filter(s=>!s.x):BYA[k],ones=0
 return chips(LIBCHIPS,"albums")+`<section class="ahero" style="--c:${a.c}"><div class="cov">${cover(k)}</div>
 <div><p class="eyebrow">${a.y} · ${a.type} · ${esc(a.by)}</p><h1>${esc(a.t)}</h1>
 <dl class="facts"><div><dt>FIMI peak</dt><dd>${a.peak?"#"+a.peak:"n/a"}</dd></div><div><dt>Certified</dt><dd>${a.cert||"n/a"}</dd></div><div><dt>Tracks</dt><dd class="num">${a.nstd?a.nstd+" + "+(a.n-a.nstd):a.n}</dd></div><div><dt>Runtime</dt><dd>${hrs(a.ms)}</dd></div><div><dt>Spotify</dt><dd>${fmtS(BYA[k].reduce((t,s)=>t+(s.st||0),0))}</dd></div></dl>
 ${a.art2?`<div class="dlx"><img src="${a.art2}" alt="${esc(a.t)} ${esc(a.dname)} cover"><div><p class="eyebrow">Deluxe · ${a.ddate}</p><b>${esc(a.t)}: ${esc(a.dname)}</b><small class="hint">${a.n-a.nstd} extra songs, all included and tagged ${esc(a.dname)}.</small></div></div>`:""}
 <p class="eyebrow">Your grade</p><div class="gp" role="group" aria-label="Album grade">${GRADES.map(x=>`<button data-g="${x}" aria-pressed="${g===x}">${x}</button>`).join("")}</div>
 <p class="hint num" id="ahint">${st.rated}/${st.n} songs rated${st.avg!=null?` · your average <b>${st.avg.toFixed(2)}</b> suggests <b>${ag}</b>`:" · rate songs to get a suggested grade"}</p>
 ${a.note?`<p class="hint" style="margin-top:6px">${esc(a.note)}</p>`:""}
 <div class="row" style="margin-top:12px"><button class="btn small gold" id="play-album">${ICON.play.replace("<svg","<svg width=14 height=14 style=fill:currentColor")} Preview album</button>${SP.ok()?`<button class="btn small" id="sp-album">Save my order to Spotify</button>`:""}<a class="btn small ghost" href="${spot(a.t+" Geolier")}" target="_blank" rel="noopener">Open in Spotify</a></div></div></section>
 <div class="toolbar"><div class="seg" role="group" aria-label="Track order"><button data-tm="album" aria-pressed="${trackMode==="album"}">Deluxe</button>${a.nstd?`<button data-tm="std" aria-pressed="${trackMode==="std"}">Standard</button>`:""}<button data-tm="rank" aria-pressed="${ranked}">My ranking</button></div>
 ${ranked?`<button class="btn small" id="to-auto">Sort by my ratings</button>`:`<span class="hint">Tap 1 to 10 to rate. Tap again to clear.</span>`}</div>
 <ol class="tracks" id="tlist">${list.map((s,i)=>trackRow(s,ranked||trackMode==="std"?i+1:s.n,ranked)).join("")}</ol>
 ${albumInsight(k)}
 <nav class="pager">${prev?`<a href="#album-${prev.k}">← ${esc(prev.t)}</a>`:"<span></span>"}${next?`<a href="#album-${next.k}">${esc(next.t)} →</a>`:"<span></span>"}</nav>`}
function albumInsight(k){const a=A[k],L=BYA[k],pc=prodCounts(L),sm=L.filter(s=>s.sm),wr=L.filter(s=>s.wr).length
 return `<div class="sec-h"><div><p class="eyebrow">Produzione</p><h2>Behind the Boards</h2><p>${esc(ALBUM_NOTES[k]||"")}</p></div></div>
 ${pc.length?`<p class="eyebrow" style="margin-bottom:8px">Per-track credits</p><div class="pchips">${pc.slice(0,14).map(([n,c])=>`<a class="pchip" href="#producer-${slug(n)}">${esc(n)} <i>${c}</i></a>`).join("")}</div>`:""}
 ${(a.aprod||[]).length?`<p class="eyebrow" style="margin:14px 0 8px">Album producers</p><div class="pchips">${a.aprod.map(n=>`<a class="pchip" href="#producer-${slug(n)}">${esc(n)}</a>`).join("")}</div>`:(pc.length?"":`<p class="hint">No producer credits listed for this release.</p>`)}
 ${wr?`<p class="hint" style="margin-top:12px">Writing credits for ${wr} of ${L.length} songs. Tap a song to see who wrote it.</p>`:""}
 ${sm.length?`<div class="sec-h"><div><h2>Campionamenti</h2><p>Samples credited on this record.</p></div></div><div class="samples">${sm.map(s=>`<div class="sample" data-song="${s.id}"><b>${esc(s.t)}</b><p>${esc(s.sm[0])}</p></div>`).join("")}</div>`:""}`}
function afterAlbum(k){
 $$("[data-g]").forEach(b=>b.onclick=()=>{if(S.g[k]===b.dataset.g)delete S.g[k];else S.g[k]=b.dataset.g;persist();$$("[data-g]").forEach(x=>x.setAttribute("aria-pressed",S.g[k]===x.dataset.g));toast(S.g[k]?A[k].t+": "+S.g[k]:"Grade cleared")})
 $$("[data-tm]").forEach(b=>b.onclick=()=>{trackMode=b.dataset.tm;route(true)})
 const l=$("#tlist")
 if(trackMode==="rank"&&window.Sortable)Sortable.create(l,{handle:".grip",animation:160,onEnd(){S.to[k]=[...l.children].map(li=>li.dataset.id);persist();[...l.children].forEach((li,i)=>li.querySelector(".no").textContent=i+1);toast("Track ranking saved")}})
 const au=$("#to-auto");if(au)au.onclick=()=>{S.to[k]=BYA[k].slice().sort((x,y)=>songScore(y)-songScore(x)).map(s=>s.id);persist();route(true);toast("Sorted by ratings, head-to-heads break ties")}
 $("#play-album").onclick=()=>Player.queue(trackMode==="rank"?trackOrder(k):BYA[k].map(s=>s.id),A[k].t)
 const sp=$("#sp-album");if(sp)sp.onclick=()=>SP.makePlaylist(trackOrder(k).map(id=>SONG[id]),`${A[k].t}, my order`,`My ranking of ${A[k].t}, made in Geolier Hub.`)}

/* head to head */
function fighter(s,i){return `<button class="fighter" data-side="${i}"><img src="${art(s)}" alt=""><div><b>${esc(s.t)}</b><br><small>${esc(A[s.a].t)} · ${songYear(s)}${s.f?" · feat. "+esc(s.f):""}</small><br><small class="num">${strm(s)}</small>${prods(s).length?`<br><small>prod. ${esc(prodLine(s))}</small>`:""}<br><small class="num">${S.r[s.id]!=null?"Your rating "+S.r[s.id]+" · ":""}${S.b[s.id]?"#"+RANK[s.id]+" · "+S.b[s.id]+" battles":"New, not ranked yet"}</small></div></button>`}
function vRank(){if(!duel)newDuel()
 const opts=[["all","Finalize the whole list ("+D.songs.length+")"],["top:10","Finalize my top 10"],["top:25","Finalize my top 25"],["top:50","Finalize my top 50"],["top:100","Finalize my top 100"],["rated","Only songs I've rated"]].concat(D.albums.map(a=>["a:"+a.k,a.t]),Object.entries(D.lanes).map(([k,v])=>["l:"+k,"Lane: "+v]))
 const P=progress()
 return chips(RANKCHIPS,"rank")+`<section class="fin">
  <div class="finhead"><div><p class="eyebrow">List finalized</p><b class="num foil">${P.pct.toFixed(1)}%</b></div><p class="hint num">${P.ok} of ${P.links} links locked${P.open?"":" · your ranking is final"}</p></div>
  <div class="prog big"><i style="width:${P.pct}%"></i></div>
  <div class="finstats"><div><b class="num">${P.open?"~"+P.est.toLocaleString():"0"}</b><span>battles left</span></div><div><b class="num">${P.open?dur(P.secs):"Done"}</b><span>at ${P.pace.toFixed(1)} sec a pick${P.measured?"":" (assumed)"}</span></div><div><b class="num">${S.nb.toLocaleString()}</b><span>battles fought</span></div><div><b class="num">${P.pairs.toLocaleString()}</b><span>matchups logged</span></div></div></section>
 ${job&&cur&&cur.t==="job"?`<p class="hint" style="margin:14px 0 8px">Placing <b>${esc(SONG[job.b].t)}</b>. Finding its exact spot.</p>`:`<div style="height:14px"></div>`}
 ${duel?`<div class="duel">${fighter(duel[0],0)}<div class="vs">VS</div>${fighter(duel[1],1)}</div>`:`<p class="empty">${scope==="all"?"Your list is final. Every song has beaten the one below it.":"This pool is settled. Pick another one."}</p>`}
 <div class="duelctl"><select id="scope" aria-label="Battle pool">${opts.map(([v,t])=>`<option value="${v}"${v===scope?" selected":""}>${esc(t)}</option>`).join("")}</select>
 <button class="btn small" id="draw">Too close</button><button class="btn small" id="skip">Skip</button>${duel?`<button class="btn small ghost" id="hear0">♪ Left</button><button class="btn small ghost" id="hear1">♪ Right</button>`:""}</div>
 <div class="sec-h"><div><h2>Your Full Ranking</h2><p class="num">All ${D.songs.length} songs by head-to-head result. ✓ means a song has beaten the one below it.</p></div>${S.nb?`<button class="btn small ghost" id="reset-elo">Reset head-to-heads</button>`:""}</div>
 <div class="filters"><input type="search" id="bq" placeholder="Find a song in your ranking" aria-label="Find a song in your ranking"><label><input type="checkbox" id="bf"> Battled only</label></div>
 <ol class="board" id="board"></ol>`}
function fillBoard(){const el=$("#board");if(!el)return
 const q=norm(($("#bq")||{}).value||""),only=($("#bf")||{}).checked,all=eloRanking()
 el.innerHTML=all.map((s,i)=>[s,i]).filter(([s])=>(!q||norm(s.t+A[s.a].t).includes(q))&&(!only||S.b[s.id])).map(([s,i])=>`<li><span class="p">${i+1}</span><img src="${art(s)}" alt="" loading="lazy"><div style="min-width:0"><b>${esc(s.t)}</b><small>${esc(A[s.a].t)} · ${s.st!=null?fmtS(s.st):"n/a"}${S.b[s.id]?" · "+S.b[s.id]+" battles":" · new"}</small></div><span class="v num">${i<all.length-1&&linkState(s.id,all[i+1].id)==="ok"?'<span class="lock">✓</span>':""}</span></li>`).join("")}
function battle(w){if(!duel||!cur)return
 const win=w===2?"t":duel[w].id,x=cur.x,y=cur.y
 rec(x,y,win);S.b[x]=(S.b[x]||0)+1;S.b[y]=(S.b[y]||0)+1;S.nb++;S.bt=(S.bt||[]).concat(Date.now()).slice(-60)
 if(cur.t==="link"&&win===y)startJob(cur.L,cur.j)
 persist();if(S.nb%25===0)renderChrome()
 const cards=$$(".fighter");if(w<2&&cards[w])cards[w].classList.add("win")
 setTimeout(()=>{newDuel();route(true)},w<2?200:0)}
function skipDuel(){if(cur){if(cur.t==="job")job=null;skipped.add(pk(cur.x,cur.y))}newDuel();route(true)}
function afterRank(){fillBoard();$("#bq").oninput=fillBoard;$("#bf").onchange=fillBoard
 $$(".fighter").forEach(f=>f.onclick=()=>battle(+f.dataset.side))
 $("#draw").onclick=()=>battle(2);$("#skip").onclick=skipDuel
 if(duel){$("#hear0").onclick=()=>Player.toggle(duel[0].id);$("#hear1").onclick=()=>Player.toggle(duel[1].id)}
 $("#scope").onchange=e=>{scope=e.target.value;localSet("scope",scope);newDuel();route(true)}
 const r=$("#reset-elo");if(r)r.onclick=()=>{if(r.dataset.armed){S.e={};S.b={};S.nb=0;S.p={};S.tr=null;S.bt=[];job=null;persist();route(true);toast("Head-to-heads reset")}else{r.dataset.armed=1;r.textContent="Tap again to confirm"}}}

/* rankings */
let incEP=localGet("incEP","0")==="1",rq=""
function albumRanks(){const L=ladderIds(D.songs),pos={};L.forEach((id,i)=>pos[id]=i+1)
 return D.albums.filter(a=>incEP||!["EP","Singles"].includes(a.type)).map(a=>{const ps=BYA[a.k].map(s=>({s,p:pos[s.id]})).sort((x,y)=>x.p-y.p)
  const v=ps.map(x=>x.p),avg=v.reduce((x,y)=>x+y,0)/v.length,med=v.length%2?v[v.length>>1]:(v[v.length/2-1]+v[v.length/2])/2
  return{a,ps,avg,med,top50:v.filter(x=>x<=50).length}}).sort((x,y)=>x.avg-y.avg||x.med-y.med)}
function vRanked(){const P=progress(),R=albumRanks(),n=D.songs.length
 return chips(RANKCHIPS,"ranked")+`<div class="sec-h"><div><h2>Album Ranking</h2><p>Each album's score is the average position of its songs in your ranking of ${n}. Lower is better. ${P.open?`Your list is ${P.pct.toFixed(1)}% final, so this is provisional.`:"Your list is final, so this is too."}</p></div>
 <div class="row"><label class="hint" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="incep"${incEP?" checked":""}> EPs and singles</label><button class="btn small" id="use-ao">Use as my album ranking</button><button class="btn small" id="rk-card">Share top 10</button><button class="btn small" id="rk-cmp">Compare with a friend</button>${SP.ok()?`<button class="btn small gold" id="sp-top">Top 50 to Spotify</button>`:""}</div></div>
 <ol class="arank">${R.map((r,i)=>`<li><div class="arh"><span class="pos">${i+1}</span><a href="#album-${r.a.k}"><img src="${r.a.art}" alt=""></a><div style="min-width:0"><b>${esc(r.a.t)}</b><small class="num">${r.a.y} · ${r.top50} in your top 50 · best #${r.ps[0].p} · worst #${r.ps[r.ps.length-1].p}</small></div><div class="avg num"><b class="foil">${r.avg.toFixed(1)}</b><small>avg position</small></div></div>
  <ol class="aps">${r.ps.map(x=>`<li><span class="num">#${x.p}</span>${esc(x.s.t)} <i>${fmtS(x.s.st)}</i></li>`).join("")}</ol></li>`).join("")}</ol>
 <div class="sec-h"><div><h2>Edit My Full Ranking</h2><p>Drag a song by its handle, or type a new number. A manual move counts as your call, and Head to Head works around it.</p></div></div>
 <div class="filters"><input type="search" id="rq" placeholder="Find a song" value="${esc(rq)}" aria-label="Find a song"><span class="hint" id="rqh"></span></div>
 <ol class="mylist" id="mylist"></ol>`}
function fillMy(){const el=$("#mylist");if(!el)return;const L=ladderIds(D.songs),q=norm(rq)
 $("#rqh").textContent=q?"Dragging is off while searching. Type a number to move.":""
 el.innerHTML=L.map((id,i)=>[SONG[id],i]).filter(([s])=>!q||norm(s.t+A[s.a].t).includes(q)).map(([s,i])=>`<li data-id="${s.id}"><span class="grip"${q?" hidden":""} aria-label="Drag to reorder">⠿</span><input class="posin num" type="number" inputmode="numeric" min="1" max="${L.length}" value="${i+1}" aria-label="Position of ${esc(s.t)}"><img src="${art(s)}" alt="" loading="lazy"><div style="min-width:0"><b>${esc(s.t)}</b><small>${esc(A[s.a].t)} · ${s.st!=null?fmtS(s.st):"n/a"}${i<L.length-1&&linkState(s.id,L[i+1])==="ok"?' · <span class="lock">✓ locked</span>':""}</small></div></li>`).join("")
 if(!q&&window.Sortable){if(el._s)el._s.destroy();el._s=Sortable.create(el,{handle:".grip",animation:120,onEnd(ev){if(ev.oldIndex===ev.newIndex)return;moveSong(ev.item.dataset.id,ev.newIndex+1);toast("Moved to #"+(ev.newIndex+1));route(true)}})}}
function afterRanked(){fillMy()
 $("#rq").oninput=e=>{rq=e.target.value;fillMy()}
 $("#mylist").addEventListener("change",e=>{const inp=e.target.closest(".posin");if(!inp)return;const id=inp.closest("li").dataset.id,p=Math.round(+inp.value);if(!p)return;moveSong(id,p);toast(SONG[id].t+" moved to #"+Math.max(1,Math.min(D.songs.length,p)));route(true)})
 $("#incep").onchange=e=>{incEP=e.target.checked;localSet("incEP",incEP?"1":"0");route(true)}
 $("#use-ao").onclick=()=>{const R=albumRanks().map(r=>r.a.k);S.ao=R.concat(D.albums.map(a=>a.k).filter(k=>!R.includes(k)));persist();toast("Album ranking updated from your songs")}
 $("#rk-card").onclick=topCard;$("#rk-cmp").onclick=shareCompare
 const sp=$("#sp-top");if(sp)sp.onclick=()=>SP.makePlaylist(myTop(50),"My Geolier Top 50","My top 50 Geolier songs, ranked head to head in Geolier Hub.")}

/* all songs */
let fq="",fa="",fl="",fs="score",fr=false
function vSongs(){return chips(LIBCHIPS,"songs")+`<div class="sec-h"><div><h2>All Songs</h2><p>Every track, deluxe editions included, rateable, with a 30-second preview on each.</p></div></div>
 <div class="filters"><input type="search" id="fq" placeholder="Search songs or features" value="${esc(fq)}" aria-label="Search">
 <select id="fa" aria-label="Album"><option value="">All albums</option>${D.albums.map(a=>`<option value="${a.k}"${fa===a.k?" selected":""}>${esc(a.t)}</option>`).join("")}</select>
 <select id="fl" aria-label="Lane"><option value="">All lanes</option>${Object.entries(D.lanes).map(([k,v])=>`<option value="${k}"${fl===k?" selected":""}>${esc(v)}</option>`).join("")}</select>
 <select id="fs" aria-label="Sort">${[["score","My rating"],["elo","My ranking"],["rel","Release order"],["st","Most streamed"],["az","A to Z"],["len","Longest first"]].map(([v,t])=>`<option value="${v}"${fs===v?" selected":""}>${t}</option>`).join("")}</select>
 <label><input type="checkbox" id="fr"${fr?" checked":""}> Unrated only</label></div>
 <p class="hint num" id="fcount"></p><ol class="tracks" id="slist"></ol>`}
function fillSongs(){const q=norm(fq);let ss=D.songs.filter(s=>(!fa||s.a===fa)&&(!fl||s.l===fl)&&(!fr||S.r[s.id]==null)&&(!q||norm(s.t+s.f).includes(q)))
 const ord=s=>D.songs.indexOf(s)
 if(fs==="score")ss.sort((x,y)=>songScore(y)-songScore(x)||ord(x)-ord(y))
 else if(fs==="elo")ss.sort((x,y)=>elo(y.id)-elo(x.id)||ord(x)-ord(y))
 else if(fs==="az")ss.sort((x,y)=>x.t.localeCompare(y.t))
 else if(fs==="len")ss.sort((x,y)=>y.ms-x.ms)
 else if(fs==="st")ss.sort((x,y)=>(y.st||0)-(x.st||0))
 $("#fcount").textContent=ss.length+" songs";$("#slist").innerHTML=ss.map(songRow).join("")}
function afterSongs(){fillSongs();$("#fq").oninput=e=>{fq=e.target.value;fillSongs()};$("#fa").onchange=e=>{fa=e.target.value;fillSongs()};$("#fl").onchange=e=>{fl=e.target.value;fillSongs()};$("#fs").onchange=e=>{fs=e.target.value;fillSongs()};$("#fr").onchange=e=>{fr=e.target.checked;fillSongs()}}

/* lanes */
const laneItem=(s,x)=>`<li><img src="${art(s)}" alt=""><span>${esc(s.t)}</span><i>${x}</i></li>`
function vLanes(){return chips(LIBCHIPS,"lanes")+`<div class="sec-h"><div><h2>Top 10 by Lane</h2><p>Every song sits in one lane, by who it was made with. The public's top 10 on the left, yours on the right.</p></div></div><div class="lanes">`+Object.entries(D.lanes).map(([k,v])=>{
 const ed=(EDIT[k]||[]).length?EDIT[k].map(t=>find(t)).filter(Boolean):D.songs.filter(s=>s.l===k&&s.st).sort((x,y)=>y.st-x.st).slice(0,10),mine=D.songs.filter(s=>s.l===k&&(S.r[s.id]!=null||S.b[s.id])).sort((x,y)=>songScore(y)-songScore(x)).slice(0,10)
 return `<section class="lane"><h3>${esc(v)}</h3><p>${LANE_DESC[k]} <span class="num">${D.songs.filter(s=>s.l===k).length} songs.</span></p><div class="lcols"><div><h4>Most streamed</h4><ol>${ed.map(s=>laneItem(s,songYear(s))).join("")}</ol></div>
 <div><h4>Yours</h4>${mine.length?`<ol>${mine.map(s=>laneItem(s,S.r[s.id]!=null?S.r[s.id]+"/10":"#"+(ladderIds(D.songs).indexOf(s.id)+1))).join("")}</ol>`:`<p class="empty">Rate or battle songs in this lane to build your list.</p>`}</div></div></section>`}).join("")+`</div><p class="note">Lanes are based on featured artists.</p>`}

/* charts */
function vCharts(){const L=ladderIds(D.songs),pos={};L.forEach((id,i)=>pos[id]=i+1)
 const top=D.songs.filter(s=>s.st).sort((x,y)=>y.st-x.st).slice(0,25),mx=top[0].st
 const gems=D.albums.filter(a=>a.type==="Album").map(a=>{const ss=BYA[a.k].filter(s=>s.st).sort((x,y)=>x.st-y.st);return{a,s:ss[0]}}).filter(x=>x.s)
 return chips(LIBCHIPS,"charts")+`<div class="sec-h"><div><p class="eyebrow">Record</p><h2>Milestones</h2><p>From a debut at #1 to the Maradona, twice.</p></div></div>
 <ol class="timeline-ms">${MILESTONES.map(([d,t,x,k])=>`<li><span class="msd">${d}</span><img src="${A[k].art}" alt=""><div><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join("")}</ol>
 <div class="sec-h"><div><h2>Most Streamed</h2><p>Top 25 on Spotify, all time. Songs where he's only featured aren't in this catalogue.</p></div></div>
 <ol class="ones">${top.map((s,i)=>`<li><img src="${art(s)}" alt="" data-song="${s.id}"><div style="min-width:0"><b>${i+1}. ${esc(s.t)}</b><small>${esc(A[s.a].t)}${s.x?" · "+esc(s.x):""}</small>${S.nb?`<br><span class="yours">Your rank #${pos[s.id]}</span>`:""}</div><div class="wk" aria-hidden="true"><i style="width:${s.st/mx*100}%"></i></div><div class="w num">${fmtS(s.st)}</div></li>`).join("")}</ol>
 <div class="sec-h"><div><h2>The Albums</h2></div></div>
 <div class="tbl-wrap"><table><thead><tr><th></th><th>Album</th><th>Year</th><th>FIMI</th><th>Certified</th><th>Songs</th><th>Spotify</th></tr></thead><tbody>${D.albums.filter(a=>a.type==="Album").map(a=>`<tr><td><img src="${a.art}" alt=""></td><td><a href="#album-${a.k}">${esc(a.t)}</a></td><td class="num">${a.y}</td><td class="num">#${a.peak}</td><td>${a.cert||"n/a"}</td><td class="num">${a.nstd} + ${a.n-a.nstd}</td><td class="num">${fmtS(BYA[a.k].reduce((t,s)=>t+(s.st||0),0))}</td></tr>`).join("")}</tbody></table></div>
 <div class="sec-h"><div><h2>Hidden in the Tracklist</h2><p>The least-streamed song on each album. Give them a listen.</p></div></div>
 <div class="picks">${gems.map(({a,s})=>`<div class="pick" data-song="${s.id}"><img src="${art(s)}" alt=""><div><small>${esc(a.t).toUpperCase()}${s.x?" · "+esc(s.x).toUpperCase():""}</small><b>${esc(s.t)}</b><p>${fmtS(s.st)} streams, the fewest on the album.</p><div style="margin-top:6px">${pvBtn(s)}</div></div></div>`).join("")}</div>
 <p class="note">Spotify streams from kworb.net, updated ${D.streamsAsOf}. Chart and certification facts from FIMI reporting and Italian press coverage.</p>`}

/* stats */
function vStats(){const vals=Object.entries(S.r).filter(([id])=>SONG[id]).map(r=>r[1]),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null
 const hist=Array.from({length:10},(_,i)=>vals.filter(v=>v===i+1).length),hm=Math.max(1,...hist)
 const alb=D.albums.map(a=>({a,st:albumStats(a.k)})).filter(x=>x.st.rated).sort((x,y)=>y.st.avg-x.st.avg)
 const lanes=Object.entries(D.lanes).map(([k,v])=>{const l=D.songs.filter(s=>s.l===k&&S.r[s.id]!=null).map(s=>S.r[s.id]);return{v,n:l.length,avg:l.length?l.reduce((a,b)=>a+b,0)/l.length:null}}).filter(x=>x.n).sort((x,y)=>y.avg-x.avg)
 const feat={};D.songs.forEach(s=>{if(!s.f)return;s.f.split(/, | & | and /).map(x=>x.trim()).filter(x=>x&&x!=="Geolier").forEach(x=>feat[x]=(feat[x]||0)+1)})
 const ft=Object.entries(feat).sort((a,b)=>b[1]-a[1]).slice(0,10),fm=ft[0][1]
 const L=S.nb?ladderIds(D.songs):[],first=L.length?SONG[L[0]]:null
 const hitGap=S.nb?D.songs.filter(s=>s.st).map(s=>({s,mine:L.indexOf(s.id)+1})).filter(x=>x.mine):[]
 const byStream=D.songs.filter(s=>s.st).sort((x,y)=>y.st-x.st),srank={};byStream.forEach((s,i)=>srank[s.id]=i+1)
 const hot=hitGap.filter(x=>srank[x.s.id]<=40).sort((x,y)=>y.mine-x.mine)[0],gem=hitGap.filter(x=>x.mine<=40).sort((x,y)=>srank[y.s.id]-srank[x.s.id])[0]
 return `<div class="tiles"><div class="tile"><b class="num">${vals.length}<span style="font-size:16px;color:var(--muted)">/${D.songs.length}</span></b><span>songs rated</span></div>
 <div class="tile"><b class="num">${avg!=null?avg.toFixed(2):"·"}</b><span>average rating</span></div>
 <div class="tile"><b>${first?esc(first.t):"·"}</b><span>your #1 song</span></div>
 <div class="tile"><b>${alb[0]?esc(alb[0].a.t):"·"}</b><span>highest-rated album</span></div>
 <div class="tile"><b>${gem?esc(gem.s.t):"·"}</b><span>${gem?`your #${gem.mine}, the public's #${srank[gem.s.id]}`:"your biggest hidden gem"}</span></div>
 <div class="tile"><b>${hot?esc(hot.s.t):"·"}</b><span>${hot?`a top-40 hit you rank #${hot.mine}`:"your coldest take on a hit"}</span></div></div>
 ${vals.length?`<div class="two"><div><div class="sec-h" style="margin-top:0"><div><h2>Rating Spread</h2></div></div><div class="hist">${hist.map((n,i)=>`<div><em class="num">${n||""}</em><i style="height:${n/hm*100}%;background:${rc(i+1)}"></i><span>${i+1}</span></div>`).join("")}</div></div>
 <div><div class="sec-h" style="margin-top:0"><div><h2>By Lane</h2></div></div><div class="hbars">${lanes.map(l=>`<div class="hb"><span>${esc(l.v)}</span><div class="track"><i style="width:${l.avg*10}%"></i></div><em class="num">${l.avg.toFixed(2)}</em></div>`).join("")}</div></div></div>
 <div class="sec-h"><div><h2>Album Leaderboard</h2><p>By your average song rating.</p></div></div>
 <div class="hbars">${alb.map(x=>`<div class="hb"><span><a href="#album-${x.a.k}">${esc(x.a.t)}</a>${S.g[x.a.k]?` <span class="chip one">${S.g[x.a.k]}</span>`:""}</span><div class="track"><i style="width:${x.st.avg*10}%"></i></div><em class="num">${x.st.avg.toFixed(2)}</em></div>`).join("")}</div>`:`<p class="empty" style="margin-top:16px">Rate songs on any album and your spread, lanes and album leaderboard show up here.</p>`}
 <div class="sec-h"><div><h2>Most Featured</h2><p>Credited guests across the catalogue, by tracks.</p></div></div>
 <div class="hbars">${ft.map(([n,c])=>`<div class="hb"><span>${esc(n)}</span><div class="track"><i style="width:${c/fm*100}%"></i></div><em class="num">${c}</em></div>`).join("")}</div>`}

/* delegated taps: ratings and previews */
document.addEventListener("click",e=>{
 const pv=e.target.closest(".pv");if(pv){Player.toggle(pv.dataset.pv);return}
 const p=e.target.closest(".pip");if(!p)return
 const id=p.dataset.id,v=+p.dataset.v
 if(S.r[id]===v)delete S.r[id];else S.r[id]=v
 persist()
 $$(`.trk[data-id="${id}"] .pips`).forEach(el=>el.outerHTML=pips(id))
 $$(`.trk[data-id="${id}"] .score`).forEach(el=>el.textContent=S.r[id]??"·")
 const h=location.hash.slice(1);if(h.startsWith("album-")){const k=h.slice(6),st=albumStats(k),hint=$("#ahint");if(hint)hint.innerHTML=`${st.rated}/${st.n} songs rated${st.avg!=null?` · your average <b>${st.avg.toFixed(2)}</b> suggests <b>${autoGrade(st.avg)}</b>`:" · rate songs to get a suggested grade"}`}})
document.addEventListener("keydown",e=>{if(location.hash!=="#rank"||e.target.matches("input,select,textarea"))return
 if(e.key==="ArrowLeft"){e.preventDefault();battle(0)}else if(e.key==="ArrowRight"){e.preventDefault();battle(1)}else if(e.key==="ArrowDown"){e.preventDefault();battle(2)}else if(e.key===" "){e.preventDefault();skipDuel()}})
