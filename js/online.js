var SUPABASE_LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js";
var ON = { sb: null, user: null, me: null, admin: false, ban: null, cache: {}, err: "", unread: 0, todo: 0, started: false, ready: false, lastPub: 0 };
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function onlineCfg(){
  var uu = typeof SUPABASE_URL =="string" ? SUPABASE_URL : "", kk = typeof SUPABASE_KEY == "string" ? SUPABASE_KEY : "";
  try { var str = JSON.parse(localStorage.getItem("ngs_online") || "{}"); if(str.url && str.key){ uu = str.url; kk = str.key; } } catch(err){ }
  return { url: String(uu || "").trim().replace(/\/+$/, ""),key: String(kk || "").trim() };
}
function onlineOn(){ var cfg = onlineCfg(); return !!(cfg.url && cfg.key); }
function onlineOpts(){
 var thing = {}; try { thing = JSON.parse(localStorage.getItem("ngs_online_opts") || "{}"); } catch(err){ }
  if(thing.auto === undefined) thing.auto = true;
  if(thing.events === undefined) thing.events = true;
  if(!thing.muted) thing.muted = [];
  return thing;
}
function onlineSetOpts(thing){ try { localStorage.setItem("ngs_online_opts", JSON.stringify(thing)); } catch(err){ } }
function isMuted(id){ return onlineOpts().muted.indexOf(id) >= 0; }

