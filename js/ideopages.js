var ideoDraft = null;
function dimBar(v, mark, mark2) {
  var h = "<div style='position:relative;width:220px;height:14px;background:linear-gradient(90deg,#d8e2f0,#f2f2f2,#f6e0d8);border:1px solid #999;display:inline-block;vertical-align:middle'>";
  if (mark2 !== undefined) h += "<div title='When you took office' style='position:absolute;left:" + (mark2 * 2.2 - 1) + "px;top:0;width:2px;height:14px;background:#888'></div>";
  if (mark !== undefined) h += "<div title='The country now' style='position:absolute;left:" + (mark * 2.2 - 4) + "px;top:2px;width:8px;height:8px;border-radius:4px;background:#C8102E'></div>";
  h += "<div title='Your ideology' style='position:absolute;left:" + (v * 2.2 - 3) + "px;top:-2px;width:6px;height:16px;background:#17345B'></div>";
  return h + "</div>";
}
function moodWord(x) { return x >= 70 ? "<span class='good'>happy</span>" : (x >= 45 ? "content" : (x >= 25 ? "<span class='bad'>unhappy</span>" : "<b class='bad'>furious</b>")); }
PAGES.ideology = function () {
  var g = game, mv = ensureMovement(g), I = mv.ideology;
  if (!ideoDraft || ideoDraft.week != g.week) ideoDraft = { week: g.week, name: I.name, about: I.about, manifesto: I.manifesto, dims: I.dims.slice(), mix: (I.mix || []).slice() };
  var D = ideoDraft;
  var h = title("Ideology and Manifesto");
  h += "<p>What does your movement believe? Start from real political traditions, mix them, rename the result, or set every dial yourself. Your ideology moves your party's position (and so which voters like you), decides what your members expect, and shows up in the Scorecard as a report card: are you actually doing what you said?</p>";
  h += "<div class='box'><b style='font-size:15px'>" + esc(I.name) + "</b> &middot; " + esc(playerParty(g).name) + "<br>" + (I.about ? "<i>" + esc(I.about) + "</i><br>" : "");
  h += "Delivering on it: <b>" + Math.round(mv.delivery || 50) + "/100</b> &middot; Credibility: <b>" + Math.round(mv.cred) + "/100</b> &middot; Times changed: " + I.changes + " &middot; <a href='#scorecard'>full report card &raquo;</a></div>";
  var P = ideoProgress(g);
  h += "<h2>Where you stand</h2><p class='small'>Blue bar = your ideology. Red dot = where the country is now. Grey line = where it was when you took office.</p><table class='data'>";
  for (var i = 0; i < P.length; i++) {
    var d = IDEO_DIMS[i];
    h += "<tr><td><b>" + d.name + "</b></td><td class='small' style='text-align:right'>" + d.lo + "</td><td>" + dimBar(P[i].ideal, P[i].now, P[i].start) + "</td><td class='small'>" + d.hi + "</td><td class='small'>" + (P[i].progress > 0.5 ? "<span class='good'>delivered</span>" : (P[i].progress > 0.1 ? "moving" : (P[i].progress < -0.1 ? "<span class='bad'>going backwards</span>" : "stalled"))) + "</td></tr>";
  }
  h += "</table>";
  h += "<h2>Build or change your ideology</h2>";
  var free = freeIdeologyChange(g);
  h += "<p class='small'>" + (free ? "<b>Free for your first 4 weeks.</b> After that, changing your ideology costs credibility (voters and members notice U-turns) and annoys the Purists." : "Changing it now costs credibility. Small tweaks are cheap, big jumps are expensive.") + "</p>";
  h += "<h3>1. Mix traditions (optional)</h3><p class='small'>Give a weight to one or more traditions and press Blend. This fills in the dials below.</p><table class='data'><tr><th>Tradition</th><th>Weight</th><th>About</th></tr>";
  for (var i = 0; i < IDEO_TEMPLATES.length; i++) {
    var T = IDEO_TEMPLATES[i], w = 0;
    for (var j = 0; j < D.mix.length; j++) if (D.mix[j].t == T.id) w = D.mix[j].w;
    h += "<tr><td>" + T.name + "</td><td><input type='number' id='mix_" + T.id + "' value='" + w + "' min=0 max=100 step=10 style='width:55px'></td><td class='small'>" + T.about + "</td></tr>";
  }
  h += "</table><p><button onclick='ideoBlend()'>Blend these &raquo;</button> <button onclick='ideoClearMix()'>Clear weights</button></p>";
  h += "<h3>2. Set the dials</h3><table class='data'>";
  for (var i = 0; i < IDEO_DIMS.length; i++) {
    var d = IDEO_DIMS[i];
    h += "<tr><td><b>" + d.name + "</b></td><td class='small' style='text-align:right;width:150px'>" + d.lo + "</td><td><input type='range' id='dim_" + i + "' min=0 max=100 value='" + D.dims[i] + "' oninput='ideoDial()' style='width:200px'> <span id='dimv_" + i + "'>" + D.dims[i] + "</span></td><td class='small' style='width:150px'>" + d.hi + "</td></tr>";
  }
  h += "</table><div id='ideo_preview' class='notice'>" + ideoPreviewText() + "</div>";
  h += "<h3>3. Name it and write your manifesto</h3><table class='data'>";
  h += "<tr><th>Name of your ideology</th><td><input type='text' id='ideo_name' value='" + esc(D.name) + "' size=40 maxlength=60></td></tr>";
  h += "<tr><th>One line about it</th><td><input type='text' id='ideo_about' value='" + esc(D.about) + "' size=70 maxlength=300></td></tr>";
  h += "<tr><th>Manifesto<br><span class='small'>(your own words)</span></th><td><textarea id='ideo_manifesto' rows=6 cols=70 maxlength=3000>" + esc(D.manifesto) + "</textarea></td></tr></table>";
  h += "<p><button class='big' onclick='ideoSave()'>Adopt this ideology</button></p>";
  h += "<h2>Manifesto promises</h2><p>Make up to 5 concrete promises. Voters judge you on them as the next election gets closer, and at every election each one is marked kept or broken. Kept promises build credibility; broken ones cost it. Promises marked &#9733; fit your ideology, and your members like those best.</p>";
  var open = mv.commitments.filter(function (c) { return c.status == "open"; });
  if (open.length) {
    h += "<table class='data full'><tr><th>Promise</th><th>Made</th><th>Now</th><th>Status</th><th></th></tr>";
    for (var i = 0; i < open.length; i++) {
      var c = open[i], ci = commitInfo(c.id), on = commitOnTrack(g, c);
      h += "<tr><td>" + esc(commitText(c)) + (c.forParty ? " <span class='small'>(coalition deal with " + esc(c.forParty) + ")</span>" : "") + "</td><td>" + weekDate(g, c.made) + "</td><td>" + ci.fmt(ci.now(g, c)) + "</td><td>" + (on ? "<span class='good'>on track</span>" : "<span class='bad'>off track</span>") + "</td>";
      h += "<td><a href='javascript:dropCommit(" + mv.commitments.indexOf(c) + ")'>drop it</a></td></tr>";
    }
    h += "</table>";
  } else h += "<p><i>No promises yet.</i></p>";
  if (open.length < 5) {
    var I2 = dimsObj(mv.ideology.dims);
    h += "<p>Add a promise: <select id='cm_id' onchange='cmDefault()'>";
    for (var i = 0; i < COMMITMENTS.length; i++) {
      var C = COMMITMENTS[i], fit = 0;
      for (var k in C.dims) fit += C.dims[k] * (I2[k] - 50);
      h += "<option value='" + C.id + "'>" + (fit > 15 ? "&#9733; " : "") + C.name.replace("{p}", "...") + "</option>";
    }
    h += "</select> number: <input type='number' id='cm_p' style='width:60px' value='" + COMMITMENTS[0].def(g) + "'> <button onclick='addCommit()'>Promise it</button></p>";
  }
  var past = mv.pastCommitments.filter(function (c) { return c.status != "open"; });
  if (past.length) {
    h += "<h3>Past promises</h3><table class='data'><tr><th>Promise</th><th>Result</th></tr>";
    for (var i = past.length - 1; i >= 0 && i >= past.length - 12; i--) h += "<tr><td>" + esc(commitText(past[i])) + "</td><td>" + (past[i].status == "kept" ? "<span class='good'>kept</span>" : (past[i].status == "dropped" ? "dropped" : "<span class='bad'>broken</span>")) + "</td></tr>";
    h += "</table>";
  }
  return h;
};
function ideoReadDraft() {
  var D = ideoDraft;
  for (var i = 0; i < 9; i++) if ($("dim_" + i)) D.dims[i] = parseInt($("dim_" + i).value);
  if ($("ideo_name")) { D.name = $("ideo_name").value; D.about = $("ideo_about").value; D.manifesto = $("ideo_manifesto").value; }
  D.mix = [];
  for (var i = 0; i < IDEO_TEMPLATES.length; i++) { var el = $("mix_" + IDEO_TEMPLATES[i].id); if (el && parseFloat(el.value) > 0) D.mix.push({ t: IDEO_TEMPLATES[i].id, w: parseFloat(el.value) }); }
}
function ideoPreviewText() {
  var g = game, D = ideoDraft, p = partyPosFromDims(D.dims), now = playerParty(g);
  var near = nearestTemplate(p.econ, p.social);
  var cost = ideologyChangeCost(g, D.dims);
  return "Your party would sit at <b>" + p.econ + "</b> on the left-right economic scale (now " + Math.round(now.econ) + ") and <b>" + p.social + "</b> on the traditional-liberal scale (now " + Math.round(now.social) + "). Closest tradition: " + near.name + ". " +
    (cost ? "Adopting it now costs about <b>" + cost + " credibility</b>." : "No credibility cost.");
}
function ideoDial() { ideoReadDraft(); for (var i = 0; i < 9; i++) $("dimv_" + i).innerHTML = ideoDraft.dims[i]; $("ideo_preview").innerHTML = ideoPreviewText(); }
function ideoBlend() {
  ideoReadDraft();
  if (!ideoDraft.mix.length) { alert("Give at least one tradition a weight first."); return; }
  ideoDraft.dims = blendDims(ideoDraft.mix);
  var names = ideoDraft.mix.slice().sort(function (a, b) { return b.w - a.w; }).map(function (m) { return ideoTemplate(m.t).name; });
  if (ideoDraft.name == game.movement.ideology.name) ideoDraft.name = names.length == 1 ? names[0] : names.slice(0, 2).join("-").replace(/ /g, " ") + " synthesis";
  route();
}
function ideoClearMix() { ideoReadDraft(); ideoDraft.mix = []; route(); }
function ideoSave() {
  ideoReadDraft();
  var g = game, cost = ideologyChangeCost(g, ideoDraft.dims);
  if (cost && !confirm("Adopting this ideology will cost about " + cost + " credibility and upset purists. Go ahead?")) return;
  var free = freeIdeologyChange(g);
  setIdeology(g, ideoDraft, free);
  g.movement.custom = true;
  g.commandLog.push({ week: g.week, cmd: "ideology", name: ideoDraft.name });
  ideoDraft = null;
  autosave(); route();
}
function cmDefault() { var c = commitInfo($("cm_id").value); $("cm_p").value = c.def(game); }
function addCommit() {
  var g = game, mv = g.movement, id = $("cm_id").value;
  for (var i = 0; i < mv.commitments.length; i++) if (mv.commitments[i].id == id && mv.commitments[i].status == "open") { alert("You already made that promise."); return; }
  var c = makeCommit(g, id, $("cm_p").value);
  mv.commitments.push(c);
  addEvent(g, "pledge", 1, g.leaderName + " promises: " + commitText(c).charAt(0).toLowerCase() + commitText(c).slice(1), { promise: commitText(c), quote: "This is a promise to the people of " + g.country.name + ". Judge us on it." }, "A manifesto commitment.", 0);
  g.commandLog.push({ week: g.week, cmd: "commit", id: id });
  autosave(); route();
}
function dropCommit(i) {
  var g = game, c = g.movement.commitments[i];
  if (!c || !confirm("Drop this promise? It costs 3 credibility.")) return;
  c.status = "dropped"; c.closed = g.week; g.movement.cred = Math.max(0, g.movement.cred - 3);
  g.movement.pastCommitments.push(c); g.movement.commitments.splice(i, 1);
  autosave(); route();
}

