var lbState = null;
function lbNew() {
  return { name: "", goal: "none", phaseWeeks: 8, reviewYears: 1, sunsetYears: 0, blocks: [], replaces: null, cat: MEASURE_CATS[0].id, search: "" };
}
var LAW_EXAMPLES = [
  { name: "Nordic Welfare Act", goal: "poverty", blocks: [{ type: "money", kind: "benefit", target: "poor40", pct: 1 }, { type: "money", kind: "programme", area: "childcare", pct: 0.4 }, { type: "measure", measure: "parentalleave", strength: 100 }, { type: "money", kind: "taxgroup", target: "rich20", pct: 1 }] },
  { name: "Safer Streets Act", goal: "crime", blocks: [{ type: "measure", measure: "communitypolicing", strength: 100 }, { type: "measure", measure: "gangs", strength: 80 }, { type: "money", kind: "programme", area: "police", pct: 0.2 }, { type: "measure", measure: "rehabilitation", strength: 60 }] },
  { name: "Tough on Crime Act", goal: "crime", blocks: [{ type: "measure", measure: "longersentences", strength: 100 }, { type: "measure", measure: "stopsearch", strength: 40 }, { type: "measure", measure: "privateprisons", strength: 100 }] },
  { name: "Green New Deal", goal: "emissions", blocks: [{ type: "measure", measure: "climatelaw", strength: 100 }, { type: "measure", measure: "coalban", strength: 100 }, { type: "money", kind: "programme", area: "energy", pct: 1 }, { type: "measure", measure: "treeplanting", strength: 100 }] },
  { name: "Enterprise and Freedom Act", goal: "growth", blocks: [{ type: "measure", measure: "smallbizrelief", strength: 100 }, { type: "measure", measure: "firing", strength: 60 }, { type: "measure", measure: "buildmore", strength: 80 }, { type: "money", kind: "taxbreak", target: "smallbiz", pct: 0.3 }] },
  { name: "Family First Act", goal: "pop", blocks: [{ type: "measure", measure: "babybonus", strength: 100 }, { type: "money", kind: "benefit", target: "families", pct: 0.5 }, { type: "money", kind: "programme", area: "childcare", pct: 0.3 }] },
  { name: "Rural Revival Act", goal: "approval", blocks: [{ type: "measure", measure: "farmsubsidy", strength: 80 }, { type: "measure", measure: "ruralbuses", strength: 100 }, { type: "money", kind: "programme", area: "broadband", pct: 0.3 }] },
  { name: "Clean Government Act", goal: "corruption", blocks: [{ type: "measure", measure: "transparency", strength: 100 }, { type: "measure", measure: "lobbyingban", strength: 100 }, { type: "measure", measure: "auditoffice", strength: 100 }] },
  { name: "National Unity Decree", goal: "legitimacy", blocks: [{ type: "measure", measure: "civics", strength: 100 }, { type: "measure", measure: "festival", strength: 100 }, { type: "measure", measure: "militarypay", strength: 60 }, { type: "money", kind: "programme", area: "propaganda", pct: 0.2 }] },
  { name: "Housing Emergency Act", goal: "approval", blocks: [{ type: "measure", measure: "newtowns", strength: 70 }, { type: "measure", measure: "vacanttax", strength: 100 }, { type: "measure", measure: "evictionban", strength: 100 }, { type: "money", kind: "programme", area: "housing", pct: 0.5 }] }
];
PAGES.lawmaker = function (arg) {
  var g = game;
  if (!lbState) lbState = lbNew();
  var S = lbState;
  var h = title("Write a Law");
  if (S.replaces) { var old = findLaw(g, S.replaces); h += "<div class='notice'>You are <b>reforming</b> " + esc(old ? old.name : S.replaces) + ". When the new version passes, the old one stops. <a href='javascript:lbState=lbNew();route()'>Cancel and start a fresh law</a></div>"; }
  h += "<h2>1. Start from an example (optional)</h2><p class='small'>Examples fill in the parts below. Change anything you like.</p><p>";
  for (var i = 0; i < LAW_EXAMPLES.length; i++) h += "<button onclick='lbExample(" + i + ")'>" + LAW_EXAMPLES[i].name + "</button> ";
  h += "</p>";
  h += "<h2>2. Name and purpose</h2><table class='data'>";
  h += "<tr><th>Name of the law</th><td><input type='text' id='lb_name' value='" + esc(S.name) + "' size=40 maxlength=60 placeholder='e.g. Fair Start Act' onchange='lbRead()'></td></tr>";
  h += "<tr><th>What is it for?</th><td><select id='lb_goal' onchange='lbRead()'>" + LAW_GOALS.map(function (o) { return "<option value='" + o.id + "'" + (S.goal == o.id ? " selected" : "") + ">" + o.name + "</option>"; }).join("") + "</select> <span class='small'>The press and the official review will judge the law on this.</span></td></tr>";
  h += "<tr><th>How fast does it start?</th><td><select id='lb_phase' onchange='lbRead()'>" + [[1, "All at once"], [8, "Phased in over 2 months"], [26, "Phased in over 6 months"], [52, "Phased in over a year"], [104, "Phased in over 2 years"]].map(function (o) { return "<option value='" + o[0] + "'" + (S.phaseWeeks == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
  h += "<tr><th>Official review</th><td><select id='lb_review' onchange='lbRead()'>" + [[0, "No review"], [0.5, "After 6 months"], [1, "After 1 year"], [2, "After 2 years"]].map(function (o) { return "<option value='" + o[0] + "'" + (S.reviewYears == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
  h += "<tr><th>Ends automatically</th><td><select id='lb_sunset' onchange='lbRead()'>" + [[0, "Never (permanent)"], [1, "After 1 year"], [2, "After 2 years"], [4, "After 4 years"]].map(function (o) { return "<option value='" + o[0] + "'" + (S.sunsetYears == o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select> <span class='small'>A sunset clause makes nervous parties more willing to try something.</span></td></tr>";
  h += "</table>";
  h += "<h2>3. What the law does</h2>";
  if (!S.blocks.length) h += "<p class='small'>Nothing yet. Add parts with the two boxes below. A law can mix money (benefits, taxes, programmes) with rules (bans, rights, regulations...).</p>";
  else {
    h += "<table class='data full'><tr><th>#</th><th>Part</th><th>Size</th><th>Where</th><th></th></tr>";
    for (var i = 0; i < S.blocks.length; i++) {
      var b = S.blocks[i];
      h += "<tr><td>" + (i + 1) + "</td><td>" + esc(blockText(g, b).replace(/ \(strength \d+%\)/, "").replace(/ \(only in .*\)$/, "")) + (b.type == "measure" && lawMeasure(b.measure) ? "<br><span class='small'>" + esc(lawMeasure(b.measure).desc) + "</span>" : "") + "</td>";
      if (b.type == "money") h += "<td><input type='number' step='0.1' min='0' value='" + roundNice(parseFloat(b.amount) || 0) + "' style='width:70px' onchange='lbSet(" + i + ",\"amount\",this.value)'> bn</td>";
      else h += "<td><input type='range' min=5 max=100 step=5 value='" + b.strength + "' onchange='lbSet(" + i + ",\"strength\",this.value)' oninput='this.nextSibling.innerHTML=\" \"+this.value+\"%\"'><span> " + b.strength + "%</span></td>";
      h += "<td>" + regionSelect("lb_r" + i, b.region, "lbSet(" + i + ",\"region\",this.value)") + "</td>";
      h += "<td><a href='javascript:lbDel(" + i + ")'>remove</a></td></tr>";
    }
    h += "</table>";
  }
  h += "<table width='100%'><tr><td valign=top width='50%'><div class='box'><b>Add money</b><br>";
  h += "<select id='lb_mkind' onchange='lbMoneyFields()'>" + MONEY_KINDS.map(function (k) { return "<option value='" + k.id + "'>" + k.name + "</option>"; }).join("") + "</select><br>";
  h += "<span id='lb_mfields'></span><br>";
  h += "Amount: <input type='number' id='lb_mamount' step='0.1' min='0' value='" + roundNice(g.econ.gdp * 0.002) + "' style='width:70px'> bn <span id='lb_munit' class='small'></span> <span class='small'>(GDP is " + money(g, g.econ.gdp) + ")</span><br>";
  h += "<button onclick='lbAddMoney()'>Add to law</button></div></td>";
  h += "<td valign=top><div class='box'><b>Add a rule, ban, right or reform</b> <span class='small'>(" + MEASURES.length + " to choose from)</span><br>";
  h += "Search: <input type='text' id='lb_search' value='" + esc(S.search) + "' size=18 oninput='lbState.search=this.value;lbMeasureList()'> or area: <select id='lb_cat' onchange='lbState.cat=this.value;lbState.search=\"\";$(\"lb_search\").value=\"\";lbMeasureList()'>" + MEASURE_CATS.map(function (c) { return "<option value='" + c.id + "'" + (S.cat == c.id ? " selected" : "") + ">" + c.name + "</option>"; }).join("") + "</select>";
  h += "<div id='lb_mlist' class='measurelist'></div></div></td></tr></table>";
  h += "<h2>4. What will it probably do?</h2><div id='lb_forecast' class='box'></div>";
  h += "<p><button class='big' onclick='lbPreview()'>Check and send to " + (decreeMode(g) ? "be signed" : "the legislature") + " &raquo;</button> <button onclick='if(confirm(\"Clear the whole law?\")){lbState=lbNew();route()}'>Start again</button></p>";
  h += "<div id='preview'></div>";
  afterRender.push(function () { lbMoneyFields(); lbMeasureList(); lbForecast(); });
  return h;
};
function regionSelect(id, val, onchange) {
  var h = "<select id='" + id + "' onchange='" + onchange + "'><option value='-1'>Whole country</option>";
  for (var r = 0; r < game.regions.length; r++) h += "<option value='" + r + "'" + (val == r ? " selected" : "") + ">Pilot: " + esc(game.regions[r].name) + "</option>";
  return h + "</select>";
}
function lbRead() {
  var S = lbState;
  if (!$("lb_name")) return;
  S.name = $("lb_name").value; S.goal = $("lb_goal").value; S.phaseWeeks = parseInt($("lb_phase").value); S.reviewYears = parseFloat($("lb_review").value); S.sunsetYears = parseFloat($("lb_sunset").value);
}
function lbSet(i, key, v) { lbRead(); lbState.blocks[i][key] = key == "region" ? parseInt(v) : parseFloat(v); lbForecast(); if (key == "region") route(); }
function lbDel(i) { lbRead(); lbState.blocks.splice(i, 1); route(); }
function lbMoneyFields() {
  var k = moneyKind($("lb_mkind").value), h = "";
  if (k.needs == "target") h = "To / from: <select id='lb_mwho'>" + LAW_TARGETS.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select>";
  if (k.needs == "area") h = "On: <select id='lb_mwho'>" + LAW_AREAS.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select>";
  if (k.needs == "sector") h = "Industry: <select id='lb_mwho'>" + SECTORS.map(function (t) { return "<option value='" + t.id + "'>" + t.name + "</option>"; }).join("") + "</select>";
  $("lb_mfields").innerHTML = h;
  $("lb_munit").innerHTML = k.unit.indexOf("once") >= 0 ? "(one-off)" : "(per year)";
}
function lbAddMoney() {
  lbRead();
  var k = moneyKind($("lb_mkind").value), who = $("lb_mwho").value, amt = parseFloat($("lb_mamount").value);
  if (!(amt > 0)) { alert("Enter an amount in billions, like 2.5"); return; }
  var b = { type: "money", kind: k.id, amount: amt, region: -1 };
  b[k.needs] = who;
  lbState.blocks.push(b);
  route();
}
function lbMeasureList() {
  var S = lbState, q = S.search.toLowerCase().trim(), h = "";
  var list = MEASURES.filter(function (m) { return q ? (m.name + " " + m.desc).toLowerCase().indexOf(q) >= 0 : m.cat == S.cat; });
  if (!list.length) h = "<p class='small'>Nothing matches. Try another word.</p>";
  for (var i = 0; i < list.length; i++) {
    var m = list[i], used = S.blocks.some(function (b) { return b.measure == m.id; });
    h += "<div class='measure'><b>" + m.name + "</b> " + (used ? "<span class='small'>(added)</span>" : "<a href='javascript:lbAddMeasure(\"" + m.id + "\")'>[add]</a>") + "<br><span class='small'>" + m.desc + " " + leanTag(m.lean, m.soc) + "</span></div>";
  }
  $("lb_mlist").innerHTML = h;
}
function leanTag(l, s) {
  var a = l < -0.3 ? "left" : (l > 0.3 ? "right" : ""), b = s < -0.3 ? "traditional" : (s > 0.3 ? "liberal" : "");
  var t = [a, b].filter(function (x) { return x; }).join(", ");
  return t ? "<i>(" + t + ")</i>" : "";
}
function lbAddMeasure(id) { lbRead(); lbState.blocks.push({ type: "measure", measure: id, strength: 100, region: -1 }); var y = window.scrollY; route(); window.scrollTo(0, y); }
function lbExample(i) {
  var ex = LAW_EXAMPLES[i], Y = game.econ.gdp;
  if (lbState.blocks.length && !confirm("Replace what you've written with the example?")) return;
  lbState = lbNew();
  lbState.name = ex.name; lbState.goal = ex.goal;
  lbState.blocks = ex.blocks.map(function (b) { var c = copy(b); if (c.pct) { c.amount = Math.round(Y * c.pct / 100 * 10) / 10; delete c.pct; } c.region = -1; return c; });
  route();
}
function lbLaw() {
  var S = lbState;
  return { name: (S.name || "").trim() || "Untitled Act", goal: S.goal, phaseWeeks: S.phaseWeeks, reviewYears: S.reviewYears, sunsetYears: S.sunsetYears, blocks: copy(S.blocks), replaces: S.replaces };
}
function lbForecast() {
  var el = $("lb_forecast");
  if (!el) return;
  if (!lbState.blocks.length) { el.innerHTML = "<span class='small'>Add some parts to see a forecast.</span>"; return; }
  var law = lbLaw();
  var lines = lawForecastText(game, law);
  var probs = lawProblems(game, law);
  var h = "<ul><li>" + lines.join("</li><li>") + "</li></ul>";
  if (probs.length) h += "<div class='bad'><b>Problems:</b><br>&bull; " + probs.map(function (p) { return esc(p.msg); }).join("<br>&bull; ") + "</div>";
  el.innerHTML = h + "<p class='small'>These are rough first-year estimates at full strength. People and markets will react, so the real result can differ. Use the forecast button after checking to simulate 6 months.</p>";
}
function lbPreview() {
  lbRead();
  var law = lbLaw();
  if (!law.blocks.length) { alert("Add at least one part first."); return; }
  if (!lbState.name.trim()) { var n = prompt("Give your law a name:", "Untitled Act"); if (!n) return; lbState.name = n; law.name = n; }
  var ch = { kind: "law", id: "new", name: (law.replaces ? "Reform: " : "New law: ") + law.name, from: law.replaces ? "old version" : "-", to: law, replaces: law.replaces };
  draft = { title: law.name, type: "law", ministry: lawMinistry(law), changes: [ch], afterSubmit: function () { lbState = null; } };
  showPreview();
}
function lawMinistry(law) {
  var b = law.blocks[0];
  if (!b) return "finance";
  if (b.type == "money") return { benefit: "labour", oneoff: "finance", taxbreak: "finance", taxgroup: "finance", subsidy: "industry", levy: "finance", nationalise: "industry", privatise: "finance", programme: ({ health: "health", education: "education", police: "interior", transport: "transport", universities: "education", research: "education", housing: "housing", energy: "energy", environment: "environment", borders: "interior", aid: "foreign", rural: "agriculture", broadband: "digital", prisons: "justice" }[b.area] || "finance") }[b.kind];
  var m = lawMeasure(b.measure);
  return { economy: "industry", work: "labour", welfare: "labour", health: "health", education: "education", housing: "housing", environment: "environment", crime: "justice", rights: "justice", culture: "interior", migration: "interior", state: "interior", trade: "foreign", rural: "agriculture", government: "finance" }[m ? m.cat : "economy"];
}
function myLawsHtml(g) {
  var L = g.customLaws || [];
  var h = "<p>Laws you wrote yourself. <a href='#lawmaker'>Write a new law &raquo;</a></p>";
  if (!L.length) return h + "<p class='small'>None yet.</p>";
  h += "<table class='data full'><tr><th>Law</th><th>What it does</th><th>Since</th><th>Status</th><th class='num'>Net cost / yr</th><th></th></tr>";
  for (var i = L.length - 1; i >= 0; i--) {
    var law = L[i];
    var fx = computeLawFx({ econ: g.econ, regions: g.regions, pop: g.pop, week: g.week, customLaws: [law] });
    var cost = 0; for (var k in fx.spendLines) cost += fx.spendLines[k]; for (var k in fx.revLines) cost -= fx.revLines[k];
    var status = law.active ? (law.phase < 1 ? "Phasing in (" + Math.round(law.phase * 100) + "%)" : "In force") : (law.repealed ? "Repealed " + weekDate(g, law.repealed) : "Ended");
    if (law.lastVerdict) status += "<br><span class='small'>Verdict: " + esc(law.lastVerdict) + "</span>";
    if (law.sunset && law.active) status += "<br><span class='small'>Ends " + weekDate(g, law.sunset) + "</span>";
    h += "<tr" + (law.active ? "" : " class='small'") + "><td><b>" + esc(law.name) + "</b>" + (law.bill ? "<br><a class='small' href='#bill/" + law.bill + "'>" + law.bill + "</a>" : "") + "</td><td class='small'>" + law.blocks.map(function (b) { return esc(blockText(g, b)); }).join("<br>") + "</td>";
    h += "<td>" + weekDate(g, law.since) + "</td><td>" + status + "</td><td class='num'>" + (law.active ? money(g, cost) : "-") + "</td>";
    h += "<td>" + (law.active ? "<button onclick='lawRepeal(\"" + law.id + "\")'>Repeal</button><br><button onclick='lawReform(\"" + law.id + "\")'>Reform</button>" : "") + "</td></tr>";
  }
  return h + "</table><div id='preview'></div>";
}
function lawRepeal(id) {
  var law = findLaw(game, id);
  draft = { title: "Repeal of the " + law.name, type: "law", ministry: lawMinistry(law), changes: [{ kind: "repeal", id: id, name: "Repeal: " + law.name, from: "in force", to: "repealed" }] };
  showPreview();
}
function lawReform(id) {
  var law = findLaw(game, id);
  lbState = lbNew();
  lbState.name = law.name; lbState.goal = law.goal; lbState.phaseWeeks = 1; lbState.reviewYears = law.reviewYears || 0; lbState.sunsetYears = 0;
  lbState.blocks = copy(law.blocks); lbState.replaces = id;
  go("lawmaker");
}