function sbLoad(callback){
  if(window.supabase && window.supabase.createClient){ callback(); return; }
  var str = document.createElement("script");
  str.src = SUPABASE_LIB;
  str.onload = callback;
  str.onerror = function(){ ON.err = "Could not load the online library. Are you connected to the internet?"; callback(); };
 document.head.appendChild(str);
}
function onlineStart(callback){
  callback = callback || function(){ };
  if(!onlineOn()){ ON.ready = true; callback(); return; }
  if(ON.started){ callback(); return; }
  ON.started = true;
 sbLoad(function(){
    if(!window.supabase || !window.supabase.createClient){ ON.ready = true; callback(); return; }
    var cfg = onlineCfg();
    try {
      ON.sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "ngs_sb_auth" } });
    } catch(err){ ON.err = "Bad connection settings: " +err.message; ON.ready = true; callback(); return; }
    ON.sb.auth.getSession().then(function(res){
     ON.user = res.data && res.data.session ? res.data.session.user : null;
      return onlineRefreshMe();
    }).then(function(){ ON.ready = true; callback(); }, function(err){ ON.err = errText(err); ON.ready = true; callback(); });
  });
}
function errText(err){
  if(!err) return "Unknown problem";
 var msg = err.message || String(err);
  if(/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Could not reach the online world (no internet, or the server is asleep).";
  if(/JWT|apikey|Invalid API key/i.test(msg)) return "The connection key looks wrong. Check it on the World Account page.";
  if(/duplicate key.*world_orgs_name/i.test(msg)) return "An organisation with that name already exists.";
  if(/treaties_one_open/i.test(msg)) return "There is already an open treaty of that kind between you.";
  if(/row-level security/i.test(msg)) return "Not allowed (you might be blocked by them, banned, or not signed in).";
  if(/anonymous.*disabled/i.test(msg)) return "Guest accounts are switched off on this server. Use an email account instead.";
 return msg;
}
function sbData(bit){ return bit.then(function(res){ if(res.error) throw res.error; return res.data; }); }
function sbCount(bit){ return bit.then(function(res){ if(res.error) throw res.error; return res.count || 0; }); }
function myId(){ return ON.user ? ON.user.id : ""; }

function onlineRefreshMe(){
  ON.me = null; ON.admin = false; ON.ban = null; ON.unread = 0; ON.todo = 0;
 if(!ON.sb || !ON.user) return Promise.resolve();
  var id = myId(),sb = ON.sb;
  return Promise.all([
    sbData(sb.from("nations").select("*").eq("id", id).maybeSingle()),
    sbData(sb.from("admins").select("user_id").eq("user_id",id).maybeSingle()),
    sbData(sb.from("bans").select("*").eq("user_id", id).maybeSingle())
  ]).then(function(res){
   ON.me = res[0]; ON.admin = !!res[1];
    ON.ban = res[2] && (!res[2].until || new Date(res[2].until) > new Date()) ? res[2] : null;
    if(!ON.me) return;
    return Promise.all([
      sbCount(sb.from("messages").select("id", { count: "exact", head: true }).eq("to_id",id).is("read_at", null)),
      sbCount(sb.from("treaties").select("id",{ count: "exact", head: true }).eq("b_id", id).eq("status", "proposed")),
      sbCount(sb.from("org_members").select("org_id", { count: "exact",head: true }).eq("nation_id", id).eq("status", "invited"))
   ]).then(function(cfg){ ON.unread = cfg[0]; ON.todo = cfg[1]+ cfg[2]; return onlineSyncLinks(); });
  });
}

function onlineSyncLinks(){
  if(!ON.sb || !ON.me) return Promise.resolve();
  var id = myId(),sb = ON.sb;
  return Promise.all([
   sbData(sb.from("treaties").select("id,kind,a_id,b_id,a_name,b_name").eq("status", "active").or("a_id.eq."+ id + ",b_id.eq." +id)),
    sbData(sb.from("org_members").select("org_id").eq("nation_id", id).eq("status", "member"))
  ]).then(function(res){
    var info = res[0] || [], partners = info.map(function(tt){ return tt.a_id== id ? tt.b_id : tt.a_id; });
    var orgIds = (res[1] || []).map(function(msg){ return msg.org_id; });
    return Promise.all([
      partners.length ? sbData(sb.from("nations").select("id,population").in("id", partners)) : [],
     orgIds.length ? sbData(sb.from("world_orgs").select("id,name,kind").in("id",orgIds)) : [],
      orgIds.length ? sbData(sb.from("org_members").select("org_id").in("org_id", orgIds).eq("status","member")) : []
    ]).then(function(res2){
      var pops = {}; (res2[0] || []).forEach(function(nat){ pops[nat.id] = nat.population; });
      var counts = {}; (res2[2] || []).forEach(function(msg){ counts[msg.org_id] = (counts[msg.org_id] || 0) + 1; });
      if(!game) return;
      game.online = {
       me: id,
        links: info.slice(0, 30).map(function(tt){ var other = tt.a_id == id ? tt.b_id : tt.a_id; return { id: tt.id, kind: tt.kind,partner: other,name: String((tt.a_id ==id ? tt.b_name : tt.a_name) || "").slice(0, 60), pop: +pops[other] || 0 }; }),
        orgs: (res2[1] || []).slice(0,10).map(function(thing){ return { id: thing.id, name: String(thing.name).slice(0, 60), kind: thing.kind,members: counts[thing.id] || 1 }; }),
        synced: game.week, newsWeek: game.online ? game.online.newsWeek || 0 : 0
      };
      if(typeof lawsRefresh == "function") lawsRefresh();
      autosave();
   });
  });
}

function nationRow(g){
  var ctry = g.country, mov = typeof ensureMovement== "function" ? ensureMovement(g) : null, html = g.history[g.history.length - 1] || {};
  var scores = typeof scorecard== "function" ? scorecard(g) : [], avg = 0;
  for(var i = 0; i < scores.length; i++) avg += scores[i].score;
 var pop = totalPop(g);
  return {
    name: String(ctry.name).slice(0, 60),leader: String(g.leaderName || "").slice(0, 60), title: String(g.constitution.title || "").slice(0, 40),
    party: String(playerParty(g).name).slice(0, 80), ideology: mov ? String(mov.ideology.name).slice(0, 60) : null,
    gov_type: String(g.constitution.govType || "").slice(0,60), capital: String(ctry.capital || "").slice(0, 60), motto: String(ctry.motto || "").slice(0,120),
    currency: String(ctry.currency || "").slice(0, 30) +" (" + String(ctry.symbol || "").slice(0,6) + ")",
    about: String(ctry.profileText || ctry.story || "").slice(0,2000),
   flag: { colors: cleanFlag(ctry.flag) || [], vertical: !!ctry.flagVertical },
    arms: ctry.arms ? cleanArms(ctry.arms) : null,
    scores: scores.map(function(str){ return { n: str.name, s: Math.round(str.score) }; }),
    population: +pop.toFixed(2), gdp_pc: Math.round(g.econ.gdp * 1000 / pop), growth: +(html.growth || 0).toFixed(4), inflation:+(html.infl || 0).toFixed(4),
    unemployment: +(html.u || 0).toFixed(4), approval: +(html.approval || 0).toFixed(3), debt_ratio: +(html.debtRatio || 0).toFixed(3),
    democracy: Math.round(g.politics.di || 0), score: scores.length ? Math.round(avg / scores.length) : null,
    week: g.week, year: weekYear(g)
 };
}
function cleanArms(arm){
  if(!arm || typeof arm !="object") return null;
  var col = function(cfg, dat){ return /^#[0-9a-f]{6}$/i.test(cfg) ? cfg : dat; };
  var inList = function(val, list){ for(var i = 0; i < list.length; i++) if(list[i][0] == val) return val; return "none"; };
  return { shield: SHIELDS[arm.shield] ? arm.shield : "heater", field: col(arm.field, "#17345B"), field2: col(arm.field2, "#FFFFFF"),div: inList(arm.div,ARMS_DIVS), charge: inList(arm.charge, ARMS_CHARGES), chargeColor: col(arm.chargeColor, "#C8A400"), motto: !!arm.motto };
}
function remoteFlag(nat,ww, html){
  var fnc = nat.flag && nat.flag.colors ? cleanFlag(nat.flag.colors) : null;
  return flagHtml({ flag: fnc || ["#999999"], flagVertical: !!(nat.flag && nat.flag.vertical) }, ww,html);
}
function remoteArms(nat, size){ var arm = cleanArms(nat.arms); if(!arm) return ""; arm.mottoText = nat.motto || ""; return armsSvg(arm, size); }

function publishNation(quiet){
 if(!ON.sb || !ON.user || !game) return Promise.resolve();
  ON.lastPub = Date.now();
  return sbData(ON.sb.from("nations").upsert(nationRow(game), { onConflict: "id" }).select().single()).then(function(row){
    var first = !ON.me;
    ON.me = row; wcClear("nations");
    if(first) return onlineSyncLinks();
  }).then(function(){ if(onlineOpts().events) return shareEvents(); }).then(function(){
   if(location.hash.indexOf("#world")== 0) wcRedraw();
    if(!quiet) alert("Your nation is published to the world.");
  }, function(err){ ON.err = errText(err); if(!quiet) alert(ON.err); });
}
function shareEvents(){
  var g = game; if(!g || !g.online || !ON.me) return;
  var from = g.online.newsWeek || g.week - 1, picks = [];
 for(var i = g.events.length - 1; i >= 0 && g.events[i].week > from; i--){
    var err = g.events[i];
    if(err.severity >= 3 && ["election", "war", "peace", "coup", "revolution", "lawInForce", "constitution", "org", "disaster", "riot"].indexOf(err.type) >= 0) picks.push(err);
  }
  g.online.newsWeek = g.week;
  picks = picks.slice(0, 2);
  if(!picks.length) return;
 return sbData(ON.sb.from("world_news").insert(picks.map(function(err){
    return { kind: "event", title: String(err.title).slice(0, 160), body: String(err.cause || "").slice(0, 1000),game_week: g.week };
  }))).then(function(){ wcClear("news"); }, function(){ });
}
function onlineAfterTurn(){
  if(!ON.sb || !ON.me || !game || !onlineOpts().auto) return;
  if(Date.now() - ON.lastPub < 15000) return;
 publishNation(true);
}

function wcGet(key, maker, maxAge){
  var cfg = ON.cache[key];
  if(cfg && (cfg.loading || Date.now() - cfg.at < (maxAge || 30000))) return cfg.data === undefined ? null : cfg.data;
  var hash = location.hash;
  ON.cache[key] = { loading: true, at: 0, data: cfg ? cfg.data : undefined };
 maker().then(function(dat){
    ON.cache[key] = { data: dat,at: Date.now() };
    if(location.hash== hash) wcRedraw();
  }, function(err){
    ON.cache[key] = { data: cfg ? cfg.data : undefined, at: Date.now(), err: errText(err) };
    ON.err = errText(err);
    if(location.hash ==hash) wcRedraw();
 });
  return cfg && cfg.data !== undefined ? cfg.data : null;
}
function wcClear(prefix){ for(var kk in ON.cache) if(!prefix || kk.indexOf(prefix)== 0) delete ON.cache[kk]; }
function wcRedraw(){ var yy = window.scrollY; route(); window.scrollTo(0, yy); }

function onlineTick(){
  if(!ON.sb || !ON.me) return;
 onlineRefreshMe().then(function(){ drawWorldBadge(); }, function(){ });
}
function drawWorldBadge(){
  var bb = document.getElementById("worldbadge");
  if(!bb) return;
  var nat = ON.unread+ ON.todo;
  bb.innerHTML = nat ? " <span class='badge'>" + nat +"</span>" : "";
}
