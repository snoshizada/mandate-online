var wFlash = "";
var WORLD_TABS = [["","World home"], ["nations", "Nations"], ["mail","Mail"], ["treaties", "Treaties"], ["orgs","Organisations"], ["news", "World news"], ["forum","Forum"], ["account", "Account"]];
var FORUM_BOARDS = [["general", "General chat"],["diplomacy", "Diplomacy and roleplay deals"], ["roleplay", "Stories and roleplay"],["help", "Help and strategy"], ["ideas", "Ideas for the game"]];
var TONE_NAMES = { friendly: "Friendly", cooperate: "Cooperation", congratulate: "Congratulations", apologise: "Apology", protest: "Formal protest", warning: "Stern warning", "private": "Private note" };

function wTabs(cur){
  var html = "<p class='wtabs'>";
  for(var i = 0; i < WORLD_TABS.length; i++){
    var tt = WORLD_TABS[i], lab = tt[1];
    if(tt[0] == "mail" && ON.unread) lab += " ("+ ON.unread +")";
    if(tt[0]== "treaties" && ON.todo) lab += " (" + ON.todo + ")";
   html += (cur== tt[0] ? "<b>" + lab + "</b>" : "<a href='#world" + (tt[0] ? "/"+ tt[0] : "") + "'>"+ lab + "</a>")+ " | ";
  }
  if(ON.admin) html += cur == "admin" ? "<b>Admin</b>" : "<a href='#world/admin'>Admin</a>";
  return html + "</p>";
}
function wWhen(tt){
  if(!tt) return "";
 var dat = (Date.now() - new Date(tt).getTime()) / 1000;
  if(dat < 90) return "just now";
  if(dat < 3600) return Math.round(dat / 60) + " min ago";
  if(dat < 86400) return Math.round(dat / 3600)+ " h ago";
  if(dat < 86400 * 30) return Math.round(dat / 86400)+ " days ago";
  return new Date(tt).toLocaleDateString();
}
function wNation(id,name){
  if(!UUID_RE.test(String(id))) return esc(name || "?");
  return "<a href='#world/nation/" + id + "'>"+ esc(name || "Unknown nation") + "</a>";
}
function wPct(qry, dat){ return qry === null || qry === undefined ? "-" : (qry * 100).toFixed(dat === undefined ? 1 : dat) + "%"; }
function wNum(qry){ qry = Number(qry); return isFinite(qry) ? qry : 0; }
function wAct(bit, flash, clear){
 return sbData(bit).then(function(dat){
    if(clear) clear.split(",").forEach(function(cfg){ wcClear(cfg); });
    if(flash) wFlash = flash;
    return onlineRefreshMe().then(function(){ drawWorldBadge(); wcRedraw(); return dat; });
  },function(err){ alert(errText(err)); });
}
function wNeedMe(){
 if(!ON.user) return "<div class='box'>Sign in on the <a href='#world'>World home</a> page first.</div>";
  if(!ON.me) return "<div class='box'>Publish your nation on the <a href='#world'>World home</a> page first. Other players can only see and talk to published nations.</div>";
  return "";
}

PAGES.world = function(arg){
  var parts = String(arg || "").split("/"), tab = parts[0], id = parts[1] || "";
  var html = title("The World Online");
 html += wTabs(tab== "nation" ? "nations" : (tab == "org" ? "orgs" : (tab =="thread" ? "forum" : tab)));
  if(wFlash){ html += "<div class='box' style='background:#E8F4E8'>" +esc(wFlash) +"</div>"; wFlash = ""; }
  if(!onlineOn()){
    html += "<h2>Not connected yet</h2><p>The online world lets you publish your nation, see other players' countries, send them messages, sign treaties that really change your economy, found world organisations together, and post in the world news and forum.</p>";
    html += "<p>The online world isn't switched on in this copy of the game yet.</p><p class='small'>If you run this site: put your Supabase Project URL and publishable key in <b>js/config.js</b> and upload it.</p>";
    return html + "<p>Everything else in the game works offline as before.</p>";
 }
  if(!ON.ready){ onlineStart(wcRedraw); return html + "<p><i>Connecting to the online world...</i></p>"; }
  if(ON.err){ html += "<div class='box' style='background:#FCE8E8'>" + esc(ON.err) + " <a href='javascript:ON.err=\"\";wcClear();wcRedraw()'>(try again)</a></div>"; }
  if(!ON.sb) return html;
  if(tab== "account") return html+ wAccount();
  if(ON.ban) html += "<div class='box' style='background:#FCE8E8'><b>You are banned from posting</b>" + (ON.ban.until ? " until "+ esc(new Date(ON.ban.until).toLocaleString()) : "")+ ". Reason: " + esc(ON.ban.reason || "none given") + "</div>";
  var fnc = { "": wHome, nations: wNations, nation: wNationPage, mail: wMail, treaties: wTreaties, orgs: wOrgs, org: wOrgPage, news: wNews, forum: wForum, thread: wThread, admin: wAdmin }[tab];
  if(!fnc) fnc = wHome;
 try { return html + fnc(id); } catch(err){ console.log(err); return html + "<p>Sorry, this part broke: " +esc(err.message) + "</p>"; }
};

