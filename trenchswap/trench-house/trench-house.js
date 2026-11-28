/* Trench House v61 - TrenchSwap's social side, as a self-contained module.
   Adapted from the stage-1 round-2 prototype (~/workspace/work/trench-house/).
   - All names live inside this IIFE; nothing here touches TrenchSwap's globals.
   - Data comes from trench-house/published.json (same origin, fetched once).
   - No inline script was added to index.html, so the CSP script hashes are
     untouched. This file is loaded with <script src="trench-house/trench-house.js" defer>.
   - Submissions build the exact review-lane JSON and offer it as a download.
     Nothing is sent live in v61 (DESIGN.md section 3). */
(function () {
"use strict";
var AV_BASE = "trench-house/avatars/";
var DATA_URL = "trench-house/published.json";
var FEE_WALLET = "utJ3CPNT6zHiaQvr356vURiQVQ3GhobWUDbRMUybHww";
var AVATARS = ["trencher","sniper","diver","miner","sentry","scout","sapper","medic","comms","chef","captain","grenadier","lookout","tunneler","skytrencher","signaler","quartermaster","engineer","nightwatch","standardbearer"];
var AVNAMES = {trencher:"The Trencher",sniper:"Sniper",diver:"Deep Diver",miner:"Miner",sentry:"Sentry",scout:"Scout",sapper:"Sapper",medic:"Medic",comms:"Comms Op",chef:"Field Chef",captain:"Captain",grenadier:"Grenadier",lookout:"Lookout",tunneler:"Tunneler",skytrencher:"Sky Trencher",signaler:"Signaler",quartermaster:"Quartermaster",engineer:"Engineer",nightwatch:"Night Watch",standardbearer:"Standard Bearer"};
var DATA = null, loaded = false, loadFailed = false;
var lastView = "feed", pickedAvatar = "trencher", quotingId = null;
var mediaState = {kind:null, ok:true, info:"", files:[]};
var adImgState = {ok:true, name:null, bytes:0};
var liked = {};

function $(id){ return document.getElementById(id); }
function thEsc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function thShort(w){ return w && w.length>14 ? w.slice(0,6)+"..."+w.slice(-4) : w; }
function thProf(w){ return (DATA.profiles||[]).filter(function(p){ return p.wallet===w; })[0]; }
function thById(id){ return (DATA.posts||[]).filter(function(x){ return x.id===id; })[0]; }
function thAvaImg(p,size){ return '<img src="'+AV_BASE+p.avatar+'.svg" alt="" width="'+(size||44)+'" height="'+(size||44)+'">'; }
function thRelTs(ts){
  var now = DATA && DATA.generated_at ? new Date(DATA.generated_at) : new Date();
  var d = Math.max(0,(now - new Date(ts))/1000);
  if(d < 3600) return Math.max(1,Math.floor(d/60)) + "m";
  if(d < 86400) return Math.floor(d/3600) + "h";
  return new Date(ts).toLocaleDateString();
}
function thFmtN(n){ if(n==null) return "0"; if(n>=1000) return (Math.round(n/100)/10) + "k"; return ""+n; }
function thCopyText(t, btn){
  function done(){ if(btn){ var o = btn.textContent; btn.textContent = "Copied"; setTimeout(function(){ btn.textContent = o; },1400); } }
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done, done); }
  else { window.prompt("Copy this:", t); }
}

