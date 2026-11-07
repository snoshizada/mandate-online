function frontPages(g) {
  var out = [], seen = {};
  for (var i = g.news.length - 1; i >= 0 && out.length < 6; i--) {
    var a = g.news[i];
    if (seen[a.outlet]) continue;
    seen[a.outlet] = true;
    out.push(a);
  }
  return out;
}
PAGES.news = function (arg) {
  var g = game;
  var filt = {};
  if (arg) arg.split("&").forEach(function (kv) { var p = kv.split("="); filt[p[0]] = p[1]; });
  var h = title("Media and News");
  var nick = leaderNickname(g);
  if (nick) h += "<p class='small'>The papers have started calling you <b>“" + esc(nick) + "”</b>.</p>";
  h += "<p>Paper: <a href='#news'>All</a>";
  for (var i = 0; i < OUTLETS.length; i++) h += " | " + (filt.outlet == OUTLETS[i].id ? "<b>" + OUTLETS[i].name + "</b>" : "<a href='#news/outlet=" + OUTLETS[i].id + "'>" + OUTLETS[i].name + "</a>");
  h += "<br>Topic: ";
  var topics = { economy: ["gdp", "inflation", "jobs", "rate", "world", "creditShock", "energyShock"], politics: ["billPass", "billFail", "lawInForce", "poll", "election", "coalition", "confidence", "campaign", "scandal", "appointment", "referendum", "pressResponse", "pledge", "pledgeKept", "pledgeBroken"],
    "your laws": ["lawInForce", "lawReview", "lawEarly", "lawExpires", "billPass", "billFail"], opinion: ["editorial", "voices"], society: ["protest", "strike", "waiting", "healthEmergency", "disaster", "census", "pensions", "riot"], world: ["treaty", "offer", "border", "war", "warReport", "peace"] };
  for (var k in topics) h += (filt.topic == k ? "<b>" + k + "</b>" : "<a href='#news/topic=" + encodeURIComponent(k) + "'>" + k + "</a>") + " | ";
  h += "</p>";
  var arts = g.news.filter(function (a) {
    if (filt.outlet && a.outlet != filt.outlet) return false;
    if (filt.topic && topics[filt.topic].indexOf(a.type) < 0) return false;
    if (filt.region !== undefined && String(a.region) != filt.region) return false;
    return true;
  }).reverse().slice(0, 40);
  h += "<table width='100%'><tr><td valign=top width='62%'>";
  if (!arts.length) h += "<p>No stories match.</p>";
  for (var i = 0; i < arts.length; i++) {
    var a = arts[i];
    h += "<div class='article'><span class='outletname'>" + outletName(a.outlet) + " &middot; " + a.date + (a.kind == "editorial" ? " &middot; OPINION" : "") + (a.answered ? " &middot; you replied" : "") + "</span><br><span class='hl'><a href='#article/" + a.id + "'>" + esc(a.headline) + "</a></span><br><span class='small'>" + esc((a.standfirst ? a.standfirst + " " : "") + a.body.replace(/\n\n/g, " ").slice(0, 150)) + "...</span></div>";
  }
  h += "</td><td valign=top>";
  h += pledgePanel(g);
  h += "<h2>How the papers see you</h2><table class='data full'><tr><th>Paper</th><th>Leans</th><th>Mood towards you</th></tr>";
  for (var i = 0; i < OUTLETS.length; i++) {
    var o = OUTLETS[i], st = 1 - Math.abs(o.lean - avgGovEcon(g)) / 40 + mediaStance(g, o.id);
    h += "<tr><td><a href='#news/outlet=" + o.id + "'>" + o.name + "</a></td><td>" + (o.lean < 40 ? "Left" : o.lean > 60 ? "Right" : "Centre") + "</td><td class='" + (st > 0.6 ? "good" : (st < 0 ? "bad" : "")) + "'>" + (st > 0.6 ? "Friendly" : (st < 0 ? "Hostile" : "Neutral")) + (mediaStance(g, o.id) < -0.2 ? " (holds a grudge)" : "") + "</td></tr>";
  }
  h += "</table>";
  if (g.constitution.press != "free") h += "<p class='small'>The press is " + g.constitution.press + ": " + (g.constitution.press == "state" ? "only the state broadcaster is left, and it only reports good news." : "the tabloid was closed and the others are careful.") + "</p>";
  h += "</td></tr></table>";
  return h;
};
function pledgePanel(g) {
  var P = g.pledges || [];
  var h = "<h2>Your promises</h2>";
  if (!P.length) h += "<p class='small'>You haven't promised anything yet. A public promise gives you a small boost now, a bigger one if you keep it, and a big hit if you break it. The press will remind everyone.</p>";
  else {
    h += "<table class='data full'><tr><th>Promise</th><th>Deadline</th><th>Status</th></tr>";
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i], t = pledgeType(p.type), st = p.status;
      if (st == "open" && t.key) { var v = pledgeValue(g, t); var on = t.down ? v <= p.target : v >= p.target; st = (on ? "<span class='good'>on track</span>" : "<span class='bad'>off track</span>") + " (now " + (Math.round(v * 10) / 10) + " " + t.unit + ")"; }
      else if (st == "kept") st = "<span class='good'>KEPT</span>"; else if (st == "broken") st = "<span class='bad'>BROKEN</span>";
      h += "<tr><td>" + esc(pledgeText(g, p).replace(/^to /, "")) + "</td><td>" + weekDate(g, p.deadline) + "</td><td>" + st + "</td></tr>";
    }
    h += "</table>";
  }
  h += "<div class='box'><b>Make a promise</b><br><select id='pl_type' onchange='pledgeDefault()'>" + PLEDGE_TYPES.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select> ";
  h += "<input type='number' id='pl_target' step='0.1' style='width:60px'> <span id='pl_unit'></span><br>by <select id='pl_weeks'><option value='26'>6 months from now</option><option value='52' selected>1 year from now</option><option value='104'>2 years from now</option></select> ";
  h += "<button onclick='doPledge()'>Make this promise</button></div>";
  afterRender.push(pledgeDefault);
  return h;
}
function pledgeDefault() {
  var t = pledgeType($("pl_type").value);
  $("pl_target").value = t.def(game);
  $("pl_target").style.display = t.key ? "" : "none";
  $("pl_unit").innerHTML = t.unit;
}
function doPledge() {
  var t = pledgeType($("pl_type").value);
  var p = { type: t.id, target: parseFloat($("pl_target").value) || 0 };
  var txt = pledgeText(game, p).replace(/^to /, "");
  if (!confirm("Promise the country you will " + txt + " by " + weekDate(game, game.week + parseInt($("pl_weeks").value)) + "? The press will hold you to it.")) return;
  var r = makePledge(game, t.id, p.target, parseInt($("pl_weeks").value));
  if (r && r.error) alert(r.error);
  autosave(); route();
}
PAGES.article = function (id) {
  var g = game, a = null;
  for (var i = 0; i < g.news.length; i++) if (g.news[i].id == id) a = g.news[i];
  if (!a) return title("Article not found") + "<p>It may have been archived. <a href='#news'>Back to news</a></p>";
  var o = null; for (var i = 0; i < OUTLETS.length; i++) if (OUTLETS[i].id == a.outlet) o = OUTLETS[i];
  if (!o) o = { id: a.outlet, name: outletName(a.outlet), type: "Party newspaper", lean: 50, sensational: 0, reliability: "Partisan" };
  var h = "<div class='outletname'>" + o.name + " &middot; " + o.type + " &middot; " + a.date + (a.kind == "editorial" ? " &middot; OPINION" : "") + "</div>";
  h += "<h1>" + esc(a.headline) + "</h1>";
  if (a.standfirst) h += "<p><i>" + esc(a.standfirst) + "</i></p>";
  if (a.byline) h += "<p class='small'>By " + esc(a.byline) + "</p>";
  var paras = String(a.body).split("\n\n");
  for (var i = 0; i < paras.length; i++) h += "<p style='font-family:Georgia,serif;font-size:14px;line-height:1.5'>" + esc(paras[i]) + "</p>";
  var aboutUs = ["voices", "start"].indexOf(a.type) < 0 && a.type != "pressResponse";
  if (a.answered) h += "<div class='notice'><b>Your response:</b> “" + esc(a.answer) + "”</div>";
  else if (aboutUs && g.week - a.week <= 2 && !g.gameOver) {
    h += "<div class='box'><b>Press office:</b> how do you want to respond to this story? <span class='small'>(Only within 2 weeks of the story.)</span><br>";
    for (var i = 0; i < PRESS_RESPONSES.length; i++) {
      var r = PRESS_RESPONSES[i];
      if (r.needsUnfree && g.constitution.press == "free") continue;
      h += "<button onclick='doPress(\"" + a.id + "\",\"" + r.id + "\")' title='" + esc(r.desc) + "'>" + r.name + "</button> ";
    }
    h += "<br><span class='small'>Hover a button to see what it does. The papers will report what you say next week.</span><div id='pressres'></div></div>";
  }
  h += "<div class='box small'>Tone: " + a.tone + ". Reliability of this paper: " + a.reliability + ". Source event: <a href='#event/" + a.event + "'>" + a.event + "</a>. Stories are written from the game's event records; papers can spin facts but not change them.</div>";
  h += "<p><a href='#news'>&laquo; Back to news</a></p>";
  return h;
};
function doPress(id, choice) {
  var r = pressRespond(game, id, choice);
  autosave();
  route();
  if (r && $("pressres")) $("pressres").innerHTML = esc(r.effect);
  else if (r) alert(r.effect);
}