function wHome(){
  var html = "";
  if(!ON.user){
    html += "<h2>Join the world</h2><p>Just type your email. We email you a code, you type it in here and you're in. No password, and the same email works on any device.</p>";
    html += "<div class='box'><b>Your email</b><br><input type='email' id='w_email' placeholder='you@example.com' size=30 value='" + esc(wSentTo) + "' onkeydown='if(event.key==\"Enter\")wEmailGo()'> <button onclick='wEmailGo()'>" + (wSentTo ? "Send again" : "<b>Send me a code</b>") + "</button>";
    if(wSentTo) html += "<p>We sent a code to <b>" + esc(wSentTo) + "</b>. Type it here (or just tap the link in the email):<br><input type='text' id='w_code' size=10 maxlength=10 inputmode='numeric' autocomplete='one-time-code' onkeydown='if(event.key==\"Enter\")wCodeGo()'> <button onclick='wCodeGo()'><b>Let me in</b></button></p><p class='small'>Nothing came? Check your spam folder, wait a minute, then send again.</p>";
    html += "</div><p class='small'>Just looking? <a href='javascript:wGuest()'>Try it as a guest</a> (your nation only lives in this browser).</p>";
    return html;
  }
  if(!ON.me){
    html += "<h2>Publish your nation</h2>";
    if(!game) return html+ "<p>Start or load a game first, then come back here to put your country on the world map.</p>";
    html += "<p>Publishing shares your country's public face with other players: name, flag, coat of arms, leader, form of government, headline numbers and scorecard. Your laws, budget and saves stay in your browser.</p>";
   html += "<table class='data'><tr><td>"+ flagHtml(game.country, 60,40) + "</td><td><b>" + esc(game.country.name) + "</b><br>" +esc(game.constitution.govType) + ", led by "+ esc(game.leaderName) + "</td></tr></table>";
    html += "<p><button onclick='publishNation()'><b>Publish " + esc(game.country.name) + " to the world</b></button></p>";
    return html;
  }
  var me = ON.me;
  html += "<table class='data full'><tr><td style='width:70px'>" +remoteFlag(me, 60,40) + "</td><td><b>"+ wNation(me.id, me.name) + "</b> &middot; last published " + wWhen(me.updated_at)+ "<br><span class='small'>" + esc(me.gov_type || "") + " &middot; " + esc(me.leader || "") + "</span></td>";
  html += "<td>" + (game ? "<button onclick='publishNation()'>Publish now</button>" : "") + "</td></tr></table>";
 if(game && game.country.name!= me.name) html += "<p class='small'>The game you have open is <b>" + esc(game.country.name)+ "</b>. Publishing will rename your world nation to match it.</p>";
  if(ON.unread) html += "<p>&#9993; You have <a href='#world/mail'><b>" + ON.unread + " unread message" + (ON.unread > 1 ? "s" : "")+ "</b></a>.</p>";
  if(ON.todo) html += "<p>&#128220; <a href='#world/treaties'><b>" + ON.todo + " treaty offer" + (ON.todo > 1 ? "s or invitations" : " or invitation")+ "</b></a> waiting for your answer.</p>";
  var stats = wcGet("stats", function(){ return sbData(ON.sb.rpc("world_stats")); }, 60000);
  if(stats) html += "<p class='small'>The world: <b>" +wNum(stats.nations) + "</b> nations (" + wNum(stats.active_week)+ " active this week), <b>" + wNum(stats.treaties) +"</b> treaties in force, <b>" + wNum(stats.orgs) + "</b> organisations, <b>"+ wNum(stats.posts) + "</b> forum posts." +(stats.open_reports ? " <a href='#world/admin'><b>" + stats.open_reports+ " reports to check</b></a>" : "")+ "</p>";
  var list = game && game.online ? game.online : null;
  html += "<h2>What the world does for your country</h2>";
 if(list && (list.links.length || list.orgs.length)){
    html += "<ul>";
    for(var i = 0; i < list.links.length; i++) html += "<li>" + worldTreaty(list.links[i].kind).name+ " with " + wNation(list.links[i].partner, list.links[i].name) + ": <span class='small'>"+ worldTreaty(list.links[i].kind).about +"</span></li>";
    for(var i = 0; i < list.orgs.length; i++) html += "<li>Member of <a href='#world/org/" + Number(list.orgs[i].id)+ "'>" + esc(list.orgs[i].name) +"</a> (" + orgType(list.orgs[i].kind).name+ ", " + list.orgs[i].members + " members): <span class='small'>" + orgType(list.orgs[i].kind).about + "</span></li>";
    html += "</ul><p class='small'>These count in your simulation every week, and show up in the budget as membership fees. They were last checked in game week " + list.synced + ". <a href='javascript:wSync()'>Check again</a></p>";
  }else html += "<p>No treaties or organisations with other players yet. Visit the <a href='#world/nations'>Nations</a> list to make friends.</p>";
  var news = wcGet("news:home", function(){ return sbData(ON.sb.from("world_news").select("*").order("created_at",{ ascending: false }).limit(8)); });
 html += "<h2>Latest world news</h2>" + (news ? wNewsList(news.filter(function(nat){ return !isMuted(nat.author); }).slice(0, 6), false) : "<p><i>Loading...</i></p>") + "<p><a href='#world/news'>All world news</a></p>";
  var top = wcGet("nations:top",function(){ return sbData(ON.sb.from("nations").select("id,name,flag,score,population,gov_type").order("score", { ascending: false, nullsFirst: false }).limit(5)); });
  if(top){ html += "<h2>Top nations by scorecard</h2><table class='data'>"; for(var i = 0; i < top.length; i++) html += "<tr><td>" +(i + 1)+ "</td><td>" + remoteFlag(top[i], 24, 16) +"</td><td>" + wNation(top[i].id, top[i].name) + "</td><td class='num'>"+ (top[i].score === null ? "-" : top[i].score)+ "</td></tr>"; html += "</table>"; }
  return html;
}
function wGuest(){ ON.sb.auth.signInAnonymously().then(function(res){ if(res.error){ alert(errText(res.error)); return; } ON.user = res.data.user; onlineRefreshMe().then(wcRedraw); }); }
var wSentTo = "";
function wEmailGo(){
  var emailTxt = $("w_email").value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTxt)){ alert("That doesn't look like an email address."); return; }
  var back = location.href.split("#")[0];
  ON.sb.auth.signInWithOtp({ email: emailTxt, options: { shouldCreateUser: true, emailRedirectTo: /^https?:/.test(back) ? back + "#world" : undefined } }).then(function(res){
    if(res.error){ alert(errText(res.error)); return; }
    wSentTo = emailTxt; wcRedraw();
    var cd = $("w_code"); if(cd) cd.focus();
  });
}
function wCodeGo(){
  var code = $("w_code").value.replace(/\s/g, "");
  if(!code){ alert("Type the code from the email."); return; }
  ON.sb.auth.verifyOtp({ email: wSentTo, token: code, type: "email" }).then(function(res){
    if(res.error){ alert(/expired|invalid/i.test(res.error.message) ? "That code is wrong or too old. Send a new one." : errText(res.error)); return; }
    ON.user = res.data.user; wSentTo = ""; onlineRefreshMe().then(wcRedraw);
  });
}
function wSync(){ onlineSyncLinks().then(function(){ wFlash = "Checked your treaties and organisations."; wcRedraw(); },function(err){ alert(errText(err)); }); }

function wNations(){
  var thing = onlineOpts(), sort = thing.sort || "score", searchTxt = thing.q || "";
  var SORTS = [["score","Scorecard", false], ["population","Population", false], ["growth","Growth", false], ["approval","Approval", false], ["unemployment","Lowest unemployment", true], ["democracy","Democracy", false], ["updated_at","Recently active", false], ["created_at","Newest", false]];
  var sel = SORTS[0]; for(var i = 0; i < SORTS.length; i++) if(SORTS[i][0] == sort) sel = SORTS[i];
 var html = "<p>Sort by <select id='wn_sort' onchange='wNatSort()'>" + SORTS.map(function(str){ return "<option value='"+ str[0]+ "'" + (str[0] == sel[0] ? " selected" : "") + ">"+ str[1]+ "</option>"; }).join("")+ "</select> ";
  html += "Search <input type='text' id='wn_q' value='" + esc(searchTxt) + "' size=18 maxlength=40 onkeydown='if(event.key==\"Enter\")wNatSort()'> <button onclick='wNatSort()'>Go</button></p>";
  var list = wcGet("nations:"+ sel[0]+ ":" + searchTxt, function(){
    var qry = ON.sb.from("nations").select("id,name,leader,gov_type,ideology,population,score,approval,growth,unemployment,democracy,flag,updated_at");
    if(searchTxt) qry = qry.ilike("name","%" +searchTxt.replace(/[%_,()]/g,"") + "%");
    return sbData(qry.order(sel[0], { ascending: sel[2], nullsFirst: false }).limit(100));
  });
 if(!list) return html +"<p><i>Loading...</i></p>";
  if(!list.length) return html + "<p>No nations found.</p>";
  html += "<table class='data full'><tr><th>#</th><th></th><th>Nation</th><th>Government</th><th>People</th><th>Score</th><th>Approval</th><th>Growth</th><th>Jobless</th><th>Active</th></tr>";
  for(var i = 0; i < list.length; i++){
    var nat = list[i];
    html += "<tr" + (nat.id == myId() ? " style='background:#FFF6D8'" : "")+ "><td>" + (i+ 1) + "</td><td>"+ remoteFlag(nat,24, 16) +"</td><td>" + wNation(nat.id, nat.name) + (isMuted(nat.id) ? " <span class='small'>(muted)</span>" : "")+ "<br><span class='small'>" + esc(nat.leader || "") + "</span></td><td class='small'>" + esc(nat.gov_type || "") + "<br>" +esc(nat.ideology || "") + "</td>";
    html += "<td class='num'>" +wNum(nat.population).toFixed(1) + "m</td><td class='num'>" + (nat.score === null ? "-" : nat.score) + "</td><td class='num'>" +wPct(nat.approval, 0) + "</td><td class='num'>"+ wPct(nat.growth) + "</td><td class='num'>" +wPct(nat.unemployment) + "</td><td class='small'>" + wWhen(nat.updated_at)+ "</td></tr>";
 }
  return html + "</table><p class='small'>Numbers are what each player's game published. Every country runs its own simulation in its own browser.</p>";
}
function wNatSort(){ var thing = onlineOpts(); thing.sort = $("wn_sort").value; thing.q = $("wn_q").value.trim().slice(0, 40); onlineSetOpts(thing); wcRedraw(); }