/* ---------- card pieces ---------- */
function thHeadRow(p, ts, extra){
  return '<div class="th-phead"><span class="th-h" data-th-action="profile" data-th-wallet="'+p.wallet+'">'+thEsc(p.handle)+'</span><span class="th-meta">@'+thEsc(p.handle)+' &middot; '+thRelTs(ts)+'</span>'+(extra||"")+'</div>';
}
function thMediaHtml(m){
  if(!m) return "";
  var h = '<div class="th-media">';
  if(m.kind==="image"){
    var imgs = m.images || (m.url ? [m.url] : []);
    if(imgs.length) h += '<div class="th-grid">' + imgs.map(function(u){ return '<img src="'+u+'" alt="">'; }).join("") + '</div>';
    if(m.sample_label) h += '<div class="th-cap">'+thEsc(m.sample_label)+'</div>';
  } else if(m.kind==="video"){
    h += '<div class="th-vidslot">&#9654; '+thEsc(m.sample_label||("Video, "+m.seconds+"s"))+'</div>';
  }
  return h + '</div>';
}
function thLinkCardHtml(lc){
  if(!lc) return "";
  if(lc.kind==="pumpfun"){
    return '<div class="th-tokencard"><span class="th-tag ad">PUMP.FUN LINK</span><div style="margin-top:6px"><span class="th-tk-sym">'+thEsc(lc.token_symbol||"")+'</span> <span style="color:var(--th-mut)">'+thEsc(lc.token_name||"")+'</span></div>'
      + '<div class="th-mintline">mint: '+thShort(lc.mint)+'<button class="th-copybtn" data-th-action="copy" data-th-text="'+thEsc(lc.mint)+'">Copy mint</button></div>'
      + '<div class="th-adfoot">Shared link, rendered as a token card. No price, no chart, no buy button - trading stays in TrenchSwap.</div></div>';
  }
  if(lc.kind==="article" && lc.title){
    return '<a class="th-linkcard" href="'+thEsc(lc.url)+'" target="_blank" rel="noopener">'
      + (lc.image ? '<img src="'+lc.image+'" alt="">' : '')
      + '<div class="th-lc-body"><div class="th-lc-site">'+thEsc(lc.site||"LINK")+'</div><div class="th-lc-title">'+thEsc(lc.title)+'</div><div class="th-lc-desc">'+thEsc(lc.description||"")+'</div></div></a>';
  }
  return '<a class="th-linkcard" href="'+thEsc(lc.url)+'" target="_blank" rel="noopener"><div class="th-lc-body"><div class="th-lc-site">LINK</div><div class="th-lc-title">'+thEsc(lc.url)+'</div><div class="th-lc-desc">No preview could be fetched for this link - it renders plain, never with an invented preview.</div></div></a>';
}
function thContentHtml(post){
  var h = "";
  if(post.type==="callout"){
    h += '<div class="th-mintline">Watching <b>'+thEsc(post.token_symbol||"")+'</b> - '+thEsc(post.token_name||"")+'<br>mint: '+thEsc(post.mint)+'<button class="th-copybtn" data-th-action="copy" data-th-text="'+thEsc(post.mint)+'">Copy mint</button></div>';
    h += '<div class="th-txt">'+thEsc(post.reason)+'</div>';
  } else {
    if(post.text) h += '<div class="th-txt">'+thEsc(post.text)+'</div>';
    if(post.link_card) h += thLinkCardHtml(post.link_card);
  }
  h += thMediaHtml(post.media);
  if(post.type==="quote"){
    var q = thById(post.quote_of);
    if(q) h += thQuoteEmbedHtml(q);
  }
  return h;
}
function thQuoteEmbedHtml(post){
  var p = thProf(post.wallet); if(!p) return "";
  var body = post.type==="callout" ? ("Watching " + (post.token_symbol||"") + " - " + (post.reason||"")) : (post.text||"");
  return '<div class="th-quoteembed" data-th-action="profile" data-th-wallet="'+p.wallet+'">' + thHeadRow(p, post.ts)
    + '<div class="th-txt">'+thEsc(body)+'</div>'
    + (post.type==="callout" ? '<div class="th-mintline">mint: '+thShort(post.mint)+'</div>' : '')
    + '</div>';
}
function thActBar(post){
  var e = post.engagement || {replies:0, reposts:0, quotes:0, likes:0, views:0};
  var lk = liked[post.id] ? 1 : 0;
  return '<div class="th-actbar">'
    + '<button class="th-act th-static" title="Replies are read-only counts in this lane - threaded replies arrive with the server stage">&#128172; '+thFmtN(e.replies)+'</button>'
    + '<button class="th-act" title="Repost to your page (no added text)" data-th-action="repost" data-th-id="'+post.id+'">&#128257; '+thFmtN(e.reposts)+'</button>'
    + '<button class="th-act" title="Quote with your own words" data-th-action="quote" data-th-id="'+post.id+'">&#9998; '+thFmtN(e.quotes)+'</button>'
    + '<button class="th-act'+(lk?' th-liked':'')+'" title="Like" data-th-action="like" data-th-id="'+post.id+'">'+(lk?'&#10084;':'&#9825;')+' <span>'+thFmtN(e.likes+lk)+'</span></button>'
    + '<span class="th-act th-static" title="Views (publish-time tally, approximate)">&#128065; '+thFmtN(e.views)+'</span>'
    + '<button class="th-act" title="Copy link to this post" data-th-action="share" data-th-id="'+post.id+'">&#128228;</button>'
    + '</div>';
}
function thPostCard(post){
  var p = thProf(post.wallet); if(!p) return "";
  var h = '<div class="th-card">';
  if(post.type==="repost"){
    var orig = thById(post.repost_of);
    h += '<div class="th-rpline">&#128257; '+thEsc(p.handle)+' reposted</div>';
    if(!orig) return h + '<p class="th-note">Original post not in this bundle.</p></div>';
    var op = thProf(orig.wallet); if(!op) return h + '</div>';
    h += '<div class="th-post"><div class="th-pava" data-th-action="profile" data-th-wallet="'+op.wallet+'">'+thAvaImg(op)+'</div><div class="th-pbody">'
      + thHeadRow(op, orig.ts, orig.type==="callout" ? ' <span class="th-tag co">TRENCHER CALL OUT</span>' : '')
      + thContentHtml(orig) + thActBar(orig)
      + '</div></div></div>';
    return h;
  }
  var tag = post.type==="callout" ? ' <span class="th-tag co">TRENCHER CALL OUT</span>' : '';
  h += '<div class="th-post"><div class="th-pava" data-th-action="profile" data-th-wallet="'+p.wallet+'">'+thAvaImg(p)+'</div><div class="th-pbody">'
    + thHeadRow(p, post.ts, tag)
    + thContentHtml(post) + thActBar(post)
    + '</div></div></div>';
  return h;
}
function thNewsCard(n){
  return '<div class="th-card"><div class="th-newscard"><div class="th-nicon">&#128240;</div><div class="th-pbody">'
    + '<div class="th-phead"><span class="th-h">'+thEsc(n.outlet)+'</span><span class="th-meta">'+thRelTs(n.ts)+'</span> <span class="th-tag news">NEWS</span> <span class="th-tag sample">SAMPLE</span></div>'
    + '<div style="margin-top:5px"><a class="th-headline" href="'+thEsc(n.url)+'" target="_blank" rel="noopener">'+thEsc(n.headline)+'</a></div>'
    + '<div class="th-adfoot">Headline and link only, baked in from the outlet\'s feed at publish time. The article itself lives at the outlet.</div>'
    + '</div></div></div>';
}
function thAdCard(ad){
  var p = thProf(ad.wallet);
  var h = '<div class="th-card" style="border-color:rgba(251,146,60,.55)"><div class="th-post">';
  if(p) h += '<div class="th-pava" data-th-action="profile" data-th-wallet="'+p.wallet+'">'+thAvaImg(p)+'</div>';
  h += '<div class="th-pbody"><div class="th-phead">'
    + (p ? '<span class="th-h" data-th-action="profile" data-th-wallet="'+p.wallet+'">'+thEsc(p.handle)+'</span><span class="th-meta">@'+thEsc(p.handle)+'</span>' : '')
    + ' <span class="th-tag ad">AD</span> <span class="th-tag sample">SAMPLE AD</span></div>'
    + '<div class="th-txt">'+thEsc(ad.text)+'</div>'
    + thMediaHtml(ad.image ? {kind:"image", images:[ad.image.url], sample_label:ad.image.sample_label} : null)
    + '<a class="th-adlink" href="'+thEsc(ad.link_url)+'" target="_blank" rel="noopener">'+thEsc(ad.link_label||ad.link_url)+'</a>'
    + '<div class="th-adfoot">Promoted. Approx. '+thFmtN(ad.views_served)+' of '+thFmtN(ad.views_purchased)+' purchased views served (sample tally - view counts on this lane are approximate, DESIGN.md 2.6).</div>'
    + '</div></div></div>';
  return h;
}