PAGES.movement = function () {
  var g = game, mv = ensureMovement(g), me = playerParty(g);
  var h = title("Party and Movement");
  h += "<table class='data'><tr><td style='width:90px;text-align:center;font-size:44px;background:" + esc(mv.colors[0]) + ";color:" + esc(mv.colors[1]) + "'>" + mv.symbol + "</td><td>";
  h += "<b style='font-size:16px'>" + esc(me.name) + "</b><br>" + esc(mv.ideology.name) + (mv.slogan ? "<br><i>&ldquo;" + esc(mv.slogan) + "&rdquo;</i>" : "") + "<br>Leader: " + esc(g.leaderName) + " &middot; Newspaper: " + esc(mv.paper) + "</td></tr></table>";
  h += "<h2>How the movement is doing</h2><table class='data'>";
  h += "<tr><th>Members</th><td class='num'>" + Math.round(mv.members).toLocaleString() + "</td><td class='small'>Grow with enthusiasm and approval. More members = more money and more doorsteps.</td></tr>";
  h += "<tr><th>Party funds</th><td class='num'>" + money(g, mv.funds) + "</td><td class='small'>From members' dues" + (g.stake && g.stake.business && g.stake.business.rel > 40 ? " and business donations" : "") + ". Spent on campaigns below. Not government money.</td></tr>";
  h += "<tr><th>Enthusiasm</th><td class='num'>" + Math.round(mv.enthusiasm) + "/100</td><td class='small'>Falls if you are unpopular, break promises or ignore your ideology. Very low enthusiasm invites a leadership challenge.</td></tr>";
  h += "<tr><th>Credibility</th><td class='num'>" + Math.round(mv.cred) + "/100</td><td class='small'>Do you do what you say? Hurt by U-turns and broken promises. Helps your poll rating.</td></tr>";
  h += "<tr><th>Delivering the ideology</th><td class='num'>" + Math.round(mv.delivery || 50) + "/100</td><td class='small'>See <a href='#ideology'>Ideology</a>.</td></tr>";
  h += "<tr><th>Poll rating</th><td class='num'>" + pct(me.poll, 0) + "</td><td class='small'>Campaign boost now: " + ((me.cbias || 0) + (me.mbias || 0) >= 0 ? "+" : "") + ((me.cbias || 0) + (me.mbias || 0)).toFixed(2) + "</td></tr></table>";
  h += "<h2>Campaign and organise</h2><p class='small'>These cost party funds. Their effect on the polls fades over a few months, so time them before elections.</p><table class='data'>";
  var Y = g.econ.gdp;
  var acts = [["rally", "Hold a rally", 0.000006, "Fires up members, small poll boost."], ["ads", "Advertising campaign", 0.00001, "Bigger poll boost" + (g.constitution.press == "free" ? "." : " (works better when the press is controlled).")],
    ["recruit", "Membership drive", 0.000005, "More members for a few months."], ["congress", "Party congress", 0.000012, "Every faction calms down a bit. Once every 6 months."], ["thinktank", "Think tank report", 0.000008, "+4 credibility: your ideas look serious."]];
  for (var i = 0; i < acts.length; i++) {
    var a = acts[i], cd = mv.cooldown[a[0]] && g.week < mv.cooldown[a[0]];
    h += "<tr><td><button onclick='mvAct(\"" + a[0] + "\")'" + (cd || mv.funds < a[2] * Y ? " disabled" : "") + ">" + a[1] + "</button></td><td>" + money(g, a[2] * Y) + "</td><td class='small'>" + a[3] + (cd ? " <i>(again in " + (mv.cooldown[a[0]] - g.week) + " wks)</i>" : "") + "</td></tr>";
  }
  h += "<tr><td><button onclick='mvAct(\"canvass\", $(\"cv_r\").value)'" + (mv.funds < 0.000004 * Y ? " disabled" : "") + ">Door-to-door campaign</button> in " + "<select id='cv_r'>" + g.regions.map(function (r, i) { return "<option value='" + i + "'>" + esc(r.name) + "</option>"; }).join("") + "</select>" + "</td><td>" + money(g, 0.000004 * Y) + "</td><td class='small'>Big boost in one region (helps win seats there).</td></tr>";
  h += "</table>";
  h += "<h3>Write in your party newspaper</h3><p class='small'>Your op-ed appears in the news as an opinion piece in " + esc(mv.paper) + ". " + (g.constitution.press == "free" ? "" : "With a controlled press, it is the only opinion people read.") + "</p>";
  h += "<p>Headline: <input type='text' id='oped_h' size=60 maxlength=100><br><textarea id='oped_t' rows=5 cols=80 maxlength=2000 placeholder='Make your case...'></textarea><br><button onclick='publishOpEd()'>Publish</button></p>";
  h += "<h2>Factions inside the party</h2><table class='data full'><tr><th>Faction</th><th>Leader</th><th>Size</th><th>Mood</th><th>Wants</th><th></th></tr>";
  for (var i = 0; i < mv.factions.length; i++) {
    var f = mv.factions[i];
    h += "<tr><td><b>" + esc(f.name) + "</b></td><td>" + esc(f.leader) + "</td><td class='num'>" + f.strength + "%</td><td>" + Math.round(f.mood) + " " + moodWord(f.mood) + "</td><td class='small'>" + esc(f.about) + "</td><td>";
    h += "<button onclick='facAct(\"" + f.id + "\",\"meet\")'>Meet them</button> <button onclick='facAct(\"" + f.id + "\",\"job\")' title='Put their leader in the cabinet'>Give a job</button>";
    if (f.dim) h += " <button onclick='facAct(\"" + f.id + "\",\"adopt\")' title='Move your ideology 10 points their way'>Adopt their line</button>";
    h += "</td></tr>";
  }
  h += "</table><p class='small'>A faction that stays furious for months may walk out and form its own party, taking members and seats with it.</p>";
  h += "<h2>Party identity and rules</h2><table class='data'>";
  h += "<tr><th>Party name</th><td><input type='text' id='mv_name' value='" + esc(me.name) + "' size=36 maxlength=50></td></tr>";
  h += "<tr><th>Symbol</th><td>" + IDEO_SYMBOLS.map(function (s, i) { return "<label style='font-size:20px;margin-right:6px'><input type='radio' name='mv_sym' value='" + i + "'" + (mv.symbol == s ? " checked" : "") + ">" + s + "</label>"; }).join("") + "</td></tr>";
  h += "<tr><th>Colours</th><td><input type='color' id='mv_c0' value='" + esc(mv.colors[0]) + "'> <input type='color' id='mv_c1' value='" + esc(mv.colors[1]) + "'></td></tr>";
  h += "<tr><th>Slogan</th><td><input type='text' id='mv_slogan' value='" + esc(mv.slogan) + "' size=50 maxlength=80></td></tr>";
  h += "<tr><th>Party newspaper</th><td><input type='text' id='mv_paper' value='" + esc(mv.paper) + "' size=36 maxlength=50></td></tr>";
  h += "<tr><th>How the leader is chosen</th><td><select id='mv_lead'>" + [["members", "Members elect the leader (more enthusiasm, but challenges happen)"], ["council", "A party council picks the leader (harder to topple)"], ["leader", "Leader for life (no challenges, members less keen)"]].map(function (o) { return "<option value='" + o[0] + "'" + (mv.leadership == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
  h += "</table><p><button onclick='mvSave()'>Save party identity</button></p>";
  var partners = govParties(g).filter(function (p) { return !p.player; });
  h += "<h2>Coalition partners</h2>";
  if (!partners.length) h += "<p><i>You govern alone.</i></p>";
  else {
    h += "<table class='data full'><tr><th>Party</th><th>Seats</th><th>Patience</th><th>Agreements</th><th>Make a deal</th></tr>";
    for (var i = 0; i < partners.length; i++) {
      var p = partners[i], ds = mv.deals.filter(function (d) { return d.party == p.id && !d.broken && d.until > g.week; });
      h += "<tr><td>" + esc(p.name) + "</td><td class='num'>" + p.seats + "</td><td class='num'>" + Math.round(p.patience) + "</td><td class='small'>" + (ds.map(function (d) { return esc(d.what); }).join("<br>") || "-") + "</td><td>";
      h += "<button onclick='coAct(\"" + p.id + "\",\"summit\")'>Coalition summit</button> <button onclick='coAct(\"" + p.id + "\",\"promise\")'>Promise one of their policies</button><br>Give them: <select id='co_m_" + p.id + "'>" + g.cabinet.filter(function (m) { return m.party != p.id; }).map(function (m) { return "<option value='" + m.ministry + "'>" + esc(ministryName(m.ministry)) + "</option>"; }).join("") + "</select> <button onclick='coAct(\"" + p.id + "\",\"ministry\",$(\"co_m_" + p.id + "\").value)'>Hand over</button></td></tr>";
    }
    h += "</table><p class='small'>An agreement keeps partners patient for 4 years. Break a promise you made to them and they lose patience fast.</p>";
  }
  if (mv.log.length) {
    h += "<h3>Recent activity</h3><ul>";
    for (var i = mv.log.length - 1; i >= 0 && i >= mv.log.length - 8; i--) h += "<li>" + weekDate(g, mv.log[i].week) + ": " + esc(mv.log[i].what) + " (" + money(g, mv.log[i].cost) + ")</li>";
    h += "</ul>";
  }
  return h;
};
function mvAct(a, arg) { var r = movementAction(game, a, arg); if (r) alert(r); autosave(); route(); }
function facAct(f, a) { var r = factionAction(game, f, a); if (r) alert(r); autosave(); route(); }
function coAct(p, a, arg) { var r = coalitionAction(game, p, a, arg); if (r) alert(r); autosave(); route(); }
function mvSave() {
  var g = game, mv = g.movement, me = playerParty(g);
  var nm = $("mv_name").value.trim();
  if (nm && nm != me.name) { addEvent(g, "partyEvent", 1, me.name + " renames itself " + nm, { old: me.name, now: nm }, "", 0); me.name = nm.slice(0, 50); }
  var r = document.querySelector("input[name=mv_sym]:checked"); if (r) mv.symbol = IDEO_SYMBOLS[parseInt(r.value)];
  mv.colors = [$("mv_c0").value, $("mv_c1").value]; me.color = mv.colors[0];
  mv.slogan = $("mv_slogan").value.slice(0, 80); mv.paper = $("mv_paper").value.slice(0, 50) || mv.paper;
  if ($("mv_lead").value != mv.leadership) { mv.leadership = $("mv_lead").value; if (mv.leadership == "leader") mv.cred = Math.max(0, mv.cred - 5); }
  autosave(); route();
}
function publishOpEd() {
  var g = game, mv = g.movement, hd = $("oped_h").value.trim(), tx = $("oped_t").value.trim();
  if (!hd || tx.length < 20) { alert("Write a headline and at least a few sentences."); return; }
  if (mv.cooldown.oped && g.week < mv.cooldown.oped) { alert("You published one recently. Try again in " + (mv.cooldown.oped - g.week) + " week(s)."); return; }
  mv.cooldown.oped = g.week + 3;
  var ev = addEvent(g, "opEd", 1, hd, { author: g.leaderName }, "Opinion", 0); ev.covered = true;
  g.news.push({ id: "AR-" + ev.id.slice(3) + "-party", week: g.week, date: weekDate(g), outlet: "party", headline: hd.slice(0, 100), standfirst: "Opinion, by " + g.leaderName + ", " + g.constitution.title + " and leader of " + playerParty(g).name,
    body: tx.slice(0, 2000), byline: g.leaderName, event: ev.id, tone: "positive", reliability: "Partisan", type: "opEd", region: null, kind: "editorial" });
  mv.cred = Math.min(100, mv.cred + 1); mv.boostE = (mv.boostE || 0) + 3;
  if (g.constitution.press != "free") g.politics.mood += 0.003;
  g.commandLog.push({ week: g.week, cmd: "oped" });
  autosave(); go("article/AR-" + ev.id.slice(3) + "-party");
}

PAGES.stakeholders = function () {
  var g = game; ensureStake(g); ensureMovement(g);
  var S = g.stake, Y = g.econ.gdp;
  var h = title("Unions, Business and Other Groups");
  h += "<p>Organised groups can make governing easy or impossible. Relations move with your policies. Sign deals to win them over: each deal gives you something and costs you something. If relations stay below 20 for two months, expect trouble: strikes, investment freezes, blockades, protests.</p>";
  h += "<table class='data full'><tr><th>Group</th><th>Relations</th><th>Mood</th><th>Deal now</th><th></th></tr>";
  for (var i = 0; i < STAKEHOLDERS.length; i++) {
    var st = STAKEHOLDERS[i], s = S[st.id];
    h += "<tr><td><b>" + st.name + "</b><br><span class='small'>" + st.who + "</span></td><td class='num'>" + Math.round(s.rel) + " <span class='bar' style='width:" + Math.round(s.rel / 2) + "px;background:" + (s.rel < 25 ? "#C8102E" : (s.rel > 60 ? "#2E8B57" : "#999")) + "'></span></td><td>" + moodWord(s.rel) + (s.trouble ? " <b class='bad'>(taking action!)</b>" : "") + "</td>";
    if (s.deal) { var D = dealInfo(s.deal); h += "<td><b>" + D.name + "</b><br><span class='small'>until " + weekDate(g, s.dealUntil) + "</span></td><td><button onclick='stCancel(\"" + st.id + "\")'>Tear it up</button></td></tr>"; }
    else {
      h += "<td>-</td><td>";
      var ds = DEALS.filter(function (d) { return d.group == st.id; });
      for (var j = 0; j < ds.length; j++) h += "<div style='margin-bottom:4px'><button onclick='stDeal(\"" + ds[j].id + "\")'" + (s.rel < 25 ? " disabled" : "") + ">" + ds[j].name + "</button><br><span class='small'>They give: " + ds[j].gives + "<br>You give: " + ds[j].costs + (ds[j].cost ? " (" + money(g, ds[j].cost * Y) + "/yr)" : "") + "</span></div>";
      if (s.rel < 25) h += "<span class='small bad'>Won't negotiate below 25.</span>";
      h += "</td></tr>";
    }
  }
  h += "</table><h2>The regions</h2><p class='small'>Regional leaders care about how their people feel about you. A growth deal costs 0.1% of GDP a year for 4 years and slowly raises incomes there.</p><table class='data full'><tr><th>Region</th><th>Relations</th><th>Mood</th><th>Deal</th></tr>";
  for (var r = 0; r < g.regions.length; r++) {
    var R = S.regions[r]; if (!R) continue;
    h += "<tr><td>" + esc(g.regions[r].name) + "</td><td class='num'>" + Math.round(R.rel) + "</td><td>" + moodWord(R.rel) + "</td><td>" + (R.deal ? "Growth deal until " + weekDate(g, R.dealUntil) + " <button onclick='stCancel(\"regions\"," + r + ")'>End it</button>" : "<button onclick='stDeal(\"regiondeal\"," + r + ")'>Offer a growth deal (" + money(g, 0.001 * Y) + "/yr)</button>") + "</td></tr>";
  }
  return h + "</table>";
};
function stDeal(id, r) { var x = makeDeal(game, id, r); if (x) alert(x); else { game.stake && null; } lawsRefresh(); autosave(); route(); }
function stCancel(gr, r) { if (!confirm("Tear up the deal? Relations will drop by 30.")) return; cancelDeal(game, gr, r); lawsRefresh(); autosave(); route(); }
function lawsRefresh() { game.lawFx = computeLawFx(game); }

PAGES.agencies = function () {
  var g = game, Y = g.econ.gdp, A = g.agencies || [];
  var h = title("Agencies and Priorities");
  h += "<h2>National priorities</h2><p>Pick up to 3. The whole government leans towards them: ministers focus there and you get a small, steady boost. You can change them once a quarter.</p>";
  var P = g.priorities || [];
  h += "<p>";
  for (var i = 0; i < PRIORITIES.length; i++) h += "<label style='display:inline-block;width:210px'><input type='checkbox' class='prio' value='" + PRIORITIES[i].id + "'" + (P.indexOf(PRIORITIES[i].id) >= 0 ? " checked" : "") + "> " + PRIORITIES[i].name + "</label>";
  var wait = g.prioWeek && g.week - g.prioWeek < 13 ? 13 - (g.week - g.prioWeek) : 0;
  h += "</p><p><button onclick='savePrio()'" + (wait ? " disabled" : "") + ">Set priorities</button>" + (wait ? " <span class='small'>(you can change them again in " + wait + " weeks)</span>" : "") + "</p>";
  h += "<h2>Agencies</h2><p>Agencies are permanent bodies that do one job well. They cost money every year and take about a year to reach full strength. <b>Independent</b> agencies are trusted more (stronger against corruption, better for democracy) but will sometimes criticise you in public.</p>";
  if (A.length) {
    h += "<table class='data full'><tr><th>Agency</th><th>Head</th><th>Budget</th><th>Independent</th><th>Strength</th><th></th></tr>";
    for (var i = 0; i < A.length; i++) {
      var a = A[i], T = agencyType(a.type), mat = Math.round(clamp((g.week - a.since) / 52, 0, 1) * 100);
      h += "<tr><td><b>" + esc(a.name) + "</b><br><span class='small'>" + T.name + ": " + T.about + "</span></td><td>" + esc(a.head) + "</td><td>" + a.budget + "% of GDP<br><span class='small'>" + money(g, a.budget / 100 * Y) + "/yr</span><br><input type='number' id='agb_" + i + "' value='" + a.budget + "' step=0.01 min=0.005 max=0.5 style='width:60px'><button onclick='agBudget(" + i + ")'>Set</button></td>";
      h += "<td>" + (a.independent ? "yes" : "no") + "</td><td>" + mat + "%</td><td><button onclick='agClose(\"" + a.id + "\")'>Abolish</button></td></tr>";
    }
    h += "</table>";
  } else h += "<p><i>No agencies yet.</i></p>";
  if (A.length < 8) {
    h += "<h3>Set up a new agency</h3><table class='data'><tr><th>Kind</th><td><select id='ag_type' onchange='agType()'>" + AGENCY_TYPES.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select> <span id='ag_about' class='small'>" + AGENCY_TYPES[0].about + "</span></td></tr>";
    h += "<tr><th>Its name</th><td><input type='text' id='ag_name' size=40 maxlength=60 placeholder='" + esc(AGENCY_TYPES[0].name) + "'></td></tr>";
    h += "<tr><th>Budget (% of GDP a year)</th><td><input type='number' id='ag_budget' value='" + (AGENCY_TYPES[0].typical * 100).toFixed(2) + "' step=0.01 min=0.005 max=0.5 style='width:70px'> <span class='small'>The suggested amount gives full effect. More helps a bit, up to 1.5 times.</span></td></tr>";
    h += "<tr><th>Independent?</th><td><label><input type='checkbox' id='ag_indep' checked> Yes, it answers to parliament, not to a minister</label></td></tr></table>";
    h += "<p><button onclick='agCreate()'>Create agency</button></p>";
  }
  return h;
};
function agType() { var t = agencyType($("ag_type").value); $("ag_about").innerHTML = t.about; $("ag_budget").value = (t.typical * 100).toFixed(2); $("ag_name").placeholder = t.name; }
function agCreate() { var r = createAgency(game, $("ag_type").value, $("ag_name").value.trim(), $("ag_budget").value, $("ag_indep").checked); if (r) alert(r); lawsRefresh(); autosave(); route(); }
function agClose(id) { if (!confirm("Abolish this agency?")) return; closeAgency(game, id); lawsRefresh(); autosave(); route(); }
function agBudget(i) { var a = game.agencies[i]; a.budget = clamp(parseFloat($("agb_" + i).value) || a.budget, 0.005, 0.5); lawsRefresh(); autosave(); route(); }
function savePrio() {
  var ch = document.querySelectorAll(".prio:checked"), P = [];
  for (var i = 0; i < ch.length; i++) P.push(ch[i].value);
  if (P.length > 3) { alert("Pick at most 3."); return; }
  game.priorities = P; game.prioWeek = game.week;
  addEvent(game, "priorities", 1, "Government sets its priorities: " + P.map(function (p) { return priorityInfo(p).name.toLowerCase(); }).join(", "), { priorities: P.length }, "", 0);
  game.commandLog.push({ week: game.week, cmd: "priorities", list: P.join(",") });
  lawsRefresh(); autosave(); route();
}

PAGES.scorecard = function () {
  var g = game, mv = ensureMovement(g), sc = scorecard(g), H = g.scoreHist || [];
  var yearAgo = null; for (var i = 0; i < H.length; i++) if (H[i].week <= g.week - 52) yearAgo = H[i];
  var first = H.length ? H[0] : null;
  var h = title("National Scorecard");
  h += "<p>How is the country actually doing? Every score is 0-100. There is no perfect build: almost every lever that pushes one score up pushes another one down. The right balance depends on your country and what you believe.</p>";
  h += "<table class='data full'><tr><th>Outcome</th><th>Score</th><th>Grade</th><th>A year ago</th><th>First check</th><th>What moves it (and the trade-off)</th></tr>";
  var avg = 0;
  for (var i = 0; i < sc.length; i++) {
    var s = sc[i]; avg += s.score;
    var ya = yearAgo ? yearAgo.s[i] : null, fa = first ? first.s[i] : null;
    h += "<tr><td><b>" + s.name + "</b></td><td><span class='bar' style='width:" + Math.round(s.score) + "px;background:" + (s.score >= 65 ? "#2E8B57" : (s.score >= 35 ? "#C8A400" : "#C8102E")) + "'></span> " + Math.round(s.score) + "</td><td><b>" + grade(s.score) + "</b></td>";
    h += "<td>" + (ya === null ? "-" : ya + " " + arrow(s.score - ya)) + "</td><td>" + (fa === null ? "-" : fa) + "</td><td class='small'>" + s.levers + "</td></tr>";
  }
  avg /= sc.length;
  h += "<tr><th>Overall</th><th>" + Math.round(avg) + "</th><th>" + grade(avg) + "</th><td colspan=3 class='small'>Scores are saved every 13 weeks.</td></tr></table>";
  h += "<h2>Ideology report card: " + esc(mv.ideology.name) + "</h2>";
  var P = ideoProgress(g);
  h += "<table class='data full'><tr><th>Dimension</th><th>You want</th><th>Country then</th><th>Country now</th><th>Progress</th></tr>";
  for (var i = 0; i < P.length; i++) h += "<tr><td>" + P[i].name + "</td><td class='num'>" + P[i].ideal + "</td><td class='num'>" + P[i].start + "</td><td class='num'>" + P[i].now + "</td><td>" + Math.round(P[i].progress * 100) + "% " + (P[i].progress > 0.5 ? "<span class='good'>delivered</span>" : (P[i].progress < -0.1 ? "<span class='bad'>backwards</span>" : "")) + "</td></tr>";
  h += "</table><p>Overall delivery: <b>" + Math.round(mv.delivery || 50) + "/100</b>. Members expect more progress the longer you are in power.</p>";
  h += "<h2>Achievements</h2>" + achievementsHtml(g);
  return h;
};
function arrow(d) { return d > 1 ? "<span class='good'>&#9650;</span>" : (d < -1 ? "<span class='bad'>&#9660;</span>" : ""); }
function achievementsHtml(g) {
  var A = g.achievements || {}, h = "<table class='data'>";
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i], got = A[a.id];
    h += "<tr><td>" + (got ? "&#127942;" : "&#9675;") + "</td><td>" + (got ? "<b>" + a.name + "</b>" : "<span style='color:#888'>" + a.name + "</span>") + "</td><td class='small'>" + a.text + "</td><td class='small'>" + (got ? weekDate(g, got) : "") + "</td></tr>";
  }
  return h + "</table>";
}

PAGES.leader = function () {
  var g = game;
  if (!g.leader) g.leader = { job: "", bio: "", born: g.startYear - 52, skin: 1, hair: "short", hairColor: "#3B2A1A", glasses: false, beard: false, suit: "#1F2A44", extra: "tie" };
  var L = g.leader;
  var h = title("Leader Profile");
  h += "<table class='data'><tr><td style='text-align:center;width:150px'><div id='ld_pic'>" + portraitSvg(L, 130) + "</div></td><td>";
  h += "<b style='font-size:16px'>" + esc(g.leaderName) + "</b><br>" + esc(g.constitution.title) + " of " + esc(g.country.name) + "<br>Born " + L.born + " (age " + (weekYear(g) - L.born) + ")<br>Leader of " + esc(playerParty(g).name) + "<br>Before politics: " + esc(jobName(L.job)) + "<br>In power since " + weekDate(g, 1) + "</td></tr></table>";
  if (L.bio) h += "<div class='box' style='font-family:Georgia,serif'>" + esc(L.bio).replace(/\n/g, "<br>") + "</div>";
  h += "<h2>Change your look and story</h2><table class='data'>";
  h += "<tr><th>Skin tone</th><td>" + SKINS.map(function (s, i) { return "<label><input type='radio' name='ld_skin' value='" + i + "'" + (L.skin == i ? " checked" : "") + " onchange='ldPrev()'><span style='display:inline-block;width:18px;height:18px;background:" + s + ";border:1px solid #999'></span></label> "; }).join("") + "</td></tr>";
  h += "<tr><th>Hair</th><td><select id='ld_hair' onchange='ldPrev()'>" + HAIRS.map(function (o) { return "<option value='" + o[0] + "'" + (L.hair == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select> colour <input type='color' id='ld_hc' value='" + esc(L.hairColor) + "' onchange='ldPrev()'></td></tr>";
  h += "<tr><th>Extras</th><td><label><input type='checkbox' id='ld_gl'" + (L.glasses ? " checked" : "") + " onchange='ldPrev()'> glasses</label> <label><input type='checkbox' id='ld_bd'" + (L.beard ? " checked" : "") + " onchange='ldPrev()'> beard</label> &nbsp; clothes <input type='color' id='ld_suit' value='" + esc(L.suit) + "' onchange='ldPrev()'> <select id='ld_extra' onchange='ldPrev()'>" + EXTRAS.map(function (o) { return "<option value='" + o[0] + "'" + (L.extra == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
  h += "<tr><th>Your name</th><td><input type='text' id='ld_name' value='" + esc(g.leaderName) + "' size=30 maxlength=40></td></tr>";
  h += "<tr><th>Year of birth</th><td><input type='number' id='ld_born' value='" + L.born + "' min=" + (g.startYear - 90) + " max=" + (g.startYear - 18) + " style='width:70px'></td></tr>";
  h += "<tr><th>Job before politics</th><td><select id='ld_job'" + (L.jobSet ? " disabled title='You can only choose this once'" : "") + ">" + LEADER_JOBS.map(function (o) { return "<option value='" + o[0] + "'" + (L.job == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>" + (L.jobSet ? " <span class='small'>(set for good)</span>" : " <span class='small'>You can only pick this once.</span>") + "</td></tr>";
  h += "<tr><th>Biography</th><td><textarea id='ld_bio' rows=6 cols=70 maxlength=3000 placeholder='Where you grew up, what made you go into politics...'>" + esc(L.bio || "") + "</textarea></td></tr></table>";
  h += "<p><button onclick='ldSave()'>Save profile</button></p>";
  h += "<h2>Political record</h2>" + recordHtml(g);
  h += "<h2>Achievements</h2>" + achievementsHtml(g);
  return h;
};
function jobName(id) { for (var i = 0; i < LEADER_JOBS.length; i++) if (LEADER_JOBS[i][0] == id) return LEADER_JOBS[i][1].replace(/ \(.*\)$/, ""); return "Career politician"; }
function ldRead() {
  var L = copy(game.leader), r = document.querySelector("input[name=ld_skin]:checked");
  if (r) L.skin = parseInt(r.value);
  L.hair = $("ld_hair").value; L.hairColor = $("ld_hc").value; L.glasses = $("ld_gl").checked; L.beard = $("ld_bd").checked; L.suit = $("ld_suit").value; L.extra = $("ld_extra").value;
  return L;
}
function ldPrev() { $("ld_pic").innerHTML = portraitSvg(ldRead(), 130); }
function ldSave() {
  var g = game, L = ldRead();
  L.bio = $("ld_bio").value.slice(0, 3000); L.born = clamp(parseInt($("ld_born").value) || L.born, g.startYear - 90, g.startYear - 18);
  if (!g.leader.jobSet && $("ld_job").value) { L.job = $("ld_job").value; L.jobSet = true; }
  var nm = $("ld_name").value.trim();
  if (nm && nm != g.leaderName) { playerParty(g).leader = nm; g.leaderName = nm.slice(0, 40); }
  g.leader = L; lawsRefresh(); autosave(); route();
}
function recordHtml(g) {
  var types = ["election", "billPass", "lawInForce", "treaty", "war", "confidence", "coalition", "referendum", "deal", "agency", "org", "summit", "split", "challenge", "manifesto", "ideology", "scandal"];
  var ev = g.events.filter(function (e) { return types.indexOf(e.type) >= 0 && e.severity >= 2; });
  var laws = g.events.filter(function (e) { return e.type == "lawInForce"; }).length, elections = g.politics.elections.length;
  var h = "<p>Laws in force: <b>" + laws + "</b> &middot; Elections faced: <b>" + elections + "</b> &middot; Treaties: <b>" + g.foreign.reduce(function (a, f) { return a + f.treaties.length; }, 0) + "</b> &middot; Agencies: <b>" + (g.agencies || []).length + "</b></p>";
  if (!ev.length) return h + "<p><i>Nothing yet. Make history.</i></p>";
  h += "<table class='data full'>";
  for (var i = ev.length - 1; i >= 0 && i >= ev.length - 25; i--) h += "<tr><td class='small' style='white-space:nowrap'>" + ev[i].date + "</td><td>" + esc(ev[i].title) + "</td></tr>";
  return h + "</table>";
}

PAGES.diplomacy = function () {
  var g = game;
  if (!g.diplo) g.diplo = { last: {}, summit: {}, log: [] };
  var h = title("Diplomacy and World Organisations");
  h += "<p>Talk to other governments directly, meet their leaders, and build your own international organisations. Treaties are on the <a href='#foreign'>Foreign Affairs</a> page.</p>";
  h += "<h2>Send a diplomatic message</h2><p>To <select id='dm_to'>" + g.foreign.map(function (f) { return "<option value='" + f.id + "'>" + esc(f.name) + " (relations " + Math.round(f.relation) + ")</option>"; }).join("") + "</select> ";
  h += "<select id='dm_tone'>" + MESSAGE_TONES.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select><br>";
  h += "<textarea id='dm_text' rows=3 cols=80 maxlength=400 placeholder='Your words (optional, for the record)'></textarea><br><button onclick='dmSend()'>Send</button></p>";
  if (g.diplo.log.length) {
    h += "<table class='data full'><tr><th>Date</th><th>To</th><th>Message</th><th>Reply</th><th>Relations</th></tr>";
    for (var i = g.diplo.log.length - 1; i >= 0 && i >= g.diplo.log.length - 10; i--) { var m = g.diplo.log[i]; h += "<tr><td class='small'>" + weekDate(g, m.week) + "</td><td>" + esc(m.to) + "</td><td>" + esc(m.tone) + (m.text ? "<br><span class='small'>&ldquo;" + esc(m.text) + "&rdquo;</span>" : "") + "</td><td class='small'>" + esc(m.reply) + "</td><td>" + (m.change > 0 ? "+" : "") + m.change + "</td></tr>"; }
    h += "</table>";
  }
  h += "<h2>Summits</h2><table class='data full'><tr><th>Country</th><th>Leader</th><th>Relations</th><th>Last summit</th><th></th></tr>";
  for (var i = 0; i < g.foreign.length; i++) {
    var f = g.foreign[i], last = g.diplo.summit[f.id];
    h += "<tr><td>" + esc(f.name) + "</td><td>" + esc(f.leader) + "</td><td class='num'>" + Math.round(f.relation) + "</td><td>" + (last ? weekDate(g, last) : "never") + "</td><td><button onclick='dmSummit(\"" + f.id + "\")'" + ((last && g.week - last < 26) || f.atWar ? " disabled" : "") + ">Hold a summit</button></td></tr>";
  }
  h += "</table>";
  h += "<h2>Your international organisations</h2>";
  var O = g.orgs || [];
  for (var i = 0; i < O.length; i++) {
    var o = O[i], T = orgType(o.type);
    h += "<div class='box'><b>" + esc(o.name) + "</b> (" + T.name + ", founded " + weekDate(g, o.founded) + ", headquarters " + esc(o.hq) + ")<br><span class='small'>" + T.about + " Fee: " + money(g, T.fee * g.econ.gdp) + "/yr.</span>";
    if (o.charter) h += "<p style='font-family:Georgia,serif'><i>" + esc(o.charter) + "</i></p>";
    h += "<p>Members: <b>" + esc(g.country.name) + "</b>" + o.members.map(function (cid) { return ", " + esc(countryOf(g, cid).name) + " <a href='javascript:orgKick(\"" + o.id + "\",\"" + cid + "\")' class='small'>(expel)</a>"; }).join("") + "</p>";
    var others = g.foreign.filter(function (f) { return o.members.indexOf(f.id) < 0 && !f.atWar; });
    if (others.length) h += "<p>Invite: <select id='oi_" + i + "'>" + others.map(function (f) { return "<option value='" + f.id + "'>" + esc(f.name) + " (relations " + Math.round(f.relation) + (f.interest == T.interest ? ", interested" : "") + ")</option>"; }).join("") + "</select> <button onclick='orgInvite(\"" + o.id + "\",$(\"oi_" + i + "\").value)'>Send invitation</button></p>";
    h += "<p><button onclick='orgEnd(\"" + o.id + "\")'>Wind it up</button></p></div>";
  }
  if (O.length < 4) {
    h += "<h3>Found a new organisation</h3><table class='data'><tr><th>Kind</th><td><select id='of_type'>" + ORG_TYPES.map(function (t) { return "<option value='" + t.id + "'>" + t.name + " - " + t.about + "</option>"; }).join("") + "</select></td></tr>";
    h += "<tr><th>Name</th><td><input type='text' id='of_name' size=40 maxlength=60 placeholder='e.g. Northern Trade Community'></td></tr>";
    h += "<tr><th>Charter</th><td><textarea id='of_charter' rows=3 cols=70 maxlength=1000 placeholder='What it stands for'></textarea></td></tr></table><p><button onclick='orgFound()'>Found it</button> <span class='small'>Countries join if relations are good, especially if the topic interests them.</span></p>";
  }
  return h;
};
function dmSend() { var r = sendMessage(game, $("dm_to").value, $("dm_tone").value, $("dm_text").value); if (r.error) alert(r.error); else alert("Reply: " + r.reply); autosave(); route(); }
function dmSummit(c) { var r = holdSummit(game, c); if (r) alert(r); autosave(); route(); }
function orgFound() { var r = foundOrg(game, $("of_name").value.trim(), $("of_type").value, $("of_charter").value); if (r) alert(r); lawsRefresh(); autosave(); route(); }
function orgInvite(o, c) { var r = inviteToOrg(game, o, c); if (r) alert(r); lawsRefresh(); autosave(); route(); }
function orgKick(o, c) { if (!confirm("Expel them?")) return; leaveOrg(game, o, c); lawsRefresh(); autosave(); route(); }
function orgEnd(o) { if (!confirm("Wind up this organisation?")) return; dissolveOrg(game, o); lawsRefresh(); autosave(); route(); }

PAGES.profile = function () {
  var g = game, mv = ensureMovement(g), C = g.country, sc = scorecard(g);
  var A = C.arms || defaultArms(g);
  if (A.motto) A.mottoText = C.motto;
  var h = "<h1 style='text-align:center'>" + esc(C.name) + "</h1><div class='pagedate'></div>";
  h += "<table class='data' style='margin:0 auto'><tr><td style='text-align:center'>" + flagHtml(C, 150, 100) + "</td><td style='text-align:center'>" + armsSvg(A, 110) + "</td></tr></table>";
  if (C.motto) h += "<p style='text-align:center;font-family:Georgia,serif;font-size:16px'><i>&ldquo;" + esc(C.motto) + "&rdquo;</i></p>";
  h += "<table class='data full'><tr><th>Capital</th><td>" + esc(C.capital) + "</td><th>Population</th><td>" + totalPop(g).toFixed(1) + " million</td></tr>";
  h += "<tr><th>Form of state</th><td>" + esc(g.constitution.govType) + "</td><th>GDP</th><td>" + money(g, g.econ.gdp) + "</td></tr>";
  h += "<tr><th>Currency</th><td>" + esc(C.currency) + " (" + esc(C.symbol) + ")</td><th>Languages</th><td>" + esc(C.languages || "-") + "</td></tr>";
  h += "<tr><th>Cities</th><td colspan=3>" + esc([C.capital].concat(C.cities || []).join(", ")) + "</td></tr>";
  h += "<tr><th>National holidays</th><td colspan=3>" + ((C.holidays || []).map(function (x) { return esc(x.name) + " (week " + x.week + ")"; }).join(", ") || "-") + "</td></tr></table>";
  if (C.story) h += "<h2>How it began</h2><div style='font-family:Georgia,serif;line-height:1.5'>" + esc(C.story).replace(/\n/g, "<br>") + "</div>";
  if (C.profileText) h += "<h2>About the country</h2><div style='font-family:Georgia,serif;line-height:1.5'>" + esc(C.profileText).replace(/\n/g, "<br>") + "</div>";
  h += "<h2>Leader</h2><table class='data'><tr><td>" + portraitSvg(g.leader, 90) + "</td><td><b>" + esc(g.leaderName) + "</b>, " + esc(g.constitution.title) + "<br>" + esc(playerParty(g).name) + " <span style='font-size:18px'>" + mv.symbol + "</span>" + (mv.slogan ? "<br><i>&ldquo;" + esc(mv.slogan) + "&rdquo;</i>" : "") + (g.leader && g.leader.bio ? "<p class='small'>" + esc(g.leader.bio).slice(0, 400) + "</p>" : "") + "</td></tr></table>";
  h += "<h2>Ideology: " + esc(mv.ideology.name) + "</h2>" + (mv.ideology.about ? "<p><i>" + esc(mv.ideology.about) + "</i></p>" : "") + (mv.ideology.manifesto ? "<div class='box' style='font-family:Georgia,serif'>" + esc(mv.ideology.manifesto).replace(/\n/g, "<br>") + "</div>" : "");
  h += "<h2>Scorecard</h2><table class='data'>" + sc.map(function (s) { return "<tr><td>" + s.name + "</td><td><span class='bar' style='width:" + Math.round(s.score) + "px'></span> " + Math.round(s.score) + " (" + grade(s.score) + ")</td></tr>"; }).join("") + "</table>";
  h += "<h2>Achievements</h2><p>" + (ACHIEVEMENTS.filter(function (a) { return g.achievements && g.achievements[a.id]; }).map(function (a) { return "&#127942; " + a.name; }).join(" &middot; ") || "None yet.") + "</p>";
  h += "<p class='small'><button onclick='window.print()'>Print or save as PDF</button> Edit this page from <a href='#identity'>National Identity</a> and <a href='#leader'>Leader Profile</a>.</p>";
  return h;
};

var idArms = null;
function identityExtrasHtml(g) {
  var C = g.country;
  if (!idArms) idArms = copy(C.arms || defaultArms(g));
  var A = idArms;
  var h = "<h2>Coat of arms</h2><table class='data'><tr><td style='text-align:center;width:140px'><div id='arms_prev'>" + armsSvg(Object.assign({}, A, { mottoText: C.motto }), 110) + "</div></td><td><table>";
  h += "<tr><td>Shield</td><td><select id='ar_shield' onchange='armsPrev()'>" + Object.keys(SHIELDS).map(function (k) { return "<option" + (A.shield == k ? " selected" : "") + ">" + k + "</option>"; }).join("") + "</select></td></tr>";
  h += "<tr><td>Colours</td><td><input type='color' id='ar_field' value='" + esc(A.field) + "' onchange='armsPrev()'> <input type='color' id='ar_field2' value='" + esc(A.field2) + "' onchange='armsPrev()'> pattern <select id='ar_div' onchange='armsPrev()'>" + ARMS_DIVS.map(function (o) { return "<option value='" + o[0] + "'" + (A.div == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
  h += "<tr><td>Symbol</td><td><select id='ar_charge' onchange='armsPrev()'>" + ARMS_CHARGES.map(function (o) { return "<option value='" + o[0] + "'" + (A.charge == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select> <input type='color' id='ar_cc' value='" + esc(A.chargeColor) + "' onchange='armsPrev()'></td></tr>";
  h += "<tr><td>Motto ribbon</td><td><label><input type='checkbox' id='ar_motto'" + (A.motto ? " checked" : "") + " onchange='armsPrev()'> show the national motto</label></td></tr></table>";
  h += "<button onclick='armsSave()'>Adopt this coat of arms</button></td></tr></table>";
  h += "<h2>Story, places and holidays</h2><p class='small'>These are yours to write. They appear on the <a href='#profile'>Country Profile</a>, in the news and in celebrations.</p><table class='data'>";
  h += "<tr><th>National colours</th><td>" + [0, 1, 2].map(function (i) { return "<input type='color' id='nc_" + i + "' value='" + esc((C.colors || C.flag || [])[i] || "#FFFFFF") + "'>"; }).join(" ") + " <label><input type='checkbox' id='nc_use'" + (C.useColors ? " checked" : "") + "> use the first one for the website header</label></td></tr>";
  h += "<tr><th>Founding story</th><td><textarea id='id_story' rows=5 cols=70 maxlength=3000 placeholder='How did your nation come to be?'>" + esc(C.story || "") + "</textarea></td></tr>";
  h += "<tr><th>About the country</th><td><textarea id='id_prof' rows=4 cols=70 maxlength=3000 placeholder='Food, landscape, sport, customs...'>" + esc(C.profileText || "") + "</textarea></td></tr>";
  h += "<tr><th>Other cities</th><td><input type='text' id='id_cities' value='" + esc((C.cities || []).join(", ")) + "' size=70 maxlength=300 placeholder='Comma separated'></td></tr></table>";
  h += "<p><button onclick='storySave()'>Save story and places</button></p>";
  var H = C.holidays || [];
  h += "<h3>National holidays</h3><p class='small'>Each holiday is a day off: a small cost in output, a lift in the national mood when it comes round, and extra goodwill from the group it honours.</p><table class='data'><tr><th>Name</th><th>Week of the year</th><th>Kind</th><th></th></tr>";
  for (var i = 0; i < H.length; i++) h += "<tr><td>" + esc(H[i].name) + "</td><td>" + H[i].week + "</td><td>" + holidayType(H[i].type).name + "</td><td><a href='javascript:holDel(" + i + ")'>remove</a></td></tr>";
  if (H.length < 8) h += "<tr><td><input type='text' id='hol_name' size=24 maxlength=40 placeholder='e.g. Unity Day'></td><td><input type='number' id='hol_week' min=1 max=52 value='" + weekOfYear(g) + "' style='width:50px'></td><td><select id='hol_type'>" + HOLIDAY_TYPES.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select></td><td><button onclick='holAdd()'>Add</button></td></tr>";
  h += "</table>";
  return h;
}
function armsRead() { return { shield: $("ar_shield").value, field: $("ar_field").value, field2: $("ar_field2").value, div: $("ar_div").value, charge: $("ar_charge").value, chargeColor: $("ar_cc").value, motto: $("ar_motto").checked }; }
function armsPrev() { idArms = armsRead(); $("arms_prev").innerHTML = armsSvg(Object.assign({}, idArms, { mottoText: game.country.motto }), 110); }
function armsSave() { var g = game; g.country.arms = armsRead(); idArms = null; addEvent(g, "symbols", 1, g.country.name + " unveils a new coat of arms", {}, "", 0); autosave(); route(); }
function storySave() {
  var C = game.country;
  C.story = $("id_story").value.slice(0, 3000); C.profileText = $("id_prof").value.slice(0, 3000);
  C.cities = $("id_cities").value.split(",").map(function (s) { return s.trim().slice(0, 40); }).filter(function (s) { return s; }).slice(0, 12);
  C.colors = [0, 1, 2].map(function (i) { return $("nc_" + i).value; }); C.useColors = $("nc_use").checked;
  autosave(); route();
}
function holAdd() {
  var g = game, nm = $("hol_name").value.trim();
  if (!nm) { alert("Give the holiday a name."); return; }
  if (!g.country.holidays) g.country.holidays = [];
  g.country.holidays.push({ name: nm.slice(0, 40), week: clamp(parseInt($("hol_week").value) || 1, 1, 52), type: $("hol_type").value });
  addEvent(g, "symbols", 1, "New national holiday: " + nm, { holiday: nm }, "", 1);
  lawsRefresh(); autosave(); route();
}
function holDel(i) { game.country.holidays.splice(i, 1); lawsRefresh(); autosave(); route(); }

function clockSettingsHtml(g) {
  var C = g.clock || { mode: "off" };
  var h = "<h2>World clock (scheduled turns)</h2><p>Let the world move on while you are away, so you don't have to play every week by hand. When you come back, the game catches up (up to the limit) and shows you what happened. It always stops early for anything urgent.</p>";
  h += "<p><select id='clk_mode'>" + [["off", "Off: time only moves when I press Advance"], ["day", "1 week passes per real day"], ["half", "1 week per 12 hours"], ["six", "1 week per 6 hours"], ["hour", "1 week per hour"]].map(function (o) { return "<option value='" + o[0] + "'" + (C.mode == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>";
  h += " catch up at most <input type='number' id='clk_cap' value='" + (C.cap || 26) + "' min=1 max=52 style='width:50px'> weeks <button onclick='clockSave()'>Save</button></p>";
  if (C.mode != "off" && C.last) h += "<p class='small'>Next week due: " + new Date(C.last + clockPeriod(C.mode)).toLocaleString() + "</p>";
  return h;
}
function clockSave() {
  var g = game, m = $("clk_mode").value;
  g.clock = { mode: m, last: Date.now(), cap: clamp(parseInt($("clk_cap").value) || 26, 1, 52) };
  autosave(); route();
}
function catchUp() {
  var g = game;
  if (!g || !g.clock || g.clock.mode == "off" || g.gameOver) return;
  var n = weeksDue(g.clock, Date.now());
  if (n <= 0) return;
  var startWeek = g.week, ap0 = g.politics.approval, gdp0 = g.history[g.history.length - 1].realGdp, done = 0;
  for (var i = 0; i < n; i++) {
    var res = advanceWeek(game);
    if (!res.ok) break;
    game = res.game; done++;
    if (game.urgent.length || game.gameOver) { game.stoppedFor = game.urgent.slice(); break; }
  }
  if (!done) return;
  var period = clockPeriod(game.clock.mode);
  game.clock.last = done < n ? Date.now() : game.clock.last + done * period;
  var items = game.events.filter(function (e) { return e.week > startWeek && e.severity >= 2; }).slice(-15).map(function (e) { return { week: e.week, title: e.title, valence: e.valence }; });
  game.awaySummary = { from: startWeek, to: game.week, weeks: done, items: items, ap0: ap0, ap1: game.politics.approval, gdpChange: game.history[game.history.length - 1].realGdp / gdp0 - 1, stopped: done < n };
  autosave();
}
function awayHtml(g) {
  var A = g.awaySummary;
  if (!A) return "";
  var h = "<div class='briefing'><b>While you were away</b> (" + A.weeks + " week" + (A.weeks > 1 ? "s" : "") + ", " + weekDate(g, A.from) + " to " + weekDate(g, A.to) + ")" + (A.stopped ? " <b class='bad'>- stopped early because something needs you</b>" : "") + " <a href='javascript:game.awaySummary=null;autosave();route()' class='small'>[dismiss]</a>";
  h += "<br>Approval " + pct(A.ap0, 0) + " &rarr; " + pct(A.ap1, 0) + ". Economy " + (A.gdpChange >= 0 ? "grew " : "shrank ") + pct(Math.abs(A.gdpChange), 1) + ".<ul>";
  for (var i = 0; i < A.items.length; i++) h += "<li class='" + (A.items[i].valence > 0 ? "good" : (A.items[i].valence < 0 ? "bad" : "")) + "'>" + weekDate(g, A.items[i].week) + ": " + esc(A.items[i].title) + "</li>";
  return h + "</ul></div>";
}