function wNationPage(id){
  if(!UUID_RE.test(id)) return "<p>No such nation.</p>";
  var nat = wcGet("nation:"+ id,function(){ return sbData(ON.sb.from("nations").select("*").eq("id", id).maybeSingle()); });
 if(nat === null && !(ON.cache["nation:" + id] && !ON.cache["nation:" + id].loading)) return "<p><i>Loading...</i></p>";
  if(!nat) return "<p>This nation no longer exists.</p>";
  var extra = wcGet("nationx:" + id, function(){
    return Promise.all([
      sbData(ON.sb.from("treaties").select("id,kind,a_id,b_id,a_name,b_name,created_at").eq("status","active").or("a_id.eq."+ id + ",b_id.eq." +id).limit(50)),
      sbData(ON.sb.from("org_members").select("org_id,status").eq("nation_id",id).eq("status", "member")),
      sbData(ON.sb.from("world_news").select("*").eq("author", id).order("created_at", { ascending: false }).limit(5)),
     ON.me ? sbData(ON.sb.from("blocks").select("blocked_id").eq("blocked_id", id)) : []
    ]).then(function(res){
      var ids = res[1].map(function(msg){ return msg.org_id; });
      return (ids.length ? sbData(ON.sb.from("world_orgs").select("id,name,kind").in("id",ids)) : Promise.resolve([])).then(function(thing){ return { treaties: res[0], orgs: thing, news: res[2],blocked: res[3].length > 0 }; });
    });
  });
  var html = "<table class='data full'><tr><td style='width:110px;text-align:center'>" +remoteFlag(nat, 90,60) + "</td><td><h2 style='margin:0'>"+ esc(nat.name) + "</h2>" +(nat.motto ? "<i>&ldquo;" + esc(nat.motto) + "&rdquo;</i><br>" : "") + "<span class='small'>Last update "+ wWhen(nat.updated_at) + " (their game week " +wNum(nat.week) + ")</span></td><td style='width:100px'>" + remoteArms(nat, 80)+ "</td></tr></table>";
 html += "<table class='data full'><tr><th>Leader</th><td>" + esc(nat.title || "")+ " " + esc(nat.leader || "") + "</td><th>Party</th><td>" + esc(nat.party || "") + "</td></tr>";
  html += "<tr><th>Government</th><td>" + esc(nat.gov_type || "") + "</td><th>Ideology</th><td>" +esc(nat.ideology || "") + "</td></tr>";
  html += "<tr><th>Capital</th><td>" +esc(nat.capital || "") + "</td><th>Currency</th><td>"+ esc(nat.currency || "") +"</td></tr>";
  html += "<tr><th>Population</th><td>"+ wNum(nat.population).toFixed(1) + " million</td><th>Output per person</th><td>" +Math.round(wNum(nat.gdp_pc)).toLocaleString()+ " " + esc(String(nat.currency || "").split(" (")[0]) + "</td></tr>";
  html += "<tr><th>Growth</th><td>" + wPct(nat.growth)+ "</td><th>Inflation</th><td>" + wPct(nat.inflation) +"</td></tr>";
  html += "<tr><th>Unemployment</th><td>"+ wPct(nat.unemployment) + "</td><th>Approval</th><td>" +wPct(nat.approval, 0) + "</td></tr>";
  html += "<tr><th>Debt / GDP</th><td>" +wPct(nat.debt_ratio, 0) + "</td><th>Democracy</th><td>"+ wNum(nat.democracy) + "/100</td></tr></table>";
 if(nat.scores && nat.scores.length){ html += "<h3>Scorecard: " + (nat.score === null ? "-" : nat.score)+ "</h3><table class='data'>"; for(var i = 0; i < nat.scores.length && i < 20; i++) html += "<tr><td>" + esc(nat.scores[i].n)+ "</td><td><span class='bar' style='width:" + Math.round(wNum(nat.scores[i].s)) +"px'></span> " + wNum(nat.scores[i].s) + "</td></tr>"; html += "</table>"; }
  if(nat.about) html += "<h3>About "+ esc(nat.name) + "</h3><div style='font-family:Georgia,serif;line-height:1.5'>" +esc(nat.about).replace(/\n/g,"<br>") + "</div>";
  if(extra){
    if(extra.treaties.length) html += "<h3>Treaties in force</h3><ul>" + extra.treaties.map(function(tt){ var other = tt.a_id== id ? tt.b_id : tt.a_id, nameTxt = tt.a_id == id ? tt.b_name : tt.a_name; return "<li>" +worldTreaty(tt.kind).name + " with "+ wNation(other,nameTxt) + " <span class='small'>since " +wWhen(tt.created_at) + "</span></li>"; }).join("") + "</ul>";
    if(extra.orgs.length) html += "<h3>Member of</h3><ul>"+ extra.orgs.map(function(thing){ return "<li><a href='#world/org/" +Number(thing.id) + "'>" + esc(thing.name)+ "</a> (" + orgType(thing.kind).name + ")</li>"; }).join("") + "</ul>";
    if(extra.news.length) html += "<h3>Recent news from "+ esc(nat.name) + "</h3>" +wNewsList(extra.news,false);
  }
 if(id== myId()) return html+ "<p class='small'>This is you. <a href='#world/account'>Account settings</a></p>";
  var need = wNeedMe(); if(need) return html + need;
  html += "<h2>Talk to " + esc(nat.name) +"</h2><table class='data'><tr><th>Tone</th><td><select id='wm_tone'>" + Object.keys(TONE_NAMES).map(function(kk){ return "<option value='" + kk+ "'>" + TONE_NAMES[kk] + "</option>"; }).join("") + "</select></td></tr>";
  html += "<tr><th>Subject</th><td><input type='text' id='wm_subj' size=50 maxlength=120></td></tr><tr><th>Message</th><td><textarea id='wm_body' rows=4 cols=60 maxlength=2000></textarea></td></tr></table><p><button onclick='wSend(\"" + id+ "\")'>Send message</button></p>";
  html += "<h2>Offer a treaty</h2><p><select id='wt_kind'>" + WORLD_TREATIES.map(function(tt){ return "<option value='" + tt.id + "'>" +tt.name + " - "+ tt.about +"</option>"; }).join("") +"</select></p>";
  html += "<p><textarea id='wt_terms' rows=2 cols=60 maxlength=1000 placeholder='Terms in your own words (optional)'></textarea><br><button onclick='wPropose(\""+ id + "\")'>Send the offer</button> <span class='small'>If they accept, the treaty counts in both simulations.</span></p>";
  var mine = wcGet("myorgs", function(){ return sbData(ON.sb.from("world_orgs").select("id,name").eq("founder",myId())); });
 if(mine && mine.length) html += "<p>Invite to your organisation: <select id='wo_inv'>" + mine.map(function(thing){ return "<option value='" +Number(thing.id) + "'>" + esc(thing.name)+ "</option>"; }).join("")+ "</select> <button onclick='wInvite(\"" + id +"\")'>Invite</button></p>";
  html += "<h3>Safety</h3><p>";
  html += isMuted(id) ? "<button onclick='wMute(\"" +id + "\",false)'>Unmute</button> " : "<button onclick='wMute(\""+ id + "\",true)'>Mute</button> ";
  if(extra) html += extra.blocked ? "<button onclick='wBlock(\"" + id + "\",false)'>Unblock</button> " : "<button onclick='wBlock(\"" + id +"\",true)'>Block</button> ";
  html += "<button onclick='wReport(\"nation\",\""+ id + "\")'>Report</button></p><p class='small'>Mute hides their news and posts from you. Block stops them sending you messages, treaty offers and invitations. Report sends this nation's page to the moderators.</p>";
  return html;
}
function wSend(to){
  var bb = $("wm_body").value.trim(); if(!bb){ alert("Write something first."); return; }
  wAct(ON.sb.from("messages").insert({ to_id: to, tone: $("wm_tone").value, subject: $("wm_subj").value.trim().slice(0,120) || null, body: bb.slice(0, 2000) }), "Message sent.","mail");
}
function wPropose(to){ wAct(ON.sb.from("treaties").insert({ b_id: to,kind: $("wt_kind").value, terms: $("wt_terms").value.trim().slice(0, 1000) || null }), "Treaty offer sent. It comes into force when they accept.", "treaties,nationx,stats"); }
function wInvite(to){ wAct(ON.sb.from("org_members").insert({ org_id: Number($("wo_inv").value), nation_id: to, status: "invited" }), "Invitation sent.", "org"); }
function wMute(id,on){ var thing = onlineOpts(); thing.muted = thing.muted.filter(function(qry){ return qry !=id; }); if(on) thing.muted.push(id); onlineSetOpts(thing); wcRedraw(); }
function wBlock(id, on){ wAct(on ? ON.sb.from("blocks").insert({ blocked_id: id }) : ON.sb.from("blocks").delete().eq("blocked_id", id), on ? "Blocked." : "Unblocked.","nationx"); }
function wReport(kind, target){
  if(!ON.me){ alert("Publish your nation first."); return; }
  var why = prompt("What is wrong with it? (The moderators will see this.)"); if(why === null) return;
  wAct(ON.sb.from("reports").insert({ kind: kind, target: String(target), reason: why.slice(0, 500) }), "Thanks. The moderators will take a look.");
}