/* ---------- feeds ---------- */
function thFeedItems(){
  var items = [];
  (DATA.posts||[]).forEach(function(x){ items.push({ts:x.ts, kind:"member", rec:x}); });
  (DATA.news||[]).forEach(function(x){ items.push({ts:x.ts, kind:"news", rec:x}); });
  (DATA.ads||[]).forEach(function(x){ items.push({ts:x.ts, kind:"ad", rec:x}); });
  items.sort(function(a,b){ return a.ts<b.ts?1:-1; });
  /* design default: at most 1 ad per 8 feed slots - defer an ad that lands too close to the previous one */
  var out = [], deferred = [], lastAd = -99;
  items.forEach(function(it){
    if(it.kind==="ad"){
      if(out.length - lastAd < 8){ deferred.push(it); return; }
      lastAd = out.length;
    }
    out.push(it);
    while(deferred.length && out.length - lastAd >= 8){ out.push(deferred.shift()); lastAd = out.length-1; }
  });
  return out.concat(deferred);
}
function thEmptyState(){
  return '<div class="th-card"><p class="th-empty">No posts yet. Be the first trencher to post.<br>Write a post or a call-out and it appears here after review.</p></div>';
}
function thRenderFeed(){
  var el = $("th-view-feed"); if(!el) return;
  var items = thFeedItems();
  var h = "<h2 class=\"th-sec\">House Feed</h2><div class='th-chips'><span>Posts</span><span>Call-outs</span><span>Quotes</span><span>News</span><span>Ads, labelled</span></div>";
  if(!items.length){ el.innerHTML = h + thEmptyState(); return; }
  h += items.map(function(it){
    if(it.kind==="news") return thNewsCard(it.rec);
    if(it.kind==="ad") return thAdCard(it.rec);
    return thPostCard(it.rec);
  }).join("");
  el.innerHTML = h;
}
function thRenderCallouts(){
  var el = $("th-view-callouts"); if(!el) return;
  var cos = (DATA.posts||[]).filter(function(x){ return x.type==="callout"; }).sort(function(a,b){ return a.ts<b.ts?1:-1; });
  var h = "<h2 class=\"th-sec\">Call-Out Feed</h2><p class='th-note'>Call-outs from the TrenchSwap Trenching tab, mirrored here after review. A call-out is the member's own posted words about a token - it is not a holdings display and shows no balances.</p>";
  el.innerHTML = h + (cos.length ? cos.map(thPostCard).join("") : thEmptyState());
}

