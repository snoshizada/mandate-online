function emptyFx() {
  return { transferQ: [0, 0, 0, 0, 0], taxQ: [0, 0, 0, 0, 0], gov: 0, svc: { health: 0, education: 0, police: 0, transport: 0 }, rev: 0, subsidy: 0,
    revLines: {}, spendLines: {}, sec: [0, 0, 0, 0, 0, 0, 0, 0, 0], prod: 0, part: 0, infl: 0, emis: 0, crime: 0, health: 0, edu: 0, births: 0, migr: 0,
    di: 0, unrest: 0, legit: 0, corrupt: 0, loyalty: 0, relDem: 0, relAll: 0, inv: 0, cons: 0, exp: 0, imp: 0, bottom: 0 };
}
function lawTarget(id) { for (var i = 0; i < LAW_TARGETS.length; i++) if (LAW_TARGETS[i].id == id) return LAW_TARGETS[i]; return LAW_TARGETS[0]; }
function lawArea(id) { for (var i = 0; i < LAW_AREAS.length; i++) if (LAW_AREAS[i].id == id) return LAW_AREAS[i]; return LAW_AREAS[0]; }
function lawMeasure(id) { for (var i = 0; i < MEASURES.length; i++) if (MEASURES[i].id == id) return MEASURES[i]; return null; }
function lawGoal(id) { for (var i = 0; i < LAW_GOALS.length; i++) if (LAW_GOALS[i].id == id) return LAW_GOALS[i]; return LAW_GOALS[0]; }
function sectorIndex(id) { for (var i = 0; i < SECTORS.length; i++) if (SECTORS[i].id == id) return i; return -1; }
var MONEY_KINDS = [
  { id: "benefit", name: "Pay a benefit or grant to a group", needs: "target", unit: "bn a year" },
  { id: "taxbreak", name: "Tax cut for a group", needs: "target", unit: "bn a year" },
  { id: "taxgroup", name: "Extra tax on a group", needs: "target", unit: "bn a year" },
  { id: "oneoff", name: "One-off cash payment to a group", needs: "target", unit: "bn once" },
  { id: "programme", name: "Fund a public programme", needs: "area", unit: "bn a year" },
  { id: "subsidy", name: "Subsidy for an industry", needs: "sector", unit: "bn a year" },
  { id: "levy", name: "Special levy on an industry", needs: "sector", unit: "bn a year" },
  { id: "nationalise", name: "Nationalise an industry (compensation)", needs: "sector", unit: "bn once" },
  { id: "privatise", name: "Privatise state firms in an industry (sale)", needs: "sector", unit: "bn once" }
];
function moneyKind(id) { for (var i = 0; i < MONEY_KINDS.length; i++) if (MONEY_KINDS[i].id == id) return MONEY_KINDS[i]; return MONEY_KINDS[0]; }
function addBlockFx(g, fx, law, b, ph) {
  var Y = g.econ.gdp, P = totalPop(g);
  var share = b.region >= 0 && g.regions[b.region] ? g.regions[b.region].pop / P : 1;
  var label = law.name;
  if (b.type == "money") {
    var A = (parseFloat(b.amount) || 0) * ph;
    if (b.kind == "oneoff") {
      if (g.week - law.since >= 4) return;
      A = A * 13;
    }
    if (b.kind == "benefit" || b.kind == "oneoff") {
      var T = lawTarget(b.target);
      for (var i = 0; i < 5; i++) fx.transferQ[i] += A * T.q[i];
      fx.spendLines[label] = (fx.spendLines[label] || 0) + A;
      if (b.target == "families") fx.births += A / Y * 1.5;
      if (b.target == "unemployed" || b.target == "students") fx.part -= A / Y * 0.1;
      if (b.target == "veterans") fx.loyalty += A / Y * 400;
    }
    if (b.kind == "taxbreak" || b.kind == "taxgroup") {
      var T = lawTarget(b.target), sign = b.kind == "taxgroup" ? 1 : -1;
      for (var i = 0; i < 5; i++) fx.taxQ[i] += sign * A * T.q[i];
      fx.revLines[label] = (fx.revLines[label] || 0) + sign * A;
      if (b.target == "superrich" && sign > 0) { fx.inv -= A / Y * 0.6; fx.migr -= A / Y * 4; }
      if (b.target == "smallbiz") fx.inv -= sign * A / Y * 0.5;
    }
    if (b.kind == "programme") {
      var ar = lawArea(b.area);
      if (ar.service) fx.svc[ar.service] += A;
      else {
        fx.gov += A;
        var k = A / Y * 100;
        var f = ar.fx || {};
        for (var key in f) {
          if (key == "sec") { for (var s in f.sec) { var si = sectorIndex(s); if (si >= 0) fx.sec[si] += f.sec[s] * k * share; } }
          else fx[key] += f[key] * k * (key == "migr" ? 1 : share);
        }
        if (ar.legit) fx.legit += ar.legit * Math.min(1, k);
      }
      fx.spendLines[label] = (fx.spendLines[label] || 0) + A;
    }
    if (b.kind == "subsidy" || b.kind == "levy") {
      var si = sectorIndex(b.sector), sh = si >= 0 ? SECTORS[si].share : 0.1;
      if (b.kind == "subsidy") { fx.subsidy += A; fx.spendLines[label] = (fx.spendLines[label] || 0) + A; if (si >= 0) fx.sec[si] += Math.min(0.4, 3 * A / (Y * sh)); }
      else { fx.rev += A; fx.revLines[label] = (fx.revLines[label] || 0) + A; if (si >= 0) fx.sec[si] -= Math.min(0.4, 2 * A / (Y * sh)); fx.infl += A / Y * 0.2; }
    }
    if (b.kind == "nationalise") {
      var si = sectorIndex(b.sector);
      fx.rev += A * 0.05; fx.revLines[label] = (fx.revLines[label] || 0) + A * 0.05;
      if (si >= 0) fx.sec[si] -= 0.03 * ph;
      fx.prod -= 0.0004 * ph; fx.inv -= 0.01 * ph;
    }
    if (b.kind == "privatise") {
      var si = sectorIndex(b.sector);
      fx.rev -= A * 0.04; fx.revLines[label] = (fx.revLines[label] || 0) - A * 0.04;
      if (si >= 0) fx.sec[si] += 0.03 * ph;
      fx.prod += 0.0003 * ph;
    }
    return;
  }
  var m = lawMeasure(b.measure);
  if (!m) return;
  var s = clamp(parseFloat(b.strength) || 0, 0, 100) / 100 * ph;
  var f = m.fx || {};
  for (var key in f) {
    if (key == "sec") { for (var sid in f.sec) { var si = sectorIndex(sid); if (si >= 0) fx.sec[si] += f.sec[sid] * s * share; } continue; }
    if (key == "oneOff") continue;
    if (key == "cost") { var c = f.cost * Y * s * share; fx.gov += c; fx.spendLines[label] = (fx.spendLines[label] || 0) + c; continue; }
    if (key == "rev") { var r = f.rev * Y * s * share; fx.rev += r; fx.revLines[label] = (fx.revLines[label] || 0) + r; continue; }
    var full = ["di", "unrest", "legit", "loyalty", "relDem", "relAll"].indexOf(key) >= 0;
    fx[key] += f[key] * s * (full ? Math.max(0.4, share) : share);
  }
}
function computeLawFx(g) {
  var fx = emptyFx();
  var L = g.customLaws || [];
  for (var i = 0; i < L.length; i++) {
    var law = L[i];
    if (!law.active) continue;
    var ph = law.phase === undefined ? 1 : law.phase;
    for (var j = 0; j < law.blocks.length; j++) addBlockFx(g, fx, law, law.blocks[j], ph);
  }
  if (typeof extraFx == "function") extraFx(g, fx);
  fx.prod = clamp(fx.prod, -0.02, 0.02); fx.part = clamp(fx.part, -0.1, 0.1); fx.infl = clamp(fx.infl, -0.05, 0.08);
  fx.emis = clamp(fx.emis, -0.7, 0.5); fx.crime = clamp(fx.crime, -0.5, 0.8); fx.health = clamp(fx.health, -0.3, 0.3); fx.edu = clamp(fx.edu, -0.3, 0.3);
  fx.births = clamp(fx.births, -0.3, 0.4); fx.inv = clamp(fx.inv, -0.4, 0.3); fx.cons = clamp(fx.cons, -0.1, 0.1); fx.exp = clamp(fx.exp, -0.4, 0.3); fx.imp = clamp(fx.imp, -0.5, 0.3);
  fx.bottom = clamp(fx.bottom, -0.15, 0.2);
  for (var i = 0; i < fx.sec.length; i++) fx.sec[i] = clamp(fx.sec[i], -0.5, 0.6);
  fx.migr = fx.migr * totalPop(g) / 1000;
  return fx;
}
function lawsWeekly(g) {
  if (!g.customLaws) g.customLaws = [];
  for (var i = 0; i < g.customLaws.length; i++) {
    var law = g.customLaws[i];
    if (!law.active) continue;
    law.phase = clamp((g.week - law.since + 1) / Math.max(1, law.phaseWeeks || 1), 0, 1);
    if (law.sunset && g.week >= law.sunset) {
      law.active = false;
      addEvent(g, "lawExpires", 2, law.name + " expires", { law: law.name, since: weekDate(g, law.since) }, "The law had a sunset date.", 0, false, law.bill);
      continue;
    }
    if (g.week == law.since + 13) lawCheck(g, law, false);
    if (law.reviewWeek && g.week == law.reviewWeek) lawCheck(g, law, true);
  }
  g.lawFx = computeLawFx(g);
}
function lawCheck(g, law, final) {
  var goal = lawGoal(law.goal);
  var now = g.history[g.history.length - 1];
  var res = { law: law.name, weeks: g.week - law.since };
  var valence = 0, verdict = "";
  if (goal.key && now && law.base !== undefined && law.base !== null) {
    var before = law.base, after = now[goal.key];
    var change = after - before;
    var good = goal.down ? change < 0 : change > 0;
    var rel = Math.abs(before) > 1e-9 ? change / Math.abs(before) : change;
    var small = Math.abs(rel) < 0.02;
    verdict = small ? "made little difference so far" : (good ? "is working" : "is not working");
    valence = small ? 0 : (good ? 1 : -1);
    res.goal = goal.name.toLowerCase();
    res.before = fmtIndicator(goal.key, before);
    res.after = fmtIndicator(goal.key, after);
    law.lastVerdict = verdict;
  } else { verdict = "has had a mixed reception"; }
  res.verdict = verdict;
  if (final) {
    law.reviewed = true;
    if (valence < 0) g.politics.mood -= 0.006;
    if (valence > 0) g.politics.mood += 0.004;
  }
  addEvent(g, final ? "lawReview" : "lawEarly", final ? 2 : 1, (final ? "Official review: " : "Early verdict: ") + law.name + " " + verdict,
    res, "The law came into force " + res.weeks + " weeks ago" + (goal.key ? " with the goal: " + goal.name.toLowerCase() : "") + ".", valence, false, law.bill);
}
function fmtIndicator(key, v) {
  if (v === undefined || v === null || isNaN(v)) return "-";
  if (key == "u" || key == "infl" || key == "growth" || key == "poverty" || key == "approval") return pct(v, 1);
  if (key == "gini") return (v * 100).toFixed(1);
  if (key == "wait") return v.toFixed(1) + " weeks";
  if (key == "crime") return v.toFixed(1) + " per 1000";
  if (key == "bal") return money(g0safe(), v);
  if (key == "pop") return v.toFixed(2) + "m";
  if (key == "emissions") return v.toFixed(1) + "mt";
  return Math.round(v) + "/100";
}
function g0safe() { return currentGame || (typeof game !== "undefined" ? game : null) || { country: { symbol: "" } }; }
function lawCohortEffect(g, c) {
  var L = g.customLaws || [];
  if (!L.length) return 0;
  var Y = g.econ.gdp, x = 0;
  var reg = g.regions[c.region];
  var soc = idealSocial(g, c);
  var libness = clamp((soc - 45) / 12, -1, 1);
  var rural = reg.income < 1, urban = reg.income >= 1.1;
  for (var i = 0; i < L.length; i++) {
    var law = L[i];
    if (!law.active) continue;
    var ph = law.phase === undefined ? 1 : law.phase;
    for (var j = 0; j < law.blocks.length; j++) {
      var b = law.blocks[j];
      var here = b.region < 0 || b.region === undefined || b.region == c.region;
      var rmult = b.region >= 0 ? (here ? 1.3 : 0.15) : 1;
      if (b.type == "money") {
        var A = (parseFloat(b.amount) || 0) * ph;
        if (b.kind == "oneoff" && g.week - law.since > 26) continue;
        var T = lawTarget(b.target), mx = Math.max.apply(null, T.q);
        var inGroup = T.q[c.q] / mx * (T.age[c.age] || 0);
        if (T.rural) inGroup *= rural ? 1 : 0.2;
        var size = Math.min(0.06, A / Y / T.pop);
        if (b.kind == "benefit" || b.kind == "oneoff" || b.kind == "taxbreak") x += (0.35 * size * inGroup - 0.04 * A / Y) * rmult;
        if (b.kind == "taxgroup") x += (-0.5 * size * inGroup + (b.target == "rich20" || b.target == "superrich" ? 0.04 * A / Y * (c.q <= 2 ? 1 : 0) : 0)) * rmult;
        if (b.kind == "programme") {
          var ar = lawArea(b.area), ap = ar.ap;
          if (ap) x += apValue(ap, c, libness, rural, urban) * Math.min(2, A / Y * 100) * rmult;
          if (ar.service) x += 0.3 * A / Y * rmult;
        }
        if (b.kind == "subsidy") x += (b.sector == "agri" && rural ? 0.5 : 0.1) * A / Y * 10 * rmult;
        if (b.kind == "levy") x -= 0.08 * A / Y * 10 * rmult;
        if (b.kind == "nationalise") x += (c.q <= 1 ? 0.012 : (c.q == 4 ? -0.02 : 0)) * ph;
        if (b.kind == "privatise") x += (c.q <= 2 ? -0.012 : 0.004) * ph;
        continue;
      }
      var m = lawMeasure(b.measure);
      if (!m || !m.ap) continue;
      var s = clamp(parseFloat(b.strength) || 0, 0, 100) / 100 * ph;
      x += apValue(m.ap, c, libness, rural, urban) * s * rmult;
    }
  }
  var fx = g.lawFx;
  if (fx && fx.spendLines) {
    var net = 0;
    for (var k in fx.spendLines) net += fx.spendLines[k];
    for (var k in fx.revLines) net -= fx.revLines[k];
    if (net > 0) x -= net / Y * (0.3 + 0.15 * c.q);
  }
  return clamp(x * LAW_AP_SCALE, -0.2, 0.2);
}
var LAW_AP_SCALE = 0.6;
function apValue(ap, c, libness, rural, urban) {
  var x = ap.all || 0;
  if (ap.q) x += ap.q[c.q] || 0;
  if (ap.age) x += ap.age[c.age] || 0;
  if (ap.lib) x += ap.lib * libness;
  if (ap.rural && rural) x += ap.rural;
  if (ap.urban && urban) x += ap.urban;
  return x;
}
function lawLean(law) {
  var lean = 0, soc = 0, n = 0;
  for (var j = 0; j < law.blocks.length; j++) {
    var b = law.blocks[j], l = 0, so = 0;
    if (b.type == "money") {
      var rich = b.target == "rich20" || b.target == "superrich" || b.target == "homeowners";
      l = { benefit: -0.5, oneoff: -0.4, taxbreak: rich ? 0.7 : -0.2, taxgroup: rich ? -0.7 : 0.4, programme: -0.3, subsidy: -0.2, levy: -0.4, nationalise: -0.9, privatise: 0.8 }[b.kind] || 0;
      if (b.kind == "programme" && (b.area == "borders" || b.area == "religion" || b.area == "propaganda")) so = -0.5;
      if (b.kind == "programme" && (b.area == "aid" || b.area == "environment")) so = 0.4;
    } else {
      var m = lawMeasure(b.measure);
      if (m) { var s = clamp(parseFloat(b.strength) || 0, 0, 100) / 100; l = (m.lean || 0) * (0.5 + s / 2); so = (m.soc || 0) * (0.5 + s / 2); }
    }
    lean += l; soc += so; n++;
  }
  return { lean: n ? clamp(lean / Math.sqrt(n), -1, 1) : 0, soc: n ? clamp(soc / Math.sqrt(n), -1, 1) : 0 };
}
function startLaw(g, law, preview) {
  law.since = g.week;
  law.active = true;
  law.phase = preview ? 1 : 0;
  var goal = lawGoal(law.goal);
  var now = g.history && g.history[g.history.length - 1];
  law.base = goal.key && now ? now[goal.key] : null;
  if (law.reviewYears) law.reviewWeek = g.week + Math.round(law.reviewYears * 52);
  if (law.sunsetYears) law.sunset = g.week + Math.round(law.sunsetYears * 52);
  var Y = g.econ.gdp, one = 0;
  for (var j = 0; j < law.blocks.length; j++) {
    var b = law.blocks[j];
    if (b.type == "money" && b.kind == "nationalise") one += parseFloat(b.amount) || 0;
    if (b.type == "money" && b.kind == "privatise") one -= parseFloat(b.amount) || 0;
    if (b.type == "measure") {
      var m = lawMeasure(b.measure);
      var share = b.region >= 0 && g.regions[b.region] ? g.regions[b.region].pop / totalPop(g) : 1;
      if (m && m.fx && m.fx.oneOff) one += m.fx.oneOff * Y * clamp(parseFloat(b.strength) || 0, 0, 100) / 100 * share;
    }
  }
  if (one) g.debtAdjust = (g.debtAdjust || 0) + one;
  g.customLaws.push(law);
  g.lawFx = computeLawFx(g);
}
function blockText(g, b) {
  var where = b.region >= 0 && g.regions[b.region] ? " (only in " + g.regions[b.region].name + ")" : "";
  if (b.type == "money") {
    var k = moneyKind(b.kind), what = "";
    if (k.needs == "target") what = lawTarget(b.target).name.toLowerCase();
    if (k.needs == "area") what = lawArea(b.area).name.toLowerCase();
    if (k.needs == "sector") { var si = sectorIndex(b.sector); what = si >= 0 ? SECTORS[si].name.toLowerCase() : b.sector; }
    var amt = money(g, parseFloat(b.amount) || 0) + (k.unit.indexOf("once") >= 0 ? " (one-off)" : " a year");
    var verb = { benefit: "Pay " + amt + " to " + what, taxbreak: "Cut taxes by " + amt + " for " + what, taxgroup: "Raise " + amt + " in extra tax from " + what, oneoff: "Give " + what + " a one-off " + amt,
      programme: "Spend " + amt + " on " + what, subsidy: "Subsidise " + what + " with " + amt, levy: "Charge " + what + " a levy of " + amt,
      nationalise: "Nationalise " + what + " (paying " + amt + ")", privatise: "Sell state firms in " + what + " (raising " + amt + ")" }[b.kind];
    return verb + where;
  }
  var m = lawMeasure(b.measure);
  var s = Math.round(parseFloat(b.strength) || 0);
  return (m ? m.name : b.measure) + (s < 100 ? " (strength " + s + "%)" : "") + where;
}
function lawForecastText(g, law) {
  var g2 = { econ: g.econ, regions: g.regions, pop: g.pop, week: g.week, customLaws: [law], history: g.history };
  law.active = true; law.phase = 1; law.since = g.week;
  var fx = computeLawFx(g2);
  var out = [];
  var Y = g.econ.gdp;
  var spend = 0, rev = 0;
  for (var k in fx.spendLines) spend += fx.spendLines[k];
  for (var k in fx.revLines) rev += fx.revLines[k];
  for (var k in fx.svc) spend += 0;
  if (spend) out.push("Costs about <b>" + money(g, spend) + "</b> a year (" + pct(spend / Y, 1) + " of GDP).");
  if (rev > 0) out.push("Raises about <b>" + money(g, rev) + "</b> a year.");
  if (rev < 0) out.push("Loses about <b>" + money(g, -rev) + "</b> a year in tax.");
  var bits = [["crime", "crime", true], ["emis", "emissions", true], ["health", "hospital demand", true], ["births", "births", false]];
  for (var i = 0; i < bits.length; i++) { var v = fx[bits[i][0]]; if (Math.abs(v) >= 0.005) out.push((v < 0 ? "Cuts " : "Raises ") + bits[i][1] + " by about " + Math.round(Math.abs(v) * 100) + "%."); }
  if (Math.abs(fx.prod) >= 0.0003) out.push((fx.prod > 0 ? "Helps" : "Hurts") + " long-term productivity (" + (fx.prod > 0 ? "+" : "") + (fx.prod * 100).toFixed(2) + " points of growth a year).");
  if (Math.abs(fx.infl) >= 0.001) out.push((fx.infl > 0 ? "Pushes inflation up" : "Pulls inflation down") + " by about " + Math.abs(fx.infl * 100).toFixed(1) + " points.");
  if (Math.abs(fx.part) >= 0.002) out.push((fx.part > 0 ? "More" : "Fewer") + " people in work or looking for work.");
  if (Math.abs(fx.migr) >= 0.001) out.push((fx.migr > 0 ? "About " + Math.round(fx.migr * 1000) + "k more people arrive" : "About " + Math.round(-fx.migr * 1000) + "k fewer people (arrivals stopped or people leaving)") + " each year.");
  if (Math.abs(fx.inv) >= 0.005) out.push("Business investment " + (fx.inv > 0 ? "up" : "down") + " about " + Math.round(Math.abs(fx.inv) * 100) + "%.");
  for (var i = 0; i < SECTORS.length; i++) if (Math.abs(fx.sec[i]) >= 0.01) out.push(SECTORS[i].name + " " + (fx.sec[i] > 0 ? "grows" : "shrinks") + " about " + Math.round(Math.abs(fx.sec[i]) * 100) + "%.");
  if (Math.abs(fx.di) >= 0.5) out.push("Democracy index " + (fx.di > 0 ? "+" : "") + fx.di.toFixed(1) + ".");
  if (Math.abs(fx.unrest) >= 1) out.push("Unrest " + (fx.unrest > 0 ? "rises" : "falls") + ".");
  if (Math.abs(fx.legit) >= 1) out.push("Legitimacy " + (fx.legit > 0 ? "rises" : "falls") + ".");
  if (Math.abs(fx.corrupt) >= 1) out.push("Corruption " + (fx.corrupt > 0 ? "rises" : "falls") + ".");
  if (Math.abs(fx.loyalty) >= 1) out.push("Army loyalty " + (fx.loyalty > 0 ? "rises" : "falls") + ".");
  if (Math.abs(fx.relDem) >= 1 || Math.abs(fx.relAll) >= 1) out.push("Foreign relations " + (fx.relDem + fx.relAll > 0 ? "improve" : "get worse") + (Math.abs(fx.relDem) > Math.abs(fx.relAll) ? " (especially with democracies)" : "") + ".");
  var groups = [];
  var names = { 0: "children", 1: "working-age", 2: "over-65s" };
  var best = null, worst = null;
  for (var i = 0; i < g.cohorts.length; i++) {
    var c = g.cohorts[i];
    if (c.age == 0) continue;
    var e = lawCohortEffect(g2c(g, law), c);
    if (!best || e > best.e) best = { c: c, e: e };
    if (!worst || e < worst.e) worst = { c: c, e: e };
  }
  if (best && best.e > 0.002) out.push("Most popular with <b>" + cohortName(g, best.c) + "</b>.");
  if (worst && worst.e < -0.002) out.push("Least popular with <b>" + cohortName(g, worst.c) + "</b>.");
  var ln = lawLean(law);
  out.push("Politically it looks " + (ln.lean < -0.25 ? "left-wing" : (ln.lean > 0.25 ? "right-wing" : "centrist")) + " on the economy and " + (ln.soc < -0.25 ? "traditional" : (ln.soc > 0.25 ? "liberal" : "middle of the road")) + " on social issues.");
  return out;
}
function g2c(g, law) {
  return { econ: g.econ, regions: g.regions, pop: g.pop, week: g.week, customLaws: [law], cohorts: g.cohorts };
}
var QUINTILE_NAMES = ["the poorest 20%", "lower-income", "middle-income", "comfortable", "the richest 20%"];
function cohortName(g, c) {
  var age = c.age == 2 ? "pensioners" : (c.age == 0 ? "children" : "working-age people");
  var q = ["the poorest", "lower-income", "middle-income", "better-off", "the richest"][c.q];
  return q + " " + age + " in " + g.regions[c.region].name;
}
function lawProblems(g, law) {
  var p = [], c = g.constitution, Y = g.econ.gdp;
  if (!law.blocks.length) p.push({ kind: "ECONOMIC", msg: "The law doesn't do anything yet. Add at least one part." });
  if (law.blocks.length > 10) p.push({ kind: "ADMIN", msg: "Too many parts in one law (max 10). Split it into two laws." });
  var totalMoney = 0;
  for (var j = 0; j < law.blocks.length; j++) {
    var b = law.blocks[j];
    if (b.type == "money") {
      var A = parseFloat(b.amount);
      if (isNaN(A) || A < 0) p.push({ kind: "ECONOMIC", msg: "Amounts must be positive numbers." });
      else if (A > Y * 0.15) p.push({ kind: "ECONOMIC", msg: "One part costs more than 15% of GDP. The model doesn't support that." });
      if (b.kind == "taxgroup") {
        var T = lawTarget(b.target);
        if (A > Y * T.pop * 0.15 + (b.target == "superrich" ? Y * 0.01 : 0)) p.push({ kind: "ECONOMIC", msg: "That's more tax than " + T.name.toLowerCase() + " could pay." });
      }
      if (b.kind == "nationalise" && g.constitution.economy == "planned") p.push({ kind: "LEGAL", msg: "In a planned economy big industry is already owned by the state." });
      totalMoney += A || 0;
      continue;
    }
    var m = lawMeasure(b.measure);
    if (!m) { p.push({ kind: "LEGAL", msg: "Unknown measure." }); continue; }
    var s = clamp(parseFloat(b.strength) || 0, 0, 100) / 100;
    if (!(s > 0)) p.push({ kind: "ECONOMIC", msg: m.name + ": strength must be between 1 and 100." });
    var di = (m.fx && m.fx.di || 0) * s;
    if (di <= -2.5 && c.judiciary == "independent") p.push({ kind: "LEGAL", msg: "The independent courts would strike down \"" + m.name + "\" as unconstitutional. Lower its strength, or change the courts in the constitution first." });
    if (c.religion == "secular" && (m.id == "statereligion" || m.id == "blasphemy" || m.id == "religiousschools")) p.push({ kind: "LEGAL", msg: "\"" + m.name + "\" breaks the constitution's strictly secular state." });
    if (c.religion == "state" && m.id == "secularschools") p.push({ kind: "LEGAL", msg: "\"" + m.name + "\" conflicts with the official state religion in the constitution." });
    if (c.assembly == "free" && (m.id == "opposition" || m.id == "curfew") && c.judiciary != "controlled" && s > 0.5) p.push({ kind: "LEGAL", msg: "\"" + m.name + "\" conflicts with the constitutional right to protest. Use a strength of 50 or less, or amend the constitution." });
    if (c.press == "free" && m.id == "censorship" && c.judiciary != "controlled") p.push({ kind: "LEGAL", msg: "Internet censorship conflicts with the constitution's free press." });
  }
  if (totalMoney > Y * 0.25) p.push({ kind: "ADMIN", msg: "The civil service can't deliver programmes this big all at once (over 25% of GDP)." });
  var inForce = {};
  for (var i = 0; i < (g.customLaws || []).length; i++) { var L = g.customLaws[i]; if (L.active && L.id != law.replaces) for (var j = 0; j < L.blocks.length; j++) if (L.blocks[j].type == "measure" && (L.blocks[j].region < 0 || L.blocks[j].region === undefined)) inForce[L.blocks[j].measure] = L.name; }
  for (var j = 0; j < law.blocks.length; j++) { var b = law.blocks[j]; if (b.type == "measure" && inForce[b.measure] && (b.region < 0 || b.region === undefined)) p.push({ kind: "LEGAL", msg: "\"" + lawMeasure(b.measure).name + "\" is already law (in " + inForce[b.measure] + "). Repeal or reform that law instead." }); }
  return p;
}
function findLaw(g, id) { for (var i = 0; i < (g.customLaws || []).length; i++) if (g.customLaws[i].id == id) return g.customLaws[i]; }