function wMail(){
 var need = wNeedMe(); if(need) return need;
  var mails = wcGet("mail",function(){ return sbData(ON.sb.from("messages").select("*").order("created_at", { ascending: false }).limit(150)); },15000);
  if(!mails) return "<p><i>Loading...</i></p>";
  var me = myId(), inbox = mails.filter(function(msg){ return msg.to_id ==me && !isMuted(msg.from_id); }), sent = mails.filter(function(msg){ return msg.from_id == me; });
  var unread = inbox.filter(function(msg){ return !msg.read_at; });
  if(unread.length){ ON.sb.from("messages").update({ read_at: new Date().toISOString() }).eq("to_id", me).is("read_at",null).then(function(){ ON.unread = 0; drawWorldBadge(); }); }
  var html = "<h2>Inbox</h2>";
 if(!inbox.length) html += "<p>No messages yet. Send one from any nation's page.</p>";
  for(var i = 0; i < inbox.length; i++){
    var msg = inbox[i];
    html += "<div class='box'"+ (!msg.read_at ? " style='border-left:4px solid #C8102E'" : "") + "><b>" + wNation(msg.from_id, msg.from_name) +"</b> &middot; " + esc(TONE_NAMES[msg.tone] || msg.tone)+ " &middot; <span class='small'>" + wWhen(msg.created_at) +"</span>";
    if(msg.subject) html += "<br><b>" + esc(msg.subject) + "</b>";
    html += "<p style='font-family:Georgia,serif'>" +esc(msg.body).replace(/\n/g, "<br>") + "</p><span class='small'><a href='#world/nation/"+ (UUID_RE.test(msg.from_id) ? msg.from_id : "") + "'>Reply</a> &middot; <a href='javascript:wMailDel(" +Number(msg.id) + ")'>Delete</a> &middot; <a href='javascript:wReport(\"message\"," + Number(msg.id)+ ")'>Report</a></span></div>";
  }
 html += "<h2>Sent</h2>";
  if(!sent.length) html += "<p>Nothing sent.</p>";
  else{ html += "<table class='data full'><tr><th>To</th><th>Message</th><th>When</th><th>Read</th></tr>"; for(var i = 0; i < sent.length && i < 40; i++){ var msg = sent[i]; html += "<tr><td>" + wNation(msg.to_id,"") + "</td><td class='small'>" + (msg.subject ? "<b>"+ esc(msg.subject) + "</b> " : "") + esc(msg.body.slice(0, 160)) + "</td><td class='small'>" + wWhen(msg.created_at)+ "</td><td>" + (msg.read_at ? "yes" : "") + "</td></tr>"; } html += "</table>"; }
  return html;
}
function wMailDel(id){ wAct(ON.sb.from("messages").delete().eq("id",id), "", "mail"); }