/* ---------- profile ---------- */
function thFinBlock(title, rows){
  if(!rows || !rows.length) return "";
  return '<div class="th-fin"><h4>'+title+' - shown by the member\'s choice (SAMPLE read)</h4>'+rows+'</div>';
}
function thOpenProfile(w){
  var p = thProf(w); if(!p) return;
  var mine = (DATA.posts||[]).filter(function(x){ return x.wallet===w; }).sort(function(a,b){ return a.ts<b.ts?1:-1; });
  var h = '<button class="th-mini th-back" data-th-action="back-feed">Back to feed</button><div class="th-card">';
  h += '<div class="th-post"><div class="th-pava">'+thAvaImg(p,56)+'</div><div class="th-pbody"><div class="th-h" style="font-weight:800;font-size:18px">'+thEsc(p.handle)+'</div><div class="th-meta" style="color:var(--th-dim);font-size:13px">@'+thEsc(p.handle)+' &middot; '+thEsc(p.wallet)+'</div></div></div>';
  h += '<div class="th-txt">'+thEsc(p.bio)+'</div>';
  (p.links||[]).forEach(function(l){ if(l.url) h += '<a class="th-lk" href="'+thEsc(l.url)+'" target="_blank" rel="noopener">'+thEsc(l.label||l.url)+' '+(l.safe_checked?'<span class="th-ver">safety checked</span>':'')+'</a>'; });
  h += '<div style="margin-top:8px">';
  if(p.socials && p.socials.x && p.socials.x.url) h += '<div>X: <a href="'+thEsc(p.socials.x.url)+'" target="_blank" rel="noopener">'+thEsc(p.socials.x.url)+'</a> '+(p.socials.x.verified?'<span class="th-ver">verified by code-post</span>':'<span class="th-unv">not verified</span>')+'</div>';
  if(p.socials && p.socials.facebook && p.socials.facebook.url) h += '<div>Facebook: <a href="'+thEsc(p.socials.facebook.url)+'" target="_blank" rel="noopener">'+thEsc(p.socials.facebook.url)+'</a> '+(p.socials.facebook.verified?'<span class="th-ver">verified by code-post</span>':'<span class="th-unv">not verified</span>')+'</div>';
  h += '</div>';
  var fd = p.financial_display||{}, sf = p.sample_financial||{};
  if(fd.holdings){
    if(sf.holdings) h += thFinBlock("Holdings", sf.holdings.map(function(x){ return '<div>'+thEsc(x.amount)+' '+thEsc(x.symbol)+'</div>'; }).join(""));
    else h += '<div class="th-fin"><h4>Holdings - shown by the member\'s choice</h4><div>NOT READ</div></div>';
  }
  if(fd.recent_trades){
    if(sf.recent_trades) h += thFinBlock("Recent trades", sf.recent_trades.map(function(x){ return '<div>'+thEsc(x.text)+' - '+thEsc(x.when)+'</div>'; }).join(""));
    else h += '<div class="th-fin"><h4>Recent trades - shown by the member\'s choice</h4><div>NOT READ</div></div>';
  }
  if(fd.minted_tokens){
    if(sf.minted_tokens) h += thFinBlock("Tokens minted", sf.minted_tokens.map(function(x){ return '<div>'+thEsc(x.symbol)+' - '+thEsc(x.via)+'</div>'; }).join(""));
    else h += '<div class="th-fin"><h4>Tokens minted - shown by the member\'s choice</h4><div>NOT READ</div></div>';
  }
  if(!fd.holdings && !fd.recent_trades && !fd.minted_tokens) h += '<p class="th-note" style="margin-top:10px">This member shows no financial information, by their choice.</p>';
  h += '</div><h2 class="th-sec">Their posts, reposts, quotes and call-outs</h2>' + (mine.length ? mine.map(thPostCard).join("") : '<p class="th-note">Nothing yet.</p>');
  $("th-view-profile").innerHTML = h;
  thShow("profile");
}

