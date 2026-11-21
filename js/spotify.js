/* Spotify connection. Uses Spotify's PKCE sign-in with your own free developer Client ID.
   Tokens live only on this device. Nothing goes through any server of ours. */
const SP={
 scopes:"user-read-private user-top-read user-read-recently-played playlist-modify-private playlist-modify-public",
 redirect(){return location.origin+location.pathname},
 cid(){return localGet("sp.cid","")||CONFIG.spotifyClientId},
 shared(){return !!CONFIG.spotifyClientId&&!localGet("sp.cid","")},
 tok(){try{return JSON.parse(localGet("sp.tok","")||"null")}catch(e){return null}},
 ok(){return !!this.tok()},
 save(t){const o={a:t.access_token,r:t.refresh_token||(this.tok()||{}).r,x:Date.now()+(t.expires_in-60)*1000};localSet("sp.tok",JSON.stringify(o))},
 async connect(){const cid=this.cid();if(!cid){toast("Add your Client ID first");return}
  const v=b64u(crypto.getRandomValues(new Uint8Array(48))),ch=b64u(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v))))
  localSet("sp.ver",v)
  const st=b64u(new TextEncoder().encode(JSON.stringify({v,n:Math.random().toString(36).slice(2)})))
  const u=new URL("https://accounts.spotify.com/authorize");u.search=new URLSearchParams({client_id:cid,response_type:"code",redirect_uri:this.redirect(),code_challenge_method:"S256",code_challenge:ch,scope:this.scopes,state:st}).toString()
  location.href=u.toString()},
 async handleCallback(){const p=new URLSearchParams(location.search);if(!p.has("code")&&!p.has("error"))return false
  const clean=()=>history.replaceState(null,"",location.pathname+"#me")
  if(p.get("error")){clean();toast("Spotify sign-in was cancelled");return true}
  let v=localGet("sp.ver","");try{v=v||JSON.parse(atob(p.get("state").replace(/-/g,"+").replace(/_/g,"/"))).v}catch(e){}
  try{const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:this.cid(),grant_type:"authorization_code",code:p.get("code"),redirect_uri:this.redirect(),code_verifier:v})})
   const j=await r.json();if(!r.ok)throw new Error(j.error_description||j.error||r.status)
   this.save(j);localSet("sp.ver","");clean();toast("Spotify connected");this.me=null}
  catch(e){clean();toast("Spotify sign-in failed: "+e.message)}
  return true},
 async token(){const t=this.tok();if(!t)throw new Error("not connected");if(Date.now()<t.x)return t.a
  const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:this.cid(),grant_type:"refresh_token",refresh_token:t.r})})
  const j=await r.json();if(!r.ok){this.disconnect();throw new Error("Spotify session expired. Connect again.")}this.save(j);return j.access_token},
 async api(path,opt={}){const t=await this.token();const r=await fetch("https://api.spotify.com/v1"+path,Object.assign({},opt,{headers:Object.assign({Authorization:"Bearer "+t},opt.body?{"Content-Type":"application/json"}:{})}))
  if(r.status===204)return null;let j=null;try{j=await r.json()}catch(e){}
  if(r.status===403&&this.shared())throw new Error("Spotify hasn't approved your account for this app yet. "+CONFIG.spotifyOwnerNote)
  if(!r.ok)throw new Error((j&&j.error&&j.error.message)||("Spotify said "+r.status));return j},
 disconnect(){localSet("sp.tok","");this.me=null;this.cache={}},
 me:null,cache:{},
 match(t){if(!t)return null;const bySp=D.songs.find(s=>s.sp===t.id);if(bySp)return bySp;const c=BYT[norm(t.name.replace(/\s*[\(\[](feat|with)[^\)\]]*[\)\]]/i,""))];return c?c[0]:null},
 isDrake:t=>t&&t.artists&&t.artists.some(a=>a.id==="27LlKWxS3KXW7RRAxN5S8s"),
 async top(range){const k="top-"+range;if(this.cache[k])return this.cache[k];const j=await this.api(`/me/top/tracks?limit=50&time_range=${range}`);return this.cache[k]=(j.items||[]).filter(this.isDrake)},
 async recent(){if(this.cache.recent)return this.cache.recent;const j=await this.api("/me/player/recently-played?limit=50");return this.cache.recent=(j.items||[]).map(x=>x.track).filter(this.isDrake)},
 async uriFor(s){if(s.sp)return "spotify:track:"+s.sp
  try{const j=await this.api("/search?type=track&limit=1&q="+encodeURIComponent(`track:${s.t} artist:Geolier`));const t=j.tracks.items[0];return t?t.uri:null}catch(e){return null}},
 async makePlaylist(songs,name,desc){if(!songs.length){toast("Battle some songs first so there's a ranking to export");return}
  toast("Building your playlist…")
  try{const uris=[];for(const s of songs){const u=await this.uriFor(s);if(u)uris.push(u)}
   const pl=await this.api("/me/playlists",{method:"POST",body:JSON.stringify({name,description:desc,public:false})})
   for(let i=0;i<uris.length;i+=100)await this.api(`/playlists/${pl.id}/items`,{method:"POST",body:JSON.stringify({uris:uris.slice(i,i+100)})})
   toast(`“${name}” is in your Spotify, ${uris.length} songs`)}
  catch(e){toast("Playlist failed: "+e.message)}}}