function wTreaties(){
 var need = wNeedMe(); if(need) return need;
  var me = myId();
  var info = wcGet("treaties", function(){ return sbData(ON.sb.from("treaties").select("*").or("a_id.eq." + me + ",b_id.eq."+ me).order("created_at", { ascending: false }).limit(100)); }, 15000);
  var invs = wcGet("invites", function(){
    return sbData(ON.sb.from("org_members").select("org_id,status").eq("nation_id",me).eq("status", "invited")).then(function(res){
      if(!res.length) return [];
      return sbData(ON.sb.from("world_orgs").select("id,name,kind,charter").in("id", res.map(function(qry){ return qry.org_id; })));
   });
  }, 15000);
  if(!info || !invs) return "<p><i>Loading...</i></p>";
  var html = "";
  var wait = info.filter(function(tt){ return tt.status== "proposed" && tt.b_id== me; });
  if(wait.length || invs.length){
    html += "<h2>Waiting for your answer</h2>";
   for(var i = 0; i < wait.length; i++){ var tt = wait[i], wt = worldTreaty(tt.kind); html += "<div class='box'><b>" + wt.name+ "</b> offered by " + wNation(tt.a_id, tt.a_name) + " <span class='small'>"+ wWhen(tt.created_at) + "</span><br><span class='small'>" +wt.about + "</span>"+ (tt.terms ? "<p><i>&ldquo;" + esc(tt.terms) +"&rdquo;</i></p>" : "") +"<p><button onclick='wTreatySet(" + Number(tt.id) + ",\"active\")'>Accept</button> <button onclick='wTreatySet("+ Number(tt.id) + ",\"declined\")'>Decline</button></p></div>"; }
    for(var i = 0; i < invs.length; i++){ var thing = invs[i]; html += "<div class='box'>Invitation to join <a href='#world/org/" +Number(thing.id) + "'><b>" + esc(thing.name)+ "</b></a> (" + orgType(thing.kind).name + ")<br><span class='small'>" + orgType(thing.kind).about + "</span>" +(thing.charter ? "<p><i>" + esc(thing.charter.slice(0, 400))+ "</i></p>" : "")+ "<p><button onclick='wOrgAccept(" + Number(thing.id) +")'>Join</button> <button onclick='wOrgLeave(" + Number(thing.id) + ",\""+ me + "\")'>Decline</button></p></div>"; }
  }
  var act = info.filter(function(tt){ return tt.status== "active"; });
  html += "<h2>Treaties in force</h2>";
  if(!act.length) html += "<p>None yet. Offer one from another nation's page.</p>";
  else{ html += "<table class='data full'><tr><th>Treaty</th><th>With</th><th>Since</th><th>Effect in your country</th><th></th></tr>"; for(var i = 0; i < act.length; i++){ var tt = act[i], wt = worldTreaty(tt.kind), other = tt.a_id== me ? tt.b_id : tt.a_id; html += "<tr><td>" + wt.name + (tt.terms ? "<br><span class='small'><i>" +esc(tt.terms.slice(0, 200)) + "</i></span>" : "") + "</td><td>"+ wNation(other, tt.a_id== me ? tt.b_name : tt.a_name) +"</td><td class='small'>" + wWhen(tt.updated_at) + "</td><td class='small'>"+ wt.about +"</td><td><button onclick='if(confirm(\"End this treaty?\"))wTreatySet(" + Number(tt.id) + ",\"ended\")'>End it</button></td></tr>"; } html += "</table>"; }
 var out = info.filter(function(tt){ return tt.status== "proposed" && tt.a_id== me; });
  if(out.length){ html += "<h2>Offers you sent</h2><ul>"; for(var i = 0; i < out.length; i++) html += "<li>"+ worldTreaty(out[i].kind).name + " to " +wNation(out[i].b_id, out[i].b_name) + " <span class='small'>" + wWhen(out[i].created_at) + "</span> <a href='javascript:wTreatySet("+ Number(out[i].id)+ ",\"cancelled\")'>withdraw</a></li>"; html += "</ul>"; }
  var old = info.filter(function(tt){ return tt.status != "proposed" && tt.status != "active"; });
  if(old.length){ html += "<h3>History</h3><table class='data'>"; for(var i = 0; i < old.length && i < 20; i++) html += "<tr><td>"+ worldTreaty(old[i].kind).name + "</td><td>" +wNation(old[i].a_id == me ? old[i].b_id : old[i].a_id,old[i].a_id== me ? old[i].b_name : old[i].a_name) + "</td><td>"+ esc(old[i].status)+ "</td><td class='small'>" + wWhen(old[i].updated_at) + "</td></tr>"; html += "</table>"; }
  html += "<h3>What each treaty does</h3><table class='data'>" + WORLD_TREATIES.map(function(tt){ return "<tr><th>"+ tt.name +"</th><td>" + tt.about+ "</td></tr>"; }).join("")+ "</table><p class='small'>You can count up to 12 treaties at once. A trade agreement is worth more with a bigger country.</p>";
  return html;
}
function wTreatySet(id, stats){ wAct(ON.sb.from("treaties").update({ status: stats }).eq("id", id),stats == "active" ? "Treaty signed. It now counts in your simulation." : "","treaties,nationx,stats"); }