/* ---------- social actions ---------- */
function thToggleLike(id, btn){
  liked[id] = !liked[id];
  var post = thById(id); var e = post.engagement || {likes:0};
  btn.classList.toggle("th-liked", !!liked[id]);
  btn.innerHTML = (liked[id] ? '&#10084;' : '&#9825;') + ' <span>' + thFmtN((e.likes||0) + (liked[id]?1:0)) + '</span>';
}
function thSharePost(id, btn){
  thCopyText("https://appsthatpay.github.io/halex-web/trenchswap/#house/p/" + id + " (sample link)", btn);
}
function thOpenQuote(id){
  quotingId = id;
  var post = thById(id);
  $("th-q-embed").innerHTML = post ? '<div class="th-card" style="margin-top:12px">'+thPostCard(post)+'</div>' : "";
  $("th-q-out").innerHTML = "";
  $("th-q-text").value = "";
  thCountChars('th-q-text','th-q-count');
  thShow("quote");
}
function thBuildQuote(){
  var t = $("th-q-text").value.trim();
  if(!quotingId) { $("th-q-out").innerHTML = '<p class="th-err">Pick a post to quote first.</p>'; return; }
  if(!t) { $("th-q-out").innerHTML = '<p class="th-err">A quote needs your own words - for no added text, use a plain repost.</p>'; return; }
  if(t.length > 280) { $("th-q-out").innerHTML = '<p class="th-err">Over 280 characters.</p>'; return; }
  var rec = {type:"quote", wallet:$("th-q-wallet").value, ts:new Date().toISOString(), quote_of:quotingId, text:t, status:"pending-review"};
  thPayload("quote-" + Date.now() + ".json", rec);
}
function thBuildRepost(id){
  var rec = {type:"repost", wallet:$("th-p-wallet").value, ts:new Date().toISOString(), repost_of:id, status:"pending-review"};
  thPayload("repost-" + Date.now() + ".json", rec);
}

/* ---------- navigation + payload ---------- */
function thShow(v){
  lastView = (v==="profile" || v==="payload" || v==="quote") ? lastView : v;
  ["feed","callouts","join","post","advertise","profile","quote","payload"].forEach(function(x){
    var el = $("th-view-"+x); if(el) el.classList.toggle("th-hidden", x!==v);
    var t = $("th-tab-"+x); if(t) t.classList.toggle("on", x===v);
  });
  window.scrollTo(0,0);
}
function thPayload(name, obj){
  var txt = JSON.stringify(obj, null, 1);
  $("th-payload-out").innerHTML = '<p class="th-note">File name: <b>'+name+'</b></p><pre>'+thEsc(txt)+'</pre><button class="th-bigbtn" data-th-action="download-payload">Download this submission file</button>';
  window._thPayload = {name:name, txt:txt};
  thShow("payload");
}
function thDownloadPayload(){
  var b = new Blob([window._thPayload.txt], {type:"application/json"});
  var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = window._thPayload.name; a.click();
}

/* ---------- profile setup ---------- */
function thGenCode(){
  var c = "TH-" + Math.random().toString(36).slice(2,6).toUpperCase();
  window._thVcode = c;
  $("th-j-code").textContent = " Your code: " + c + " - post it from your X or Facebook account and include the post link when you submit.";
}
function thClaimMessage(){
  var w = $("th-j-wallet").value.trim(), hd = $("th-j-handle").value.trim();
  return "TRENCH HOUSE profile claim\nwallet: " + w + "\nhandle: " + hd + "\nnonce: " + (window._thVcode || "TH-XXXX");
}
function thBuildProfile(){
  var w = $("th-j-wallet").value.trim(), hd = $("th-j-handle").value.trim();
  $("th-j-message").textContent = thClaimMessage();
  if(!w || !hd) { $("th-j-out").innerHTML = '<p class="th-err">Wallet and handle are required.</p>'; return; }
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(hd)) { $("th-j-out").innerHTML = '<p class="th-err">Handle must be 3 to 20 chars: letters, numbers, underscore.</p>'; return; }
  var links = [];
  ["th-j-link1","th-j-link2"].forEach(function(id){ var u = $(id).value.trim(); if(u) links.push({label:"", url:u, safe_checked:false}); });
  for(var i=0;i<links.length;i++){ if(links[i].url.indexOf("https://")!==0){ $("th-j-out").innerHTML = '<p class="th-err">Links must start with https:// - anything else is dropped at review.</p>'; return; } }
  var rec = {type:"profile-submission", wallet:w, handle:hd, avatar:pickedAvatar,
    bio:$("th-j-bio").value.trim(), links:links,
    socials:{x:{url:$("th-j-x").value.trim(), verified:false, method:null},
             facebook:{url:$("th-j-fb").value.trim(), verified:false, method:null}},
    verification_code: window._thVcode || null,
    financial_display:{holdings:$("th-j-fin-h").checked,
                       recent_trades:$("th-j-fin-t").checked,
                       minted_tokens:$("th-j-fin-m").checked},
    claim_message: thClaimMessage(),
    signature: $("th-j-sig").value.trim() || "NOT PROVIDED - reviewer cannot publish without it",
    status:"pending-review"};
  thPayload("profile-" + w.slice(0,8) + ".json", rec);
}