function b64u(bytes){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}

let spRange=localGet("sp.range","medium_term")
function vSpotify(){const cid=SP.cid()
 const own=`<ol class="hint" style="padding-left:18px;margin:12px 0;display:grid;gap:6px"><li>Go to developer.spotify.com, log in, open the Dashboard and tap <b>Create app</b>. Any name works.</li><li>Under Redirect URIs add exactly:<br><code style="font-family:var(--mono);color:var(--gold-2);word-break:break-all" id="ruri">${esc(SP.redirect())}</code> <button class="btn small ghost" id="copyr">Copy</button></li><li>Tick <b>Web API</b>, save, then copy the <b>Client ID</b> into the box below.</li></ol>
 <p class="hint">Spotify requires the developer app's owner to have Premium.</p>
 <div class="row" style="margin-top:12px"><input type="text" id="cid" placeholder="Spotify Client ID" value="${esc(localGet("sp.cid",""))}" style="flex:1;min-width:200px" autocomplete="off" autocapitalize="off"><button class="btn${CONFIG.spotifyClientId?"":" gold"}" id="spgo">Connect with my key</button></div>`
 if(!SP.ok())return `<div class="card"><p class="eyebrow">Spotify</p><h3 style="font-family:var(--display);font-weight:900;font-size:28px;text-transform:uppercase;margin:4px 0 6px">Connect your Spotify</h3>
 <p class="hint">See your most-played Geolier next to your ranking, and send your rankings to Spotify as playlists. Everything else in the app works without it.</p>
 ${CONFIG.spotifyClientId?`<button class="btn gold" id="spquick" style="margin-top:12px">Connect Spotify</button><p class="hint" style="margin-top:8px">${esc(CONFIG.spotifyOwnerNote)}</p><details style="margin-top:12px"><summary class="hint">Use your own Spotify developer key instead</summary>${own}</details>`:`<p class="hint" style="margin-top:8px">Spotify only lets personal projects in through a free developer key. One-time, two-minute setup:</p>${own}`}
 <details style="margin-top:12px"><summary class="hint">Signed in through Safari instead of the app?</summary><p class="hint">If Spotify opened in Safari and connected there, tap "Copy link code" on that page, then paste it here.</p><div class="row"><input type="text" id="lcode" placeholder="Link code" style="flex:1"><button class="btn" id="lgo">Use code</button></div></details></div>`
 return `<div class="card glow" id="spcard"><div class="row"><div style="flex:1;min-width:0"><p class="eyebrow">Spotify connected</p><b style="font-family:var(--display);font-weight:900;font-size:26px;text-transform:uppercase" id="spname">Loading…</b></div><button class="btn small ghost" id="spoff">Disconnect</button></div>
 <div class="seg" role="group" aria-label="Time range" style="margin-top:12px">${[["short_term","4 weeks"],["medium_term","6 months"],["long_term","All time"]].map(([v,t])=>`<button data-rg="${v}" aria-pressed="${spRange===v}">${t}</button>`).join("")}</div>
 <div class="two" style="margin-top:14px"><div><h4 class="eyebrow" style="margin-bottom:8px">Your most-played Geolier</h4><ol class="mini-list" id="sptop"><li class="hint">Loading…</li></ol></div>
 <div><h4 class="eyebrow" style="margin-bottom:8px">Recently played Geolier</h4><ol class="mini-list" id="sprec"><li class="hint">Loading…</li></ol></div></div>
 <p class="hint" id="spmatch" style="margin-top:12px"></p>
 <div class="sec-h" style="margin-top:20px"><div><h2 style="font-size:24px">Make a playlist</h2><p>Private playlists, straight into your library.</p></div></div>
 <div class="row"><button class="btn gold small" data-pl="25">My top 25</button><button class="btn small" data-pl="50">My top 50</button><button class="btn small" data-pl="100">My top 100</button><button class="btn small" data-pl="all">My full ranking</button><button class="btn small" data-pl="deep">Hidden gems</button><button class="btn small" data-pl="ones">Every deluxe bonus</button></div>
 <textarea id="spcode" hidden readonly rows="2" style="margin-top:12px"></textarea><button class="btn small ghost" id="spcopy" style="margin-top:10px">Copy link code for another device</button></div>`}