function wOrgs(){
  var orgList = wcGet("orgs",function(){
    return Promise.all([sbData(ON.sb.from("world_orgs").select("*").order("created_at", { ascending: false }).limit(100)), sbData(ON.sb.from("org_members").select("org_id,nation_id,status").limit(3000))]).then(function(res){
      var cfg = {},mine = {};
      res[1].forEach(function(msg){ if(msg.status== "member") cfg[msg.org_id] = (cfg[msg.org_id] || 0) + 1; if(msg.nation_id == myId()) mine[msg.org_id] = msg.status; });
      return res[0].map(function(thing){ thing.count = cfg[thing.id] || 0; thing.mine = mine[thing.id] || ""; return thing; });
   });
  });
  if(!orgList) return "<p><i>Loading...</i></p>";
  var html = "<p>Organisations founded by players. Members get the organisation's effect in their own simulation, stronger with more members (full strength at 4).</p>";
  html += "<table class='data full'><tr><th>Organisation</th><th>Kind</th><th>Members</th><th>Entry</th><th>You</th></tr>";
  for(var i = 0; i < orgList.length; i++){ var thing = orgList[i]; html += "<tr><td><a href='#world/org/" + Number(thing.id) + "'><b>"+ esc(thing.name) + "</b></a></td><td>" +orgType(thing.kind).name + "</td><td class='num'>"+ thing.count +"</td><td>" + (thing.open ? "open to all" : "by invitation") + "</td><td>" + esc(thing.mine)+ "</td></tr>"; }
  if(!orgList.length) html += "<tr><td colspan=5>None yet. Be the first.</td></tr>";
 html += "</table>";
  var need = wNeedMe(); if(need) return html + need;
  html += "<h2>Found a world organisation</h2><table class='data'><tr><th>Name</th><td><input type='text' id='wo_name' size=40 maxlength=60></td></tr>";
  html += "<tr><th>Kind</th><td><select id='wo_kind'>" + ORG_TYPES.map(function(tt){ return "<option value='" +tt.id + "'>"+ tt.name +" - " + tt.about+ "</option>"; }).join("")+ "</select></td></tr>";
  html += "<tr><th>Charter</th><td><textarea id='wo_charter' rows=3 cols=60 maxlength=2000 placeholder='What it stands for'></textarea></td></tr>";
  html += "<tr><th>Entry</th><td><label><input type='checkbox' id='wo_open'> anyone can join without an invitation</label></td></tr></table><p><button onclick='wOrgFound()'>Found it</button></p>";
  return html;
}
function wOrgFound(){
  var nameTxt = $("wo_name").value.trim(); if(nameTxt.length < 3){ alert("Give it a name of at least 3 letters."); return; }
  sbData(ON.sb.from("world_orgs").insert({ name: nameTxt,kind: $("wo_kind").value, charter: $("wo_charter").value.trim() || null,open: $("wo_open").checked }).select("id").single()).then(function(thing){
    return wAct(ON.sb.from("org_members").insert({ org_id: thing.id, nation_id: myId(), status: "member" }), "Founded. Invite nations from their pages.", "orgs,myorgs,stats").then(function(){ onlineSyncLinks(); go("world/org/" + Number(thing.id)); });
  }, function(err){ alert(errText(err)); });
}
function wOrgPage(id){
  id = Number(id); if(!id) return "<p>No such organisation.</p>";
  var stuff = wcGet("org:"+ id,function(){
    return Promise.all([sbData(ON.sb.from("world_orgs").select("*").eq("id", id).maybeSingle()), sbData(ON.sb.from("org_members").select("*").eq("org_id", id).order("created_at"))]).then(function(res){ return { o: res[0], m: res[1] }; });
  });
  if(!stuff) return "<p><i>Loading...</i></p>";
  var thing = stuff.o; if(!thing) return "<p>This organisation has been dissolved.</p>";
 var me = myId(), boss = thing.founder ==me, mine = null;
  for(var i = 0; i < stuff.m.length; i++) if(stuff.m[i].nation_id == me) mine = stuff.m[i];
  var info = orgType(thing.kind), mem = stuff.m.filter(function(msg){ return msg.status == "member"; });
  var html = "<h2>" + esc(thing.name) + "</h2><p>"+ info.name +" &middot; founded " + wWhen(thing.created_at) + " by "+ wNation(thing.founder, (stuff.m.filter(function(msg){ return msg.nation_id == thing.founder; })[0] || {}).nation_name || "its founder") + " &middot; " +(thing.open ? "open to all" : "by invitation") +"</p>";
  html += "<p class='small'>"+ info.about +" Strength now: " + Math.round(Math.min(1, mem.length / 4) * 100) + "%. Fee: half the usual membership fee.</p>";
  if(thing.charter) html += "<div class='box' style='font-family:Georgia,serif'>" + esc(thing.charter).replace(/\n/g,"<br>") + "</div>";
  html += "<h3>Members (" + mem.length + ")</h3><ul>";
 for(var i = 0; i < stuff.m.length; i++){ var msg = stuff.m[i]; html += "<li>" + wNation(msg.nation_id, msg.nation_name) + (msg.status != "member" ? " <i>(" + msg.status + ")</i>" : "") + (boss && msg.status== "applied" ? " <button onclick='wOrgApprove(" + id +",\"" + msg.nation_id+ "\")'>Approve</button>" : "")+ (boss && msg.nation_id!= me ? " <a class='small' href='javascript:wOrgLeave(" + id + ",\""+ msg.nation_id +"\")'>(remove)</a>" : "") +"</li>"; }
  html += "</ul>";
  if(!ON.me) return html + wNeedMe();
  if(boss){
    html += "<h3>You run this organisation</h3><p><textarea id='wo_ch' rows=3 cols=60 maxlength=2000>" +esc(thing.charter || "") + "</textarea><br><label><input type='checkbox' id='wo_op'"+ (thing.open ? " checked" : "")+ "> open to all</label> <button onclick='wOrgEdit(" + id +")'>Save</button></p>";
    html += "<p class='small'>Invite nations from their own page. </p><p><button onclick='if(confirm(\"Dissolve the organisation for every member?\"))wOrgEnd("+ id + ")'>Dissolve it</button></p>";
  }else if(mine && mine.status =="member") html += "<p><button onclick='wOrgLeave("+ id + ",\"" +me + "\")'>Leave</button></p>";
 else if(mine && mine.status == "invited") html += "<p><button onclick='wOrgAccept(" + id+ ")'>Accept the invitation</button></p>";
  else if(mine) html += "<p><i>Your application is waiting for the founder.</i> <a href='javascript:wOrgLeave(" + id + ",\""+ me + "\")'>withdraw</a></p>";
  else html += "<p><button onclick='wOrgJoin(" +id + "," + (thing.open ? 1 : 0) + ")'>"+ (thing.open ? "Join" : "Apply to join")+ "</button></p>";
  html += "<p class='small'><a href='javascript:wReport(\"org\"," + id + ")'>Report this organisation</a></p>";
  return html;
}
function wOrgJoin(id,open){ wAct(ON.sb.from("org_members").insert({ org_id: id, nation_id: myId(), status: open ? "member" : "applied" }), open ? "You joined." : "Application sent.", "org,orgs").then(onlineSyncLinks); }
function wOrgAccept(id){ wAct(ON.sb.from("org_members").update({ status: "member" }).eq("org_id", id).eq("nation_id", myId()), "You joined.","org,orgs,invites").then(onlineSyncLinks); }
function wOrgApprove(id, nat){ wAct(ON.sb.from("org_members").update({ status: "member" }).eq("org_id", id).eq("nation_id",nat), "Approved.", "org,orgs"); }
function wOrgLeave(id, nat){ wAct(ON.sb.from("org_members").delete().eq("org_id",id).eq("nation_id", nat), "","org,orgs,invites").then(onlineSyncLinks); }
function wOrgEdit(id){ wAct(ON.sb.from("world_orgs").update({ charter: $("wo_ch").value.trim() || null,open: $("wo_op").checked }).eq("id", id), "Saved.","org"); }
function wOrgEnd(id){ wAct(ON.sb.from("world_orgs").delete().eq("id", id),"Dissolved.", "org,orgs,myorgs").then(function(){ onlineSyncLinks(); go("world/orgs"); }); }

function wNewsList(list, actions){
  if(!list.length) return "<p>No news yet.</p>";
 var html = "";
  for(var i = 0; i < list.length; i++){
    var nat = list[i];
    html += "<div class='box'><span class='small'>" + (nat.kind== "event" ? "NEWS WIRE" : "PRESS RELEASE")+ " &middot; " + wNation(nat.author,nat.nation_name) + " &middot; "+ wWhen(nat.created_at) + "</span><br><b>" +esc(nat.title) + "</b>";
    if(nat.body) html += "<p style='font-family:Georgia,serif;margin:4px 0'>" + esc(nat.body).replace(/\n/g, "<br>") + "</p>";
    if(actions) html += "<span class='small'>" + (nat.author == myId() || ON.admin ? "<a href='javascript:wNewsDel(" + Number(nat.id) +")'>delete</a> &middot; " : "") +"<a href='javascript:wReport(\"news\"," + Number(nat.id) + ")'>report</a></span>";
    html += "</div>";
 }
  return html;
}
function wNews(){
  var list = wcGet("news:all", function(){ return sbData(ON.sb.from("world_news").select("*").order("created_at", { ascending: false }).limit(60)); });
  var html = "";
  if(ON.me){
   var thing = onlineOpts();
    html += "<h2>Issue a press release</h2><p><input type='text' id='wn_title' size=60 maxlength=160 placeholder='Headline'><br><textarea id='wn_body' rows=3 cols=60 maxlength=3000 placeholder='What you want the world to know'></textarea><br><button onclick='wNewsPost()'>Publish</button> <label class='small'><input type='checkbox' id='wn_auto'"+ (thing.events ? " checked" : "")+ " onchange='wOpt(\"events\",this.checked)'> also share my country's big events (elections, wars, new laws) automatically</label></p>";
  }
  html += "<h2>World news</h2>";
  if(!list) return html+ "<p><i>Loading...</i></p>";
  return html+ wNewsList(list.filter(function(nat){ return !isMuted(nat.author); }), true);
}
function wNewsPost(){ var tt = $("wn_title").value.trim(); if(!tt){ alert("Write a headline."); return; } wAct(ON.sb.from("world_news").insert({ kind: "press", title: tt.slice(0, 160), body: $("wn_body").value.trim().slice(0, 3000) || null, game_week: game ? game.week : null }), "Published.", "news"); }
function wNewsDel(id){ if(confirm("Delete this news item?")) wAct(ON.sb.from("world_news").delete().eq("id", id),"Deleted.", "news"); }
function wOpt(kk, val){ var thing = onlineOpts(); thing[kk] = val; onlineSetOpts(thing); }