/* ---------- composer ---------- */
function thCountChars(textId, countId){
  var n = $(textId).value.length;
  var el = $(countId);
  el.textContent = n + " / 280"; el.classList.toggle("th-over", n>280);
}
function thCheckMedia(){
  mediaState = {kind:null, ok:true, info:"", files:[]};
  var imgs = $("th-p-img").files, vid = $("th-p-vid").files[0];
  var info = $("th-p-media-info");
  if(imgs.length && vid){ info.innerHTML = '<span class="th-err">Pick pictures OR a video, not both.</span>'; mediaState.ok=false; return; }
  if(imgs.length){
    if(imgs.length > 4){ info.innerHTML = '<span class="th-err">Max 4 pictures per post.</span>'; mediaState.ok=false; return; }
    for(var i=0;i<imgs.length;i++){
      if(imgs[i].size > 5*1024*1024){ info.innerHTML = '<span class="th-err">Picture '+(i+1)+' ('+imgs[i].name+') is over the 5 MB cap.</span>'; mediaState.ok=false; return; }
      mediaState.files.push({name:imgs[i].name, bytes:imgs[i].size});
    }
    mediaState.kind = "image";
    info.textContent = imgs.length + " picture(s) ready, all within the 5 MB cap. In stage 2 the files themselves travel with this submission.";
    return;
  }
  if(vid){
    if(vid.size > 6*1024*1024){ info.innerHTML = '<span class="th-err">Video is over the 6 MB cap ('+(vid.size/1048576).toFixed(1)+' MB). Shorter or lower-resolution clips fit - 5 seconds or less is the sweet spot.</span>'; mediaState.ok=false; return; }
    /* Fail-closed while the length is being read: a post cannot be built with
       an unchecked video, and an undecodable video is rejected loudly instead
       of being silently dropped. */
    mediaState = {kind:"video", ok:false, files:[{name:vid.name, bytes:vid.size}]};
    var v = document.createElement("video"); v.preload = "metadata";
    v.onloadedmetadata = function(){
      var d = v.duration; URL.revokeObjectURL(v.src);
      if(d > 10.05){ info.innerHTML = '<span class="th-err">Video is ' + d.toFixed(1) + 's - over the 10 second cap. Trim it and try again.</span>'; mediaState.ok=false; }
      else { mediaState = {kind:"video", ok:true, files:[{name:vid.name, bytes:vid.size}], seconds:Math.round(d*10)/10}; info.textContent = "Video ready: " + vid.name + ", " + d.toFixed(1) + "s, " + (vid.size/1048576).toFixed(1) + " MB. Within both caps."; }
    };
    v.onerror = function(){
      URL.revokeObjectURL(v.src);
      info.innerHTML = '<span class="th-err">This video could not be read - try a different file (MP4 or WebM).</span>';
      mediaState.ok = false;
    };
    v.src = URL.createObjectURL(vid);
    info.textContent = "Checking video length...";
  }
}
function thBuildPost(){
  var t = $("th-p-text").value.trim();
  var link = $("th-p-link").value.trim();
  if(!t && !link) { $("th-p-out").innerHTML = '<p class="th-err">Write something, or share a link.</p>'; return; }
  if(t.length > 280) { $("th-p-out").innerHTML = '<p class="th-err">Over 280 characters.</p>'; return; }
  if(link && link.indexOf("https://")!==0 && link.indexOf("http://")!==0) { $("th-p-out").innerHTML = '<p class="th-err">Links must start with http:// or https://.</p>'; return; }
  if(!mediaState.ok) { $("th-p-out").innerHTML = '<p class="th-err">Fix the media problem first.</p>'; return; }
  var rec = {type:"post", wallet:$("th-p-wallet").value, ts:new Date().toISOString(), text:t,
    link_url: link || null,
    media: mediaState.kind==="image" ? {kind:"image", files:mediaState.files}
         : mediaState.kind==="video" ? {kind:"video", file_name:mediaState.files[0].name, bytes:mediaState.files[0].bytes, seconds:mediaState.seconds||0} : null,
    status:"pending-review"};
  thPayload("post-" + Date.now() + ".json", rec);
}
function thBuildCallout(){
  var mint = $("th-c-mint").value.trim(), r = $("th-c-reason").value.trim();
  if(!mint || !r) { $("th-c-out").innerHTML = '<p class="th-err">Mint and reason are both required.</p>'; return; }
  if(r.length > 280) { $("th-c-out").innerHTML = '<p class="th-err">Reason is over 280 characters.</p>'; return; }
  var rec = {type:"callout", wallet:$("th-p-wallet").value, ts:new Date().toISOString(), mint:mint, reason:r,
    source:"trenchswap-trenching-tab", status:"pending-review"};
  thPayload("callout-" + Date.now() + ".json", rec);
}