async function afterSpotify(){
 if(!SP.ok()){const c=$("#copyr");if(c)c.onclick=async()=>{try{await navigator.clipboard.writeText(SP.redirect());toast("Copied")}catch(e){toast("Select and copy it")}}
  const q=$("#spquick");if(q)q.onclick=()=>{localSet("sp.cid","");SP.connect()}
  $("#spgo").onclick=()=>{const v=$("#cid").value.trim();if(!/^[0-9a-f]{32}$/i.test(v)){toast("That doesn't look like a Client ID. It's 32 letters and numbers.");return}localSet("sp.cid",v);SP.connect()}
  $("#lgo").onclick=()=>{try{const j=JSON.parse(atob($("#lcode").value.trim()));localSet("sp.cid",j.c);SP.save({access_token:"x",refresh_token:j.r,expires_in:0});const t=SP.tok();t.x=0;localSet("sp.tok",JSON.stringify(t));toast("Spotify linked");route(true)}catch(e){toast("That code didn't work")}}
  return}
 $("#spoff").onclick=()=>{SP.disconnect();route(true)}
 $$("[data-rg]").forEach(b=>b.onclick=()=>{spRange=b.dataset.rg;localSet("sp.range",spRange);route(true)})
 $("#spcopy").onclick=async()=>{const t=SP.tok(),code=btoa(JSON.stringify({c:SP.cid(),r:t.r}));const ta=$("#spcode");ta.hidden=false;ta.value=code;try{await navigator.clipboard.writeText(code);toast("Link code copied. Paste it in the app under Me.")}catch(e){ta.select()}}
 $$("[data-pl]").forEach(b=>b.onclick=()=>{const k=b.dataset.pl
  if(k==="deep")return SP.makePlaylist(D.songs.filter(s=>s.st&&s.a!=="singles").sort((x,y)=>x.st-y.st).slice(0,20),"Geolier: Hidden Gems","The least-streamed album tracks, from Geolier Hub.")
  if(k==="ones")return SP.makePlaylist(D.songs.filter(s=>s.x),"Geolier: Atto II and more","Every deluxe-edition bonus track, from Geolier Hub.")
  const n=k==="all"?D.songs.length:+k;SP.makePlaylist(myTop(n),k==="all"?"My Geolier Ranking":`My Geolier Top ${n}`,`Ranked head to head in Geolier Hub.`)})
 const L=S.nb?ladderIds(D.songs):[],pos={};L.forEach((id,i)=>pos[id]=i+1)
 const row=(t,i)=>{const s=SP.match(t);return `<li><span class="p">${i+1}</span><img src="${(t.album.images[2]||t.album.images[0]||{}).url||""}" alt=""><span>${esc(t.name)}</span><i>${s&&pos[s.id]?"you #"+pos[s.id]:""}</i></li>`}
 try{if(!SP.me)SP.me=await SP.api("/me");$("#spname").textContent=SP.me.display_name||"You"}catch(e){$("#spname").textContent="Connected";toast(e.message)}
 try{const top=await SP.top(spRange);$("#sptop").innerHTML=top.length?top.slice(0,15).map(row).join(""):`<li class="hint">No Geolier in your top 50 for this period.</li>`
  if(top.length&&L.length){const mine=new Set(L.slice(0,50)),hits=top.map(t=>SP.match(t)).filter(Boolean),overlap=hits.filter(s=>mine.has(s.id)).length
   $("#spmatch").innerHTML=`<b>Taste match:</b> ${overlap} of your ${hits.length} most-played Geolier songs are in your ranked top 50.`}}
 catch(e){$("#sptop").innerHTML=`<li class="hint">Couldn't load top tracks: ${esc(e.message)}</li>`}
 try{const rec=await SP.recent(),seen=new Set(),u=rec.filter(t=>!seen.has(t.id)&&seen.add(t.id));$("#sprec").innerHTML=u.length?u.slice(0,10).map(row).join(""):`<li class="hint">No Geolier in your last 50 plays.</li>`}
 catch(e){$("#sprec").innerHTML=`<li class="hint">Couldn't load recent plays: ${esc(e.message)}</li>`}}