function wForum(board){
  var boardx = null; for(var i = 0; i < FORUM_BOARDS.length; i++) if(FORUM_BOARDS[i][0]== board) boardx = FORUM_BOARDS[i];
  var html = "<p>Boards: " +(boardx ? "<a href='#world/forum'>All</a>" : "<b>All</b>") + FORUM_BOARDS.map(function(bb){ return " | " +(boardx && boardx[0]== bb[0] ? "<b>" +bb[1] +"</b>" : "<a href='#world/forum/" + bb[0] + "'>"+ bb[1]+ "</a>"); }).join("") + "</p>";
  var list = wcGet("forum:"+ (boardx ? boardx[0] : ""),function(){ var qry = ON.sb.from("forum_threads").select("*"); if(boardx) qry = qry.eq("board", boardx[0]); return sbData(qry.order("pinned",{ ascending: false }).order("last_post_at", { ascending: false }).limit(60)); });
 if(!list) return html +"<p><i>Loading...</i></p>";
  html += "<table class='data full'><tr><th>Topic</th><th>Started by</th><th>Replies</th><th>Last post</th></tr>";
  list = list.filter(function(tt){ return !isMuted(tt.author); });
  for(var i = 0; i < list.length; i++){ var tt = list[i]; html += "<tr><td>" + (tt.pinned ? "&#128204; " : "") + (tt.locked ? "&#128274; " : "") + "<a href='#world/thread/" +Number(tt.id) + "'><b>" + esc(tt.title)+ "</b></a>" + (boardx ? "" : " <span class='small'>(" +esc(tt.board) + ")</span>") +"</td><td>" + wNation(tt.author, tt.nation_name) + "</td><td class='num'>" +Math.max(0, wNum(tt.posts) - 1)+ "</td><td class='small'>" + wWhen(tt.last_post_at) +"</td></tr>"; }
  if(!list.length) html += "<tr><td colspan=4>No topics yet.</td></tr>";
  html += "</table>";
  if(!ON.me) return html + wNeedMe();
 html += "<h2>Start a topic</h2><table class='data'><tr><th>Board</th><td><select id='wf_board'>"+ FORUM_BOARDS.map(function(bb){ return "<option value='" + bb[0] + "'" +(boardx && boardx[0]== bb[0] ? " selected" : "") + ">" +bb[1] +"</option>"; }).join("") +"</select></td></tr>";
  html += "<tr><th>Title</th><td><input type='text' id='wf_title' size=60 maxlength=120></td></tr><tr><th>Post</th><td><textarea id='wf_body' rows=5 cols=60 maxlength=4000></textarea></td></tr></table><p><button onclick='wThreadNew()'>Post it</button></p>";
  return html;
}
function wThreadNew(){
  var tt = $("wf_title").value.trim(), bb = $("wf_body").value.trim();
  if(tt.length < 3 || !bb){ alert("Write a title (3+ letters) and a first post."); return; }
 sbData(ON.sb.from("forum_threads").insert({ board: $("wf_board").value, title: tt.slice(0, 120) }).select("id").single()).then(function(thr){
    return sbData(ON.sb.from("forum_posts").insert({ thread_id: thr.id,body: bb.slice(0,4000) })).then(function(){ wcClear("forum"); go("world/thread/" +Number(thr.id)); });
  }, function(err){ alert(errText(err)); });
}
function wThread(id){
  id = Number(id); if(!id) return "<p>No such topic.</p>";
  var stuff = wcGet("thread:" + id, function(){
   return Promise.all([sbData(ON.sb.from("forum_threads").select("*").eq("id", id).maybeSingle()), sbData(ON.sb.from("forum_posts").select("*").eq("thread_id", id).order("created_at").limit(300))]).then(function(res){ return { t: res[0], p: res[1] }; });
  },15000);
  if(!stuff) return "<p><i>Loading...</i></p>";
  if(!stuff.t) return "<p>This topic was deleted.</p>";
  var tt = stuff.t,html = "<h2>" +(tt.pinned ? "&#128204; " : "") +(tt.locked ? "&#128274; " : "") +esc(tt.title) + "</h2><p class='small'><a href='#world/forum/" + esc(tt.board)+ "'>&laquo; back to the board</a></p>";
  for(var i = 0; i < stuff.p.length; i++){
    var bit = stuff.p[i];
   if(isMuted(bit.author)){ html += "<div class='box small'><i>A post from a muted nation is hidden.</i></div>"; continue; }
    html += "<div class='box'><b>" + wNation(bit.author, bit.nation_name) + "</b> <span class='small'>"+ wWhen(bit.created_at) + "</span><p style='margin:4px 0'>" +esc(bit.body).replace(/\n/g, "<br>") + "</p><span class='small'>"+ (bit.author ==myId() || ON.admin ? "<a href='javascript:wPostDel("+ Number(bit.id) + "," +id + ")'>delete</a> &middot; " : "") + "<a href='javascript:wReport(\"post\"," + Number(bit.id)+ ")'>report</a></span></div>";
  }
  if(ON.admin) html += "<p class='small'>Admin: <a href='javascript:wPin(" + id+ "," + !tt.pinned + "," +tt.locked + ")'>"+ (tt.pinned ? "unpin" : "pin")+ "</a> &middot; <a href='javascript:wPin(" + id +"," + tt.pinned+ "," + !tt.locked + ")'>" +(tt.locked ? "unlock" : "lock") +"</a> &middot; <a href='javascript:wThreadDel(" + id + ")'>delete topic</a></p>";
  else if(tt.author ==myId()) html += "<p class='small'><a href='javascript:wThreadDel("+ id + ")'>Delete your topic</a></p>";
  if(tt.locked) return html + "<p><i>This topic is locked.</i></p>";
  if(!ON.me) return html+ wNeedMe();
 html += "<h3>Reply</h3><p><textarea id='wf_reply' rows=4 cols=60 maxlength=4000></textarea><br><button onclick='wReply(" + id+ ")'>Post reply</button></p>";
  return html;
}
function wReply(id){ var bb = $("wf_reply").value.trim(); if(!bb) return; wAct(ON.sb.from("forum_posts").insert({ thread_id: id, body: bb.slice(0, 4000) }), "", "thread,forum"); }
function wPostDel(bit, tt){ if(confirm("Delete this post?")) wAct(ON.sb.from("forum_posts").delete().eq("id", bit), "Deleted.","thread"); }
function wThreadDel(id){ if(!confirm("Delete the whole topic?")) return; wAct(ON.sb.from("forum_threads").delete().eq("id", id), "Topic deleted.","forum,thread").then(function(){ go("world/forum"); }); }
function wPin(id, pin, lock){ wAct(ON.sb.rpc("admin_thread", { thread: id, set_pinned: pin, set_locked: lock }), "Done.", "thread,forum"); }