/* ---------- ads ---------- */
function thCheckAdImage(){
  var f = $("th-a-img").files[0];
  var info = $("th-a-img-info");
  adImgState = {ok:true, name:null, bytes:0};
  if(!f) { info.textContent = ""; return; }
  if(f.size > 5*1024*1024){ info.innerHTML = '<span class="th-err">Ad picture is over the 5 MB cap.</span>'; adImgState.ok=false; return; }
  adImgState = {ok:true, name:f.name, bytes:f.size};
  info.textContent = "Ad picture ready: " + f.name + " (" + Math.round(f.size/1024) + " KB).";
}
function thAdPrice(){
  var v = parseInt($("th-a-views").value, 10) || 0;
  var blocks = Math.floor(v/100);
  $("th-a-price").textContent = (blocks*0.25).toFixed(2) + " USDC";
  $("th-a-blocks").textContent = "(" + blocks + " block" + (blocks===1?"":"s") + " x 0.25 USDC)";
  return {views:blocks*100, usdc:blocks*0.25};
}
function thBuildAd(){
  var t = $("th-a-text").value.trim();
  var link = $("th-a-link").value.trim();
  var sig = $("th-a-sig").value.trim();
  var price = thAdPrice();
  if(!t) { $("th-a-out").innerHTML = '<p class="th-err">The ad needs text.</p>'; return; }
  if(t.length > 280) { $("th-a-out").innerHTML = '<p class="th-err">Ad text is over 280 characters.</p>'; return; }
  if(!link || link.indexOf("https://")!==0) { $("th-a-out").innerHTML = '<p class="th-err">The ad link must start with https://.</p>'; return; }
  if(price.views < 100) { $("th-a-out").innerHTML = '<p class="th-err">Minimum buy is one block: 100 views for 0.25 USDC.</p>'; return; }
  if(!adImgState.ok) { $("th-a-out").innerHTML = '<p class="th-err">Fix the ad picture problem first.</p>'; return; }
  if(!sig) { $("th-a-out").innerHTML = '<p class="th-err">Paste the USDC payment signature - the reviewer verifies the payment on-chain before publishing, and an unpaid ad is rejected.</p>'; return; }
  var rec = {type:"ad-submission", wallet:$("th-a-wallet").value, ts:new Date().toISOString(),
    text:t, link_url:link,
    image: adImgState.name ? {file_name:adImgState.name, bytes:adImgState.bytes} : null,
    views_purchased:price.views, usdc_owed:price.usdc,
    payment:{asset:"USDC", to:FEE_WALLET, signature:sig},
    status:"pending-review"};
  thPayload("ad-" + Date.now() + ".json", rec);
}

/* ---------- boot ---------- */
function thInitAvatars(){
  $("th-j-avatars").innerHTML = AVATARS.map(function(a){
    return '<button type="button" data-a="'+a+'" data-th-action="avatar" data-th-a="'+a+'"><img src="'+AV_BASE+a+'.svg" alt="">'+AVNAMES[a]+'</button>';
  }).join("");
  thPickAvatar("trencher");
}
function thPickAvatar(a){
  pickedAvatar = a;
  Array.prototype.forEach.call(document.querySelectorAll("#th-j-avatars button"), function(b){ b.classList.toggle("th-sel", b.getAttribute("data-a")===a); });
}
function thInitAuthors(){
  var opts = (DATA.profiles||[]).map(function(p){ return '<option value="'+p.wallet+'">'+thEsc(p.handle)+' ('+thShort(p.wallet)+')</option>'; }).join("");
  Array.prototype.forEach.call(document.querySelectorAll(".th-author-select"), function(s){ s.innerHTML = opts; });
}
function thRenderAll(){
  var banner = $("th-samplebar");
  if(banner) banner.style.display = DATA._sample_note ? "" : "none";
  thRenderFeed(); thRenderCallouts(); thInitAvatars(); thInitAuthors(); thAdPrice();
}
function thLoadError(){
  var el = $("th-view-feed");
  if(el) el.innerHTML = '<h2 class="th-sec">House Feed</h2><div class="th-card"><p class="th-empty">Could not load the House feed.<br><button class="th-mini" data-th-action="reload">Try again</button></p></div>';
}
function thLoad(){
  if(loaded){ thRenderAll(); return; }
  fetch(DATA_URL).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }).then(function(j){
    DATA = j; loaded = true; thRenderAll();
  }).catch(function(){
    loadFailed = true; thLoadError();
  });
}
/* ---------- swipe ---------- */
/* The app's V50 swipe list is a closure inside its own script block, not a
   global, so the module cannot splice "house" into it. Instead, mirror the
   app's gesture rule (same guard, same 700ms / 80px / 2x-vertical thresholds)
   on the same element and correct the landing only when the house-aware next
   tab differs from the app's. The app's handler runs first (registered
   first); this one fires after it and only re-navigates when the two disagree,
   so no tab is ever navigated twice. */
