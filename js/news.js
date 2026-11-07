var EVENT_MINISTRY = {
  gdp: "finance", inflation: "finance", jobs: "labour", rate: "finance", creditShock: "finance", energyShock: "energy", world: "finance",
  waiting: "health", healthEmergency: "health", strike: "labour", protest: "interior", riot: "interior", disaster: "interior", border: "defence",
  treaty: "foreign", offer: "foreign", war: "defence", warReport: "defence", peace: "foreign", pensions: "labour", census: "interior",
  scandal: "interior", appointment: "interior", ministry: "finance", lawReview: "justice", lawEarly: "justice", lawExpires: "justice"
};
var INTEREST_GROUPS = [
  { id: "unions", name: "the Trades Union Congress", spokes: "general secretary", econ: -1, soc: 0 },
  { id: "business", name: "the Federation of Employers", spokes: "director general", econ: 1, soc: 0 },
  { id: "greens", name: "Friends of the Land", spokes: "campaign director", env: 1, soc: 0.5 },
  { id: "church", name: "the Council of Churches", spokes: "senior bishop", soc: -1 },
  { id: "liberties", name: "the Civil Liberties League", spokes: "director", di: 1, soc: 1 },
  { id: "pensioners", name: "the Pensioners' Association", spokes: "chair", age: 2 },
  { id: "students", name: "the National Union of Students", spokes: "president", age: 1, soc: 0.6 },
  { id: "farmers", name: "the Farmers' Union", spokes: "president", rural: 1 },
  { id: "police", name: "the Police Federation", spokes: "chair", crime: 1 },
  { id: "doctors", name: "the Medical Association", spokes: "chair", health: 1 },
  { id: "taxpayers", name: "the Taxpayers' Alliance", spokes: "chief executive", econ: 1, money: 1 },
  { id: "poverty", name: "the Child Poverty Action Group", spokes: "director", econ: -1, poor: 1 }
];
var JOBS = [["a cleaner", "a care worker", "an unemployed builder", "a shop assistant", "a cook"], ["a bus driver", "a hairdresser", "a warehouse worker", "a nurse", "a plumber"],
  ["a teacher", "a police officer", "an electrician", "an office manager", "a small shop owner"], ["an engineer", "a pharmacist", "a civil servant", "an IT consultant", "a dentist"],
  ["a company director", "a lawyer", "a surgeon", "a property developer", "an investor"]];