function wAccount(){
  var html = "";
  if(ON.user){
    var anon = ON.user.is_anonymous || !ON.user.email;
    html += "<h2>Your account</h2><table class='data'><tr><th>Signed in as</th><td>"+ (anon ? "Guest (this browser only)" : esc(ON.user.email))+ "</td></tr><tr><th>Player ID</th><td><code>" + esc(ON.user.id) + "</code></td></tr>" + (ON.admin ? "<tr><th>Role</th><td>Moderator</td></tr>" : "") + "</table>";
    if(anon) html += "<div class='box'><b>Keep this account forever</b><br>Add your email so you can sign in on other devices and never lose your nation.<br><input type='email' id='wa_email' placeholder='you@example.com' size=30> <button onclick='wUpgrade()'>Save</button></div>";
    var thing = onlineOpts();
   html += "<h3>Options</h3><p><label><input type='checkbox'" +(thing.auto ? " checked" : "") +" onchange='wOpt(\"auto\",this.checked)'> publish my nation automatically after each turn</label><br><label><input type='checkbox'" + (thing.events ? " checked" : "") + " onchange='wOpt(\"events\",this.checked)'> share my country's big events in the world news</label></p>";
    if(thing.muted.length) html += "<p>Muted nations: "+ thing.muted.map(function(msg){ return wNation(msg, "nation") +" <a class='small' href='javascript:wMute(\"" + msg + "\",false)'>(unmute)</a>"; }).join(", ") + "</p>";
    html += "<p><button onclick='wSignOut()'>Sign out</button>" +(ON.me ? " <button onclick='wDeleteNation()'>Delete my nation from the world</button>" : "") +"</p>";
  }else return wHome();
  return html;
}
function wUpgrade(){
  var emailTxt = $("wa_email").value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTxt)){ alert("That doesn't look like an email address."); return; }
 ON.sb.auth.updateUser({ email: emailTxt }).then(function(res){ if(res.error) alert(errText(res.error)); else{ ON.user = res.data.user; wFlash = "Nearly done: open the email we just sent and tap the link to confirm it."; wcRedraw(); } });
}
function wSignOut(){ ON.sb.auth.signOut().then(function(){ ON.user = null; ON.me = null; ON.admin = false; ON.unread = ON.todo = 0; wcClear(); drawWorldBadge(); go("world"); }); }
function wDeleteNation(){
  if(!confirm("Delete your nation from the online world? Your messages, treaties, posts and organisations go with it. Your game itself stays.")) return;
  sbData(ON.sb.from("nations").delete().eq("id", myId())).then(function(){ ON.me = null; if(game) delete game.online; if(typeof lawsRefresh == "function") lawsRefresh(); autosave(); wcClear(); wFlash = "Your nation was removed from the world."; go("world"); }, function(err){ alert(errText(err)); });
}

function wAdmin(){
  if(!ON.admin) return "<p>Moderators only.</p>";
  var reps = wcGet("reports",function(){ return sbData(ON.sb.from("reports").select("*").eq("done", false).order("created_at",{ ascending: false }).limit(100)); }, 15000);
  var boardx = wcGet("bans", function(){ return sbData(ON.sb.from("bans").select("*").order("created_at", { ascending: false }).limit(100)); }, 15000);
  if(!reps || !boardx) return "<p><i>Loading...</i></p>";
  var html = "<h2>Reports (" +reps.length + ")</h2>";
  if(!reps.length) html += "<p>Nothing to check.</p>";
 for(var i = 0; i < reps.length; i++){
    var res = reps[i], del = ["nation", "news", "thread", "post", "org"].indexOf(res.kind) >= 0;
    html += "<div class='box'><b>" + esc(res.kind)+ "</b> by " + wNation(res.target_user,"this player") + " &middot; <span class='small'>" + wWhen(res.created_at)+ "</span><br>Reason: <i>" + esc(res.reason || "") + "</i><div class='small' style='background:#F4F4F4;padding:4px;margin:4px 0'>" + esc(res.snapshot || "").replace(/\n/g, "<br>") +"</div>";
    html += (del ? "<button onclick='wModDel(\"" + esc(res.kind)+ "\",\"" + esc(res.target) +"\"," + Number(res.id) + ")'>Delete it</button> " : "") + "<button onclick='wBan(\""+ (UUID_RE.test(res.target_user) ? res.target_user : "") + "\"," +Number(res.id) + ")'>Ban the player</button> <button onclick='wRepDone(" + Number(res.id)+ ")'>Nothing wrong</button></div>";
  }
  html += "<h2>Bans</h2>";
  if(!boardx.length) html += "<p>Nobody is banned.</p>";
 else{ html += "<table class='data'><tr><th>Player</th><th>Reason</th><th>Until</th><th></th></tr>"; for(var i = 0; i < boardx.length; i++) html += "<tr><td>" +wNation(boardx[i].user_id, String(boardx[i].user_id).slice(0,8)) + "</td><td>" + esc(boardx[i].reason || "")+ "</td><td>" + (boardx[i].until ? esc(new Date(boardx[i].until).toLocaleString()) : "forever") + "</td><td><button onclick='wUnban(\"" + (UUID_RE.test(boardx[i].user_id) ? boardx[i].user_id : "") + "\")'>Lift</button></td></tr>"; html += "</table>"; }
  html += "<h2>Housekeeping</h2><p>The free database holds 500 MB. Clean-up removes messages older than 6 months, world news older than 4 months, finished treaties and closed reports. <button onclick='wCleanup()'>Clean up now</button></p>";
  return html;
}
function wModDel(kind, target,rep){
  if(!confirm("Delete this " + kind+ "?")) return;
  var tt = { nation: "nations", news: "world_news", thread: "forum_threads", post: "forum_posts", org: "world_orgs" }[kind];
 sbData(ON.sb.from(tt).delete().eq("id",target)).then(function(){ return wAct(ON.sb.from("reports").update({ done: true }).eq("id", rep), "Deleted.","reports,news,forum,thread,orgs,nation"); }, function(err){ alert(errText(err)); });
}
function wBan(uid, rep){
  if(!uid) return;
  var days = prompt("Ban for how many days? (0 = forever)","7"); if(days === null) return;
  var why = prompt("Reason (the player sees this):", "Breaking the rules") || "";
  days = parseInt(days, 10) || 0;
 sbData(ON.sb.from("bans").upsert({ user_id: uid,reason: why.slice(0,300), until: days > 0 ? new Date(Date.now() +days * 86400000).toISOString() : null }, { onConflict: "user_id" })).then(function(){
    return wAct(ON.sb.from("reports").update({ done: true }).eq("id", rep),"Banned.", "reports,bans");
  }, function(err){ alert(errText(err)); });
}
function wUnban(uid){ if(uid) wAct(ON.sb.from("bans").delete().eq("user_id", uid),"Ban lifted.", "bans"); }
function wRepDone(id){ wAct(ON.sb.from("reports").update({ done: true }).eq("id",id), "", "reports"); }
function wCleanup(){ sbData(ON.sb.rpc("admin_cleanup")).then(function(res){ alert(res); wcClear(); wcRedraw(); },function(err){ alert(errText(err)); }); }