var TH_TABS = ["home","wallet","market","house","search","swap","stake","mint","info"];
var APP_TABS = ["home","wallet","market","search","swap","stake","mint","info"];
function thNextTab(list, current, dx){
  var i = list.indexOf(current);
  if(i < 0) return current;
  if(dx < 0) return list[Math.min(list.length - 1, i + 1)];
  return list[Math.max(0, i - 1)];
}
function thInitSwipe(){
  var main = document.querySelector("main");
  if(!main || main.__thSwipe) return;
  main.__thSwipe = true;
  var start = null;
  main.addEventListener("pointerdown", function(e){
    if(e.pointerType && e.pointerType !== "touch" && e.pointerType !== "mouse") return;
    var t = e.target;
    if(t && t.closest && t.closest("input,select,textarea,button,a,canvas,.swipe,.dexcar,.strip,.segtabs")) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  main.addEventListener("pointerup", function(e){
    if(!start) return;
    var s = start; start = null;
    var dx = e.clientX - s.x, dy = e.clientY - s.y;
    if(performance.now() - s.t < 700 && Math.abs(dx) > 80 && Math.abs(dx) > 2 * Math.abs(dy)){
      var cur = null;
      document.querySelectorAll("nav button").forEach(function(b){ if(b.classList.contains("on")) cur = b.dataset.tab; });
      if(!cur) return;
      var mine = thNextTab(TH_TABS, cur, dx), theirs = thNextTab(APP_TABS, cur, dx);
      if(mine !== theirs) window.goTab(mine);
    }
  });
  main.addEventListener("pointercancel", function(){ start = null; });
}

function thBoot(){
  if(!$("tab-house")) return; /* module loaded on a page without the tab */
  /* re-render when the tab is opened (data may have been refreshed) */
  try {
    if(typeof window.goTab === "function" && !window.goTab.__thWrapped){
      var orig = window.goTab;
      var wrapped = function(name){ orig(name); if(name === "house") thLoad(); };
      wrapped.__thWrapped = true;
      window.goTab = wrapped;
    }
  } catch(e) {}
  thInitSwipe();
  /* Delegated clicks: the app's CSP blocks inline event-handler attributes,
     so every House control is wired here, never with onclick in markup.
     Generated cards carry data-th-action / data-th-id / data-th-wallet. */
  var house = $("tab-house");
  if(house && !house.__thDelegated){
    house.__thDelegated = true;
    house.addEventListener("click", function(e){
      var t = e.target && e.target.closest ? e.target.closest("[data-th-action]") : null;
      if(!t || !house.contains(t)) return;
      var a = t.getAttribute("data-th-action");
      if(a === "profile") thOpenProfile(t.getAttribute("data-th-wallet"));
      else if(a === "copy") thCopyText(t.getAttribute("data-th-text"), t);
      else if(a === "repost") thBuildRepost(t.getAttribute("data-th-id"));
      else if(a === "quote") thOpenQuote(t.getAttribute("data-th-id"));
      else if(a === "like") thToggleLike(t.getAttribute("data-th-id"), t);
      else if(a === "share") thSharePost(t.getAttribute("data-th-id"), t);
      else if(a === "avatar") thPickAvatar(t.getAttribute("data-th-a"));
      else if(a === "back-feed") thShow("feed");
      else if(a === "download-payload") thDownloadPayload();
      else if(a === "reload") thLoad();
    });
    /* Static form controls in the section HTML (also no inline handlers). */
    function bind(id, evt, fn){ var el = $(id); if(el) el.addEventListener(evt, fn); }
    bind("th-j-gen", "click", thGenCode);
    bind("th-j-submit", "click", thBuildProfile);
    bind("th-p-submit", "click", thBuildPost);
    bind("th-c-submit", "click", thBuildCallout);
    bind("th-a-submit", "click", thBuildAd);
    bind("th-q-submit", "click", thBuildQuote);
    bind("th-p-text", "input", function(){ thCountChars("th-p-text", "th-p-count"); });
    bind("th-c-reason", "input", function(){ thCountChars("th-c-reason", "th-c-count"); });
    bind("th-a-text", "input", function(){ thCountChars("th-a-text", "th-a-count"); });
    bind("th-q-text", "input", function(){ thCountChars("th-q-text", "th-q-count"); });
    bind("th-p-img", "change", thCheckMedia);
    bind("th-p-vid", "change", thCheckMedia);
    bind("th-a-img", "change", thCheckAdImage);
    bind("th-a-views", "input", thAdPrice);
  }
  /* sub-nav pills */
  ["feed","callouts","join","post","advertise"].forEach(function(v){
    var b = $("th-tab-"+v); if(b) b.addEventListener("click", function(){ thShow(v); });
  });
  thLoad();
}

window.TrenchHouse = {
  load: thLoad, show: thShow, openProfile: thOpenProfile, openQuote: thOpenQuote,
  buildRepost: thBuildRepost, buildQuote: thBuildQuote, toggleLike: thToggleLike,
  sharePost: thSharePost, copyText: thCopyText, genCode: thGenCode, buildProfile: thBuildProfile,
  countChars: thCountChars, checkMedia: thCheckMedia, buildPost: thBuildPost,
  buildCallout: thBuildCallout, checkAdImage: thCheckAdImage, adPrice: thAdPrice,
  buildAd: thBuildAd, pickAvatar: thPickAvatar, downloadPayload: thDownloadPayload,
  isLoaded: function(){ return loaded; }, hasFailed: function(){ return loadFailed; },
  tabOrder: function(){ return TH_TABS.slice(); },
  swipeNext: function(cur, dx){ return thNextTab(TH_TABS, cur, dx); }
};
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", thBoot);
else thBoot();
})();