var RETIRED = ["a retired miner", "a retired teacher", "a widow", "a retired farmer", "a retired nurse", "a retired engineer"];
function nhash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function journalist(o) { var h = nhash(o.id + "journo"); return FIRST_NAMES[h % FIRST_NAMES.length] + " " + LAST_NAMES[(h >>> 8) % LAST_NAMES.length]; }
function lastName(n) { var p = String(n).split(" "); return p[p.length - 1]; }
function leaderRef(g) { return g.constitution.title + " " + g.leaderName; }
function oppositionLeader(g) {
  var best = null;
  for (var i = 0; i < g.parties.length; i++) { var p = g.parties[i]; if (!p.inGov && !p.banned && (!best || p.seats + p.poll * 50 > best.seats + best.poll * 50)) best = p; }
  return best;
}
function ministerFor(g, type) {
  var id = EVENT_MINISTRY[type] || "finance";
  var m = minister(g, id);
  return m ? { name: m.name, title: "Minister for " + ministryName(m.ministry) } : null;
}
function mediaStance(g, outletId) { return g.media && g.media[outletId] ? g.media[outletId] : 0; }
function leaderNickname(g) {
  var ln = lastName(g.leaderName), c = g.constitution;
  var taxUps = 0, decrees = 0, laws = (g.customLaws || []).length, broken = 0, kept = 0;
  for (var i = 0; i < g.bills.length; i++) {
    var b = g.bills[i];
    if (b.decree) decrees++;
    if (b.stage == "IMPLEMENTED") for (var j = 0; j < b.changes.length; j++) if (b.changes[j].kind == "tax" && b.changes[j].to > b.changes[j].from) taxUps++;
  }
  for (var i = 0; g.pledges && i < g.pledges.length; i++) { if (g.pledges[i].status == "broken") broken++; if (g.pledges[i].status == "kept") kept++; }
  if (g.war) return "Warlord " + ln;
  if (broken >= 2) return "Promise-Breaker " + ln;
  if (decrees >= 5 || c.executive == "junta") return "Iron " + ln;
  if (taxUps >= 3) return "Taxman " + ln;
  if (kept >= 2) return "Steady " + ln;
  if (laws >= 6) return "Busy " + ln;
  if (g.politics.approval > 0.55) return "Teflon " + ln;
  if (g.politics.approval < 0.3) return "Lame Duck " + ln;
  return null;
}
function voxPop(g, c, topic) {
  var seed = nhash(g.week + ":" + c.region + ":" + c.age + ":" + c.q + ":" + (topic || ""));
  var name = FIRST_NAMES[seed % FIRST_NAMES.length] + " " + LAST_NAMES[(seed >>> 7) % LAST_NAMES.length].charAt(0) + ".";
  var age = c.age == 2 ? 66 + (seed % 20) : 19 + (seed % 45);
  var job = c.age == 2 ? RETIRED[seed % RETIRED.length] : JOBS[c.q][(seed >>> 3) % 5];
  var place = g.regions[c.region].name;
  var worst = null, best = null;
  for (var k in c.factors) {
    if (k == "Time in office" || k == "Ideology") continue;
    var v = c.factors[k];
    if (!worst || v < worst.v) worst = { k: k, v: v };
    if (!best || v > best.v) best = { k: k, v: v };
  }
  var happy = c.approval > 0.5;
  var said = "";
  var f = happy ? best : worst;
  if (f && Math.abs(f.v) > 0.01) said = factorQuote(g, f.k, f.v > 0, c);
  else said = (happy ? ["Honestly, things are fine. I can't complain.", "We're getting by. Better than some.", "I don't follow politics much, but life's OK.", "No big complaints from me."] : ["Nothing ever changes for people like me.", "Politicians all promise the same thing.", "I just want someone who listens.", "It's hard to see what they've actually done."])[seed % 4];
  var verdict = c.approval > 0.6 ? "I'll vote for them again." : (c.approval > 0.45 ? "They're doing all right, I suppose." : (c.approval > 0.3 ? "I'm losing patience with " + lastName(g.leaderName) + "." : "They've completely forgotten about us."));
  return { who: name + ", " + age + ", " + job + " from " + place, text: said + " " + verdict };
}
function factorQuote(g, k, good, c) {
  var hs = g.services.health, e = g.econ;
  var Q = {
    "Household income": good ? ["I've got a bit more money at the end of the month now.", "For once my pay goes further."] : ["Every month there's less left over.", "My wages just don't cover the bills any more."],
    "Pensions": good ? ["My pension finally went up properly."] : ["My pension buys less every year."],
    "Prices": good ? ["Prices have calmed down at last."] : ["Have you seen the price of food? Inflation is " + pct(e.infl, 1) + "!", "Everything costs more every time I go to the shop."],
    "Jobs": good ? ["There's work around again."] : ["I've been looking for work for months.", "My son can't find a job anywhere."],
    "Health service": good ? ["I got my operation quickly. Credit where it's due."] : ["I've waited " + Math.round(hs.wait) + " weeks for a hospital appointment.", "The hospital is a disgrace. " + Math.round(hs.wait) + " weeks to be seen!"],
    "Schools": good ? ["The kids' school has improved a lot."] : ["My daughter's class has no proper teacher."],
    "Crime": good ? ["I feel safer walking home than I did."] : ["I don't let my kids out after dark any more.", "There was another break-in on our street."],
    "Transport": good ? ["The trains actually run on time now."] : ["The buses are a joke round here."],
    "Specific policies": good ? ["I like some of the new policies."] : ["Some of these new rules are ridiculous."],
    "Your own laws": good ? ["The " + recentLawName(g) + " has really helped people like me."] : ["This " + recentLawName(g) + " is hurting people like me."],
    "Events and scandals": good ? ["They seem to handle a crisis well."] : ["Scandal after scandal. Who's running this country?"],
    "Constitution and rights": good ? ["I'm glad about the changes to how the country is run."] : ["They're taking away our rights bit by bit."],
    "War and peace": good ? ["I'm proud of our soldiers."] : ["Bring our boys home. This war is madness."]
  };
  var arr = Q[k] || (good ? ["Things are looking up."] : ["Things are getting worse."]);
  return arr[nhash(k + g.week + c.region) % arr.length];
}
function recentLawName(g) {
  var L = (g.customLaws || []).filter(function (l) { return l.active; });
  return L.length ? L[L.length - 1].name : "government's new law";
}
function oppQuote(g, ev, tone) {
  var op = oppositionLeader(g);
  if (!op || g.constitution.partySystem == "single") return null;
  var me = lastName(g.leaderName), ttl = g.constitution.title;
  var lines = ev.valence < 0
    ? ["This is what happens when " + me + " puts " + playerParty(g).name + " before the country.", "The " + ttl + " has run out of ideas and out of excuses.", "People are paying the price for " + me + "'s mistakes.", "How many more weeks like this before " + me + " admits they got it wrong?"]
    : (ev.valence > 0 ? ["Good news, but no thanks to " + me + ". The government got lucky.", "We welcome it, but families still feel worse off than when " + me + " took office."]
      : ["We'll be watching the " + ttl + " very closely.", "The government owes the country an explanation."]);
  if (g.constitution.press == "state") return null;
  return { who: op.leader + ", leader of the " + op.name, text: pickNews(g, lines) };
}
function govQuote(g, ev) {
  var m = ministerFor(g, ev.type);
  var bill = ev.bill ? findBill(g, ev.bill) : null;
  if (bill) { var mm = minister(g, bill.ministry); if (mm) m = { name: mm.name, title: "Minister for " + ministryName(mm.ministry) }; }
  var who = m ? m.name + ", " + m.title : g.leaderName + ", " + g.constitution.title;
  if (bill && (ev.type == "lawInForce" || ev.type == "billPass")) return { who: who, text: pickNews(g, ["This law will make a real difference to people's lives.", "We said we would act, and we have.", "This is about fairness, and it's about time."]) };
  var lines = ev.valence < 0 ? ["We are taking this very seriously and we have a plan.", "These are difficult times, but we will not change course.", "Nobody is more frustrated than me. We are acting."]
    : (ev.valence > 0 ? ["This shows our plan is working.", "We promised results and we are delivering them.", "This is good news for every family in " + g.country.name + "."]
      : ["We are watching the situation carefully.", "The government will set out its response shortly."]);
  return { who: who, text: pickNews(g, lines) };
}
function groupReactions(g, bill) {
  if (!bill) return [];
  var lean = bill.lean || 0, soc = bill.socialLean || 0;
  var fx = emptyFx(), hasLaw = false, money = 0;
  for (var i = 0; i < bill.changes.length; i++) {
    var c = bill.changes[i];
    if (c.kind == "law") { hasLaw = true; var f2 = computeLawFx({ econ: g.econ, regions: g.regions, pop: g.pop, week: g.week, customLaws: [mkActive(c.to)] }); for (var k in f2) if (typeof f2[k] == "number") fx[k] += f2[k]; for (var k in f2.spendLines) money += f2.spendLines[k]; }
    if (c.kind == "spend") money += c.to - c.from;
    if (c.kind == "tax") money -= (c.to - c.from) * g.econ.gdp * 0.002;
  }
  var out = [];
  for (var i = 0; i < INTEREST_GROUPS.length; i++) {
    var ig = INTEREST_GROUPS[i], s = 0;
    if (ig.econ) s += ig.econ * lean * 1.5;
    if (ig.soc) s += ig.soc * soc;
    if (ig.env) s += -fx.emis * 8;
    if (ig.di) s += fx.di * 0.3;
    if (ig.crime) s += -fx.crime * 6;
    if (ig.health) s += -fx.health * 10 + (fx.svc ? 0 : 0);
    if (ig.money) s += -money / g.econ.gdp * 60;
    if (ig.poor) s += -lean;
    if (Math.abs(s) < 0.3) continue;
    out.push({ g: ig, s: s });
  }
  out.sort(function (a, b) { return Math.abs(b.s) - Math.abs(a.s); });
  return out.slice(0, 2).map(function (x) {
    var name = FIRST_NAMES[nhash(x.g.id + g.rng.seed) % FIRST_NAMES.length] + " " + LAST_NAMES[nhash(x.g.id + "l" + g.rng.seed) % LAST_NAMES.length];
    var text = x.s > 0 ? pickNews(g, ["This is a big step in the right direction.", "We have campaigned for this for years. Well done.", "Our members will welcome this."])
      : pickNews(g, ["This is a disaster and we will fight it.", "Nobody asked for this. It will hurt our members.", "We urge the government to think again."]);
    return { who: name + ", " + x.g.spokes + " of " + x.g.name, text: text, s: x.s };
  });
}
function mkActive(law) { var l = copy(law); l.active = true; l.phase = 1; l.since = 0; return l; }
function memoryLine(g, ev) {
  var same = g.events.filter(function (e) { return e.type == ev.type && e.id != ev.id && e.week > g.week - 52 && e.week <= g.week; });
  var lines = [];
  if (same.length >= 2) lines.push("It is the " + ordinal(same.length + 1) + " time this has happened in the past year.");
  else if (same.length == 1) lines.push("It comes only " + (g.week - same[0].week) + " weeks after a similar story on " + same[0].date + ".");
  var L = (g.customLaws || []).filter(function (l) { return l.active && g.week - l.since < 40; });
  var goalFor = { waiting: "wait", healthEmergency: "wait", jobs: "u", inflation: "infl", protest: "unrest", riot: "unrest", gdp: "growth" };
  for (var i = 0; i < L.length; i++) if (goalFor[ev.type] && L[i].goal == goalFor[ev.type]) lines.push((ev.valence < 0 ? "Critics point out that the " + L[i].name + ", which came into force " + (g.week - L[i].since) + " weeks ago, was supposed to fix exactly this." : "Ministers credit the " + L[i].name + ", passed " + (g.week - L[i].since) + " weeks ago."));
  var P = (g.pledges || []).filter(function (p) { return p.status == "open"; });
  var pledgeFor = { waiting: "wait", jobs: "u", inflation: "infl", gdp: "growth" };
  for (var i = 0; i < P.length; i++) if (pledgeFor[ev.type] == P[i].type) lines.push("The " + g.constitution.title + " has promised " + pledgeText(g, P[i]) + " by " + weekDate(g, P[i].deadline) + ".");
  return lines.join(" ");
}
function roundN(v) { return typeof v == "number" ? Math.round(v * 100) / 100 : v; }
function ordinal(n) { return n + (n % 10 == 1 && n != 11 ? "st" : (n % 10 == 2 && n != 12 ? "nd" : (n % 10 == 3 && n != 13 ? "rd" : "th"))); }
function makeNews(g) {
  if (!g.media) { g.media = {}; for (var i = 0; i < OUTLETS.length; i++) g.media[OUTLETS[i].id] = 0; }
  for (var k in g.media) g.media[k] *= 0.97;
  pledgesWeekly(g);
  var evs = g.events.filter(function (e) { return !e.covered && e.week >= g.week - 1; });
  for (var i = 0; i < evs.length; i++) evs[i].covered = true;
  var govEcon = avgGovEcon(g);
  var press = g.constitution.press;
  for (var i = 0; i < evs.length; i++) {
    var ev = evs[i];
    for (var j = 0; j < OUTLETS.length; j++) {
      var o = OUTLETS[j];
      var p = 0.15 + 0.25 * ev.severity;
      if (o.id == "ledger" && ["gdp", "rate", "inflation", "creditShock", "treaty", "world", "lawInForce", "billPass"].indexOf(ev.type) >= 0) p += 0.4;
      if (o.id == "flash" && ["scandal", "protest", "strike", "disaster", "border", "riot", "pressResponse", "pledgeBroken", "war"].indexOf(ev.type) >= 0) p += 0.5;
      if (o.id == "regional" && ev.region !== null) p += 0.5;
      if (o.id == "nbs") p += 0.15;
      if (["lawReview", "lawEarly", "pledge", "pledgeKept", "pledgeBroken", "pressResponse"].indexOf(ev.type) >= 0) p += 0.3;
      if (press == "state" && o.id != "nbs") continue;
      if (press == "restricted" && o.id == "flash") continue;
      if (press == "state" && ev.valence < 0 && randNews(g) < 0.7) continue;
      if (randNews(g) >= p) continue;
      var friendly = 1 - Math.abs(o.lean - govEcon) / 40 + mediaStance(g, o.id);
      var tone = ev.valence + friendly * 0.6 + (randNews(g) - 0.5) * o.sensational;
      if (press == "state") tone = Math.max(tone, 0.7) + 0.3;
      if (press == "restricted") tone = Math.max(tone, -0.3);
      g.news.push(writeArticle(g, ev, o, tone));
    }
  }
  if (g.week > 1 && g.week % 2 == 0) { var vf = voicesFeature(g); if (vf) g.news.push(vf); }
  if (g.week > 3 && g.week % 4 == 1) { var ed = editorial(g); if (ed) g.news.push(ed); }
}
function writeArticle(g, ev, o, tone) {
  var head = ev.title;
  var nick = leaderNickname(g);
  var ttl = g.constitution.title, me = g.leaderName;
  var toneWord = tone > 0.6 ? "positive" : (tone < -0.4 ? "critical" : "neutral");
  if (o.sensational > 0.7) {
    if (nick && ev.valence < 0 && randNews(g) < 0.6) head = nick.toUpperCase() + " IN TROUBLE: " + head;
    head = head.toUpperCase();
    if (tone < -0.2) head += "!";
    if (ev.type == "scandal") head = "SHAME OF " + (ev.facts.minister || "MINISTER").toUpperCase() + ": " + head;
  } else if (o.id == "ledger" && ev.type == "lawInForce") head = "Business digests " + ev.title.replace(" comes into force", "");
  else if (o.id == "regional" && ev.region !== null && ev.region !== undefined) head = g.regions[ev.region].name + ": " + head;
  var stand = "";
  if (tone > 0.6) stand = pickNews(g, ["A boost for " + ttl + " " + me + ".", "Good news for " + me + "'s government at last.", "Ministers are celebrating."]);
  else if (tone < -0.4) stand = pickNews(g, ["A fresh blow for " + ttl + " " + me + ".", "More bad news for the " + playerParty(g).name + " government.", "Pressure is growing on " + me + "."]);
  else stand = pickNews(g, ["What it means for you.", "The details, and what happens next.", "Our reporter explains."]);
  var paras = [];
  var factText = [];
  var narrated = ["pledge", "pledgeKept", "pledgeBroken", "pressResponse", "lawReview", "lawEarly", "lawInForce", "billPass", "billFail", "lawExpires"].indexOf(ev.type) >= 0;
  if (!narrated) for (var k in ev.facts) if (typeof ev.facts[k] != "object" && k != "bill") factText.push(niceKey(k) + ": " + ev.facts[k]);
  paras.push(ev.title + ". " + ev.cause + (factText.length ? " " + pickNews(g, ["Figures show", "The numbers:", "Key facts:"]) + " " + factText.join("; ") + "." : ""));
  if (ev.type == "pledgeBroken" && ev.facts.result) paras.push("The figure on the deadline day: " + ev.facts.result + ".");
  var mem = memoryLine(g, ev);
  if (mem) paras.push(mem);
  var bill = ev.bill ? findBill(g, ev.bill) : null;
  var quotes = [];
  if (bill && (ev.type == "billPass" || ev.type == "lawInForce" || ev.type == "billFail")) {
    var what = [];
    for (var i = 0; i < bill.changes.length; i++) {
      var c = bill.changes[i];
      if (c.kind == "law") what = what.concat(c.to.blocks.map(function (b) { var t = blockText(g, b); return b.type == "measure" ? "bring in: " + t.charAt(0).toLowerCase() + t.slice(1) : t.charAt(0).toLowerCase() + t.slice(1); }));
      else if (c.kind == "repeal") what.push("scrap the " + (findLaw(g, c.id) ? findLaw(g, c.id).name : "law"));
      else if (c.kind == "tax" || c.kind == "spend" || c.kind == "policy") what.push(c.name.toLowerCase() + " " + (c.to > c.from ? "up" : "down") + " from " + roundN(c.from) + " to " + roundN(c.to) + (c.unit ? " " + c.unit : ""));
      else if (c.kind == "amend") what.push("change the constitution (" + c.name.toLowerCase() + ")");
      else if (c.kind == "identity") what.push("change the " + c.name.toLowerCase());
    }
    if (what.length) paras.push((ev.type == "billFail" ? "It would have " : "It will ") + what.slice(0, 6).join(", ") + (what.length > 6 ? " and more" : "") + ".");
    var reacts = groupReactions(g, bill);
    for (var i = 0; i < reacts.length; i++) quotes.push(reacts[i]);
    var last = bill.votes[bill.votes.length - 1];
    if (last && last.parties) {
      var rebels = last.parties.filter(function (p) { return p.no > 0 && findPartyByName(g, p.name) && findPartyByName(g, p.name).inGov; });
      if (rebels.length) paras.push("There was a rebellion: " + rebels.map(function (r) { return r.no + " members of the " + r.name; }).join(" and ") + " voted against their own government.");
    }
    if (bill.decree) paras.push("There was no vote. The " + ttl + " signed it into law personally.");
  }
  if (ev.type == "lawReview" || ev.type == "lawEarly") {
    paras.push(ev.facts.before ? "When the " + ev.facts.law + " started, the figure was " + ev.facts.before + ". It is now " + ev.facts.after + "." : "");
  }
  if (ev.type == "pressResponse" && ev.facts.statement) quotes.push({ who: me + ", " + ttl, text: ev.facts.statement });
  if (ev.type == "pledge" || ev.type == "pledgeKept" || ev.type == "pledgeBroken") quotes.push({ who: me + ", " + ttl + (ev.type == "pledge" ? "" : " (" + (ev.facts.made || "earlier") + ")"), text: ev.facts.quote || "" });
  if (ev.severity >= 2 && ["start", "pressResponse", "pledge"].indexOf(ev.type) < 0) {
    quotes.push(govQuote(g, ev));
    var oq = oppQuote(g, ev, tone);
    if (oq) quotes.push(oq);
  }
  if (ev.severity >= 2 && o.id != "ledger" && randNews(g) < 0.7) {
    var c = pickCohortFor(g, ev);
    if (c) { var v = voxPop(g, c, ev.type); quotes.push({ who: v.who, text: v.text }); }
  }
  for (var i = 0; i < quotes.length; i++) if (quotes[i] && quotes[i].text) paras.push("“" + quotes[i].text.replace(/\.$/, ",") + "” said " + quotes[i].who + ".");
  if (o.id == "ledger") paras.push("Markets " + (ev.valence < 0 ? "reacted cautiously." : "took the news calmly.") + " The " + g.country.currency + " " + (g.econ.exch >= 100 ? "is trading above" : "is trading below") + " its level at the start of the government's term.");
  if (o.id == "flash" && nick) paras.push("Readers can tell " + nick + " what they think on our phone line.");
  if (o.id == "citizen" && ev.valence < 0) paras.push("As always, it is ordinary working families who pay the price.");
  if (o.id == "herald" && ev.valence < 0) paras.push("Taxpayers deserve better.");
  if (mediaStance(g, o.id) < -0.3) paras.push(pickNews(g, ["The " + ttl + "'s office did not reply to our questions. It has refused to speak to this paper since " + lastName(me) + " attacked our reporting.", "Relations between this newspaper and the government remain frosty."]));
  return {
    id: "AR-" + ev.id.slice(3) + "-" + o.id, week: ev.week, date: ev.date, outlet: o.id, headline: head, standfirst: stand,
    body: paras.filter(function (p) { return p; }).join("\n\n"), byline: journalist(o), event: ev.id, tone: toneWord, reliability: o.reliability, type: ev.type, region: ev.region, kind: "report"
  };
}
function findPartyByName(g, n) { for (var i = 0; i < g.parties.length; i++) if (g.parties[i].name == n) return g.parties[i]; }
function pickCohortFor(g, ev) {
  var list = g.cohorts.filter(function (c) { return c.age > 0 && (ev.region === null || ev.region === undefined || c.region == ev.region); });
  if (!list.length) return null;
  list.sort(function (a, b) { return Math.abs(b.approval - 0.45) - Math.abs(a.approval - 0.45); });
  return list[Math.floor(randNews(g) * Math.min(6, list.length))];
}
function voicesFeature(g) {
  if (g.constitution.press == "state") return null;
  var r = (g.week / 2) % g.regions.length;
  var cs = g.cohorts.filter(function (c) { return c.region == r && c.age > 0; });
  if (cs.length < 3) return null;
  var picks = [cs[nhash("a" + g.week) % cs.length], cs[nhash("b" + g.week) % cs.length], cs[nhash("c" + g.week) % cs.length]];
  var avg = 0, w = 0;
  for (var i = 0; i < cs.length; i++) { avg += cs[i].approval * cohortPop(g, cs[i]); w += cohortPop(g, cs[i]); }
  avg /= w;
  var paras = ["We asked people in " + g.regions[r].name + " what they think of " + g.constitution.title + " " + g.leaderName + ". In our latest poll, " + pct(avg, 0) + " of people here approve of the government (nationally: " + pct(g.politics.approval, 0) + ")."];
  for (var i = 0; i < picks.length; i++) { var v = voxPop(g, picks[i], "voices" + i); paras.push(v.who + ": “" + v.text + "”"); }
  var ev = addEvent(g, "voices", 1, "Voices of " + g.regions[r].name, { approval: pct(avg, 0) }, "Regular feature.", 0, false, null, r);
  ev.covered = true;
  return { id: "AR-" + ev.id.slice(3) + "-regional", week: g.week, date: weekDate(g), outlet: "regional", headline: "What " + g.regions[r].name + " really thinks of " + lastName(g.leaderName), standfirst: "Our reporters went out to listen.",
    body: paras.join("\n\n"), byline: journalist(OUTLETS[4]), event: ev.id, tone: avg > 0.5 ? "positive" : (avg < 0.38 ? "critical" : "neutral"), reliability: "Fair", type: "voices", region: r, kind: "feature" };
}
function editorial(g) {
  var press = g.constitution.press;
  var pool = press == "state" ? ["nbs"] : (press == "restricted" ? ["nbs", "herald", "citizen", "ledger"] : ["herald", "citizen", "ledger", "flash", "nbs"]);
  var oid = pool[(g.week >> 2) % pool.length], o = null;
  for (var i = 0; i < OUTLETS.length; i++) if (OUTLETS[i].id == oid) o = OUTLETS[i];
  var now = g.history[g.history.length - 1], then = g.history[Math.max(0, g.history.length - 13)];
  var me = g.leaderName, ttl = g.constitution.title, nick = leaderNickname(g);
  var friendly = 1 - Math.abs(o.lean - avgGovEcon(g)) / 40 + mediaStance(g, oid) + (press == "state" ? 2 : 0);
  var score = (now.approval - then.approval) * 10 + (now.growth - 0.015) * 20 - (now.infl - 0.02) * 15 - (now.u - then.u) * 30 + friendly * 0.5;
  var evs = g.events.filter(function (e) { return e.week > g.week - 13 && e.severity >= 2; });
  var best = null, worst = null;
  for (var i = 0; i < evs.length; i++) { if (evs[i].valence > 0 && !best) best = evs[i]; if (evs[i].valence < 0) worst = evs[i]; }
  var paras = [];
  paras.push(score > 0.3 ? pickNews(g, ["Credit where it is due.", "Say what you like about " + me + ", the government is getting things done."]) : (score < -0.3 ? pickNews(g, ["This government is drifting.", "It is time for some hard truths about " + me + "."]) : "It has been a mixed few months for the government."));
  paras.push("Since " + weekDate(g, then.w) + " approval has gone from " + pct(then.approval, 0) + " to " + pct(now.approval, 0) + ", unemployment from " + pct(then.u) + " to " + pct(now.u) + " and inflation from " + pct(then.infl) + " to " + pct(now.infl) + ".");
  if (best) paras.push("The best moment: “" + best.title + "” (" + best.date + ").");
  if (worst) paras.push("The worst: “" + worst.title + "” (" + worst.date + ").");
  var L = (g.customLaws || []).filter(function (l) { return l.active; });
  if (L.length) { var l = L[nhash(oid + g.week) % L.length]; paras.push("Take the " + l.name + ". " + (o.lean > 55 ? (lawLean(l).lean < 0 ? "It is another expensive gesture the country cannot afford." : "It is the kind of common sense we need more of.") : (lawLean(l).lean > 0 ? "It shows whose side this government is really on." : "It is a genuine step forward for ordinary people.")) + (l.lastVerdict ? " So far it " + l.lastVerdict + "." : "")); }
  var P = (g.pledges || []);
  var open = P.filter(function (p) { return p.status == "open"; }), broken = P.filter(function (p) { return p.status == "broken"; });
  if (broken.length) paras.push("And voters will not forget that " + me + " promised " + pledgeText(g, broken[broken.length - 1]) + ", and failed.");
  else if (open.length) paras.push("The big test is still to come: " + me + " has promised " + pledgeText(g, open[0]) + " by " + weekDate(g, open[0].deadline) + ".");
  if (electionsHeld(g) && g.politics.nextElection) {
    var due = g.politics.snapElection || g.politics.nextElection;
    if (due - g.week < 40) paras.push("With the election " + (due - g.week) + " weeks away, " + me + " is running out of time" + (approvalLead(g) > 0 ? ", though the polls still give the " + playerParty(g).name + " the edge." : " and the polls are against them."));
  }
  paras.push(score > 0.3 ? "Our verdict: steady progress. Keep going." : (score < -0.3 ? "Our verdict: must do better, and fast." : "Our verdict: could do better."));
  var head = (o.sensational > 0.7 ? (nick ? nick.toUpperCase() + ": " : "") + (score > 0 ? "NOT BAD!" : "TIME'S UP?") : "Our view: " + (score > 0.3 ? "the " + ttl + " deserves some credit" : (score < -0.3 ? "the " + ttl + " is losing the country" : "a government that must find its purpose")));
  var ev = addEvent(g, "editorial", 1, o.name + " editorial", { verdict: score > 0.3 ? "positive" : (score < -0.3 ? "negative" : "mixed") }, "Regular feature.", score > 0.3 ? 1 : (score < -0.3 ? -1 : 0));
  ev.covered = true;
  return { id: "AR-" + ev.id.slice(3) + "-" + oid, week: g.week, date: weekDate(g), outlet: oid, headline: head, standfirst: "The editor's verdict on the government's last three months.", body: paras.join("\n\n"),
    byline: "The Editor", event: ev.id, tone: score > 0.3 ? "positive" : (score < -0.3 ? "critical" : "neutral"), reliability: o.reliability, type: "editorial", region: null, kind: "editorial" };
}
function approvalLead(g) {
  var me = playerParty(g), op = oppositionLeader(g);
  return op ? me.poll - op.poll : 1;
}
var PRESS_RESPONSES = [
  { id: "defend", name: "Defend the record", desc: "Stand by your decisions." },
  { id: "apologise", name: "Apologise", desc: "Admit mistakes. People like honesty, but it looks weak." },
  { id: "review", name: "Announce an inquiry", desc: "Promise to look into it. Buys time." },
  { id: "attack", name: "Attack the newspaper", desc: "Call it fake news. Fires up supporters, makes enemies in the press." },
  { id: "nocomment", name: "No comment", desc: "Say nothing. The story may die down." },
  { id: "pressure", name: "Lean on the editor", desc: "Only possible without a free press. The paper goes quiet, but people notice.", needsUnfree: true }
];
function pressRespond(g, articleId, choice) {
  var a = null;
  for (var i = 0; i < g.news.length; i++) if (g.news[i].id == articleId) a = g.news[i];
  if (!a || a.answered) return null;
  var o = null; for (var i = 0; i < OUTLETS.length; i++) if (OUTLETS[i].id == a.outlet) o = OUTLETS[i];
  var me = g.leaderName, ttl = g.constitution.title, P = g.politics;
  if (!g.media) g.media = {};
  var ev = null;
  for (var i = 0; i < g.events.length; i++) if (g.events[i].id == a.event) ev = g.events[i];
  var bad = ev ? ev.valence < 0 : a.tone == "critical";
  var statement = "", effect = "";
  if (choice == "defend") {
    statement = pickNews(g, ["I make no apology for doing what is right for " + g.country.name + ".", "We have a plan and we are sticking to it. The results will come."]);
    if (bad && P.approval < 0.4) { P.mood -= 0.004; effect = "It sounded out of touch."; } else { P.mood += 0.003; effect = "Supporters liked it."; }
  }
  if (choice == "apologise") {
    statement = pickNews(g, ["I'm sorry. We got this wrong and we will put it right.", "People are right to be angry. I take full responsibility."]);
    P.mood += bad ? 0.006 : -0.002; g.media[o.id] = (g.media[o.id] || 0) + 0.15; P.legitimacy = clamp(P.legitimacy - 0.5, 0, 100);
    effect = bad ? "The public respected the honesty." : "People wondered what there was to apologise for.";
  }
  if (choice == "review") {
    statement = "I have asked for a full independent inquiry. We will act on what it finds.";
    P.mood += 0.003; effect = "It took the heat out of the story, for now.";
  }
  if (choice == "attack") {
    statement = pickNews(g, ["The " + o.name + " is peddling fake news to sell papers.", "This is a smear by a newspaper that has never accepted the result of the election.", "I won't take lectures from the " + o.name + "."]);
    g.media[o.id] = (g.media[o.id] || 0) - 0.4;
    for (var k in g.media) if (k != o.id) g.media[k] -= 0.05;
    P.mood += (Math.abs(o.lean - avgGovEcon(g)) > 20 ? 0.002 : -0.004);
    effect = "Your base cheered. The rest of the press closed ranks against you.";
  }
  if (choice == "nocomment") { statement = "No comment."; g.media[o.id] = (g.media[o.id] || 0) - 0.05; effect = "The story ran without your side of it."; }
  if (choice == "pressure") {
    if (g.constitution.press == "free") return null;
    statement = "The government has no comment on editorial matters.";
    g.media[o.id] = (g.media[o.id] || 0) + 0.6; P.legitimacy = clamp(P.legitimacy - 1.5, 0, 100); P.unrest = clamp(P.unrest + 1, 0, 100);
    effect = "The editor was replaced. Readers noticed.";
  }
  a.answered = choice;
  a.answer = statement;
  g.commandLog.push({ week: g.week, cmd: "press", article: articleId, choice: choice });
  addEvent(g, "pressResponse", 2, choice == "pressure" ? "Editor of " + o.name + " replaced after government pressure" : ttl + " " + lastName(me) + (choice == "attack" ? " hits back at the " + o.name : (choice == "apologise" ? " says sorry" : (choice == "review" ? " orders inquiry" : (choice == "nocomment" ? " stays silent" : " defends record")))),
    { statement: statement, outlet: o.name, story: a.headline }, "Response to the story \"" + a.headline + "\".", choice == "attack" || choice == "pressure" ? -1 : (choice == "apologise" && bad ? 1 : 0));
  return { statement: statement, effect: effect };
}
var PLEDGE_TYPES = [
  { id: "wait", name: "Cut hospital waiting times below", unit: "weeks", key: "wait", down: true, def: function (g) { return Math.max(2, Math.round(g.services.health.wait * 0.8)); } },
  { id: "u", name: "Get unemployment below", unit: "%", key: "u", down: true, pct: true, def: function (g) { return Math.round((1 - g.econ.employed / g.econ.labourForce) * 90 * 10) / 10; } },
  { id: "infl", name: "Get inflation below", unit: "%", key: "infl", down: true, pct: true, def: function (g) { return Math.max(1, Math.round(g.econ.infl * 100)); } },
  { id: "growth", name: "Get economic growth above", unit: "%", key: "growth", down: false, pct: true, def: function (g) { return 2; } },
  { id: "deficit", name: "Cut the deficit below", unit: "% of GDP", key: "deficitPct", down: true, def: function (g) { return Math.max(0, Math.round(-g.flows.balance / g.econ.gdp * 100) - 1); } },
  { id: "crime", name: "Cut recorded crime below", unit: "per 1000", key: "crime", down: true, def: function (g) { return Math.round(g.crime * 0.9); } },
  { id: "poverty", name: "Cut poverty below", unit: "%", key: "poverty", down: true, pct: true, def: function (g) { var h = g.history[g.history.length - 1]; return Math.round(h.poverty * 90); } },
  { id: "notax", name: "No rises in income tax or VAT", unit: "", key: null, def: function () { return 0; } },
  { id: "peace", name: "Keep the country out of war", unit: "", key: null, def: function () { return 0; } }
];
function pledgeType(id) { for (var i = 0; i < PLEDGE_TYPES.length; i++) if (PLEDGE_TYPES[i].id == id) return PLEDGE_TYPES[i]; }
function pledgeText(g, p) {
  var t = pledgeType(p.type);
  if (!t.key) return t.name.charAt(0).toLowerCase() + t.name.slice(1);
  return t.name.toLowerCase().replace("get ", "to get ").replace("cut ", "to cut ") + " " + p.target + (t.unit == "%" ? "%" : " " + t.unit);
}
function pledgeValue(g, t) {
  var h = g.history[g.history.length - 1];
  if (t.key == "deficitPct") return -h.bal / h.gdp * 100;
  var v = h[t.key];
  return t.pct ? v * 100 : v;
}
function makePledge(g, type, target, weeks) {
  var t = pledgeType(type);
  if (!t) return null;
  g.pledges = g.pledges || [];
  if (g.pledges.filter(function (p) { return p.status == "open"; }).length >= 3) return { error: "You already have 3 open promises. Keep those first." };
  var p = { id: "P-" + (g.pledges.length + 1), type: type, target: parseFloat(target) || 0, made: g.week, deadline: g.week + weeks, status: "open" };
  if (t.key) p.start = pledgeValue(g, t);
  g.pledges.push(p);
  var quote = "I promise you this: " + pledgeText(g, p).replace(/^to /, "we will ") + " by " + weekDate(g, p.deadline) + ". Hold me to it.";
  p.quote = quote;
  g.politics.mood += 0.004;
  g.commandLog.push({ week: g.week, cmd: "pledge", type: type, target: p.target, weeks: weeks });
  addEvent(g, "pledge", 2, g.constitution.title + " " + lastName(g.leaderName) + " promises " + pledgeText(g, p), { quote: quote, deadline: weekDate(g, p.deadline) }, "Speech by the " + g.constitution.title + ".", 1);
  return p;
}
function pledgesWeekly(g) {
  var P = g.pledges || [];
  for (var i = 0; i < P.length; i++) {
    var p = P[i];
    if (p.status != "open") continue;
    var t = pledgeType(p.type);
    var broken = false, kept = false;
    if (p.type == "notax") {
      for (var j = 0; j < g.bills.length; j++) {
        var b = g.bills[j];
        if (b.stage == "IMPLEMENTED" && b.log.length && b.log[b.log.length - 1].week == g.week)
          for (var k = 0; k < b.changes.length; k++) { var c = b.changes[k]; if (c.kind == "tax" && ["incomeBasic", "incomeHigher", "incomeTop", "vat"].indexOf(c.id) >= 0 && c.to > c.from) broken = true; }
      }
      if (!broken && g.week >= p.deadline) kept = true;
    } else if (p.type == "peace") {
      if (g.war) broken = true; else if (g.week >= p.deadline) kept = true;
    } else if (g.week >= p.deadline) {
      var v = pledgeValue(g, t);
      kept = t.down ? v <= p.target : v >= p.target;
      broken = !kept;
      p.end = v;
    }
    if (kept) {
      p.status = "kept";
      g.politics.mood += 0.012; g.politics.legitimacy = clamp(g.politics.legitimacy + 2, 0, 100);
      addEvent(g, "pledgeKept", 2, "Promise kept: " + lastName(g.leaderName) + " delivers on " + pledgeText(g, p).replace(/^to /, ""), { quote: p.quote, made: weekDate(g, p.made) }, "The deadline was " + weekDate(g, p.deadline) + ".", 1);
    }
    if (broken) {
      p.status = "broken";
      g.politics.mood -= 0.02; g.politics.legitimacy = clamp(g.politics.legitimacy - 3, 0, 100);
      addEvent(g, "pledgeBroken", 3, "BROKEN PROMISE: " + lastName(g.leaderName) + " fails to " + pledgeText(g, p).replace(/^to /, ""), { quote: p.quote, made: weekDate(g, p.made), result: p.end !== undefined ? (Math.round(p.end * 10) / 10) + " " + t.unit : "" }, "The deadline was " + weekDate(g, p.deadline) + ".", -1, true);
    }
  }
}
