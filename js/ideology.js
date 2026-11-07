var IDEO_DIMS = [
  { id: "econ", name: "Economy", lo: "State-run economy", hi: "Free market" },
  { id: "welfare", name: "Welfare and public services", lo: "Small state, low taxes", hi: "Big welfare state" },
  { id: "ownership", name: "Labour and ownership", lo: "Owners and private firms", hi: "Workers, unions and co-ops" },
  { id: "liberty", name: "Civil liberties", lo: "Order and control", hi: "Maximum freedom" },
  { id: "power", name: "Political structure", lo: "Strong central leadership", hi: "Direct democracy, local power" },
  { id: "green", name: "Environment", lo: "Growth first", hi: "Planet first" },
  { id: "migration", name: "Immigration and citizenship", lo: "Closed borders", hi: "Open borders" },
  { id: "world", name: "Foreign policy", lo: "Go it alone, neutral", hi: "Alliances and open trade" },
  { id: "culture", name: "Culture and identity", lo: "Tradition, one national culture", hi: "Progressive and plural" }
];
var IDEO_TEMPLATES = [
  { id: "socdem", name: "Social democracy", d: [40, 85, 65, 75, 60, 60, 55, 70, 65], about: "Markets plus a strong welfare state, unions and fair taxes." },
  { id: "demsoc", name: "Democratic socialism", d: [20, 90, 85, 70, 70, 70, 60, 60, 75], about: "Public and worker ownership, won through elections." },
  { id: "communism", name: "Communism", d: [5, 85, 95, 20, 15, 40, 30, 40, 45], about: "The state owns the economy and plans it, led by one party." },
  { id: "classlib", name: "Classical liberalism", d: [85, 25, 25, 90, 60, 35, 60, 85, 60], about: "Free markets, free trade, free speech, limited government." },
  { id: "libertarian", name: "Libertarianism", d: [97, 8, 15, 98, 75, 20, 70, 60, 70], about: "As little state as possible, in the economy and in private life." },
  { id: "conservative", name: "Conservatism", d: [70, 40, 30, 50, 45, 35, 30, 55, 20], about: "Order, tradition, low taxes and careful change." },
  { id: "christdem", name: "Christian democracy", d: [60, 65, 50, 60, 50, 45, 40, 70, 30], about: "Social market economy with family and faith values." },
  { id: "green", name: "Green politics", d: [40, 75, 60, 80, 80, 98, 70, 75, 85], about: "Ecology first, grassroots democracy, social justice." },
  { id: "natcon", name: "National conservatism", d: [60, 50, 35, 35, 30, 30, 10, 20, 10], about: "The nation first: borders, culture, self-reliance." },
  { id: "soclib", name: "Social liberalism", d: [60, 70, 45, 90, 60, 65, 70, 85, 90], about: "Personal freedom plus public help to make it real for everyone." },
  { id: "agrarian", name: "Agrarianism", d: [50, 55, 55, 55, 75, 60, 30, 35, 25], about: "Farmers, the countryside and local communities." },
  { id: "technocracy", name: "Technocracy", d: [55, 60, 40, 50, 25, 65, 55, 75, 60], about: "Rule by experts and evidence, not by slogans." },
  { id: "anarchosyn", name: "Anarcho-syndicalism", d: [10, 70, 100, 95, 100, 70, 85, 40, 85], about: "Workers run everything through unions and councils." },
  { id: "leftpop", name: "Left populism", d: [25, 80, 70, 50, 55, 45, 35, 30, 45], about: "The people against the rich and the elites." },
  { id: "rightpop", name: "Right populism", d: [65, 55, 40, 40, 35, 20, 10, 25, 15], about: "Ordinary people against the elites and outsiders." },
  { id: "monarchist", name: "Traditional monarchism", d: [55, 45, 30, 30, 10, 40, 25, 40, 5], about: "Crown, church and continuity." },
  { id: "georgism", name: "Georgism", d: [75, 50, 45, 80, 60, 70, 65, 80, 60], about: "Tax land, not work. Free trade and free people." },
  { id: "developmental", name: "Authoritarian developmentalism", d: [45, 45, 35, 10, 5, 25, 30, 45, 30], about: "A strong state drives fast growth. Freedom can wait." }
];
var IDEO_SYMBOLS = ["&#9733;", "&#9775;", "&#9752;", "&#9824;", "&#9670;", "&#9679;", "&#9650;", "&#9728;", "&#9819;", "&#10047;", "&#9881;", "&#9873;", "&#9874;", "&#10070;", "&#9763;"];
var COMMITMENTS = [
  { id: "jobs", name: "Get unemployment below {p}%", def: function (g) { return Math.max(2, Math.round((1 - g.econ.employed / g.econ.labourForce) * 100) - 1); }, dims: { welfare: 1, ownership: 1 },
    now: function (g) { return (1 - g.econ.employed / g.econ.labourForce) * 100; }, ok: function (v, c) { return v < c.p; }, fmt: function (v) { return v.toFixed(1) + "%"; } },
  { id: "growth", name: "Grow the economy by {p}% a year", def: function () { return 2; }, dims: { econ: 1 },
    now: function (g, c) { var h = g.history[g.history.length - 1]; var yrs = Math.max(0.25, (g.week - c.made) / 52); return (Math.pow(h.realGdp / c.base, 1 / yrs) - 1) * 100; }, base: function (g) { return g.history[g.history.length - 1].realGdp; },
    ok: function (v, c) { return v >= c.p; }, fmt: function (v) { return v.toFixed(1) + "% a year"; } },
  { id: "debt", name: "Bring debt below {p}% of GDP", def: function (g) { return Math.max(20, Math.round(totalDebt(g) / g.econ.gdp * 100) - 5); }, dims: { econ: 1 },
    now: function (g) { return totalDebt(g) / g.econ.gdp * 100; }, ok: function (v, c) { return v < c.p; }, fmt: function (v) { return v.toFixed(0) + "%"; } },
  { id: "balance", name: "Balance the budget", def: function () { return 0; }, dims: { econ: 1 },
    now: function (g) { return g.flows.balance / g.econ.gdp * 100; }, ok: function (v) { return v > -0.5; }, fmt: function (v) { return (v >= 0 ? "+" : "") + v.toFixed(1) + "% of GDP"; } },
  { id: "notax", name: "No rise in income tax or VAT", def: function () { return 0; }, dims: { econ: 1 },
    now: function (g) { return g.taxes.incomeBasic + g.taxes.vat; }, base: function (g) { return g.taxes.incomeBasic + g.taxes.vat; }, ok: function (v, c) { return v <= c.base + 0.01; }, fmt: function (v) { return v.toFixed(1) + " pts (basic rate + VAT)"; } },
  { id: "cuttax", name: "Cut the basic rate of income tax", def: function () { return 0; }, dims: { econ: 1, welfare: -1 },
    now: function (g) { return g.taxes.incomeBasic; }, base: function (g) { return g.taxes.incomeBasic; }, ok: function (v, c) { return v < c.base - 0.01; }, fmt: function (v) { return v.toFixed(1) + "%"; } },
  { id: "welfare", name: "Spend more on welfare and pensions", def: function () { return 0; }, dims: { welfare: 1 },
    now: function (g) { return (g.budget.lines.welfare + g.budget.lines.pensions) / g.econ.gdp * 100; }, base: function (g) { return (g.budget.lines.welfare + g.budget.lines.pensions) / g.econ.gdp * 100; },
    ok: function (v, c) { return v > c.base + 0.3; }, fmt: function (v) { return v.toFixed(1) + "% of GDP"; } },
  { id: "health", name: "Cut hospital waits below {p} weeks", def: function (g) { return Math.max(2, Math.round(g.services.health.wait) - 1); }, dims: { welfare: 1 },
    now: function (g) { return g.services.health.wait; }, ok: function (v, c) { return v < c.p; }, fmt: function (v) { return v.toFixed(1) + " weeks"; } },
  { id: "schools", name: "Get more children into good schools", def: function () { return 0; }, dims: { welfare: 1 },
    now: function (g) { return g.services.education.access * 100; }, base: function (g) { return g.services.education.access * 100; }, ok: function (v, c) { return v > c.base + 0.5; }, fmt: function (v) { return v.toFixed(1) + "% access"; } },
  { id: "crime", name: "Cut crime by {p}%", def: function () { return 10; }, dims: { liberty: -1 },
    now: function (g) { return g.crime; }, base: function (g) { return g.crime; }, ok: function (v, c) { return v <= c.base * (1 - c.p / 100); }, fmt: function (v) { return v.toFixed(0) + " per 1,000"; } },
  { id: "green", name: "Cut emissions by {p}%", def: function () { return 15; }, dims: { green: 1 },
    now: function (g) { return g.econ.emissions; }, base: function (g) { return g.econ.emissions; }, ok: function (v, c) { return v <= c.base * (1 - c.p / 100); }, fmt: function (v) { return v.toFixed(1) + " Mt"; } },
  { id: "equality", name: "Narrow the gap between rich and poor", def: function () { return 0; }, dims: { welfare: 1, ownership: 1 },
    now: function (g) { return gapRatio(g); }, base: function (g) { return gapRatio(g); }, ok: function (v, c) { return v < c.base * 0.97; }, fmt: function (v) { return "richest fifth get " + v.toFixed(1) + "x the poorest"; } },
  { id: "liberty", name: "Raise the democracy index to {p}", def: function (g) { return Math.min(100, Math.round(g.politics.di) + 5); }, dims: { liberty: 1, power: 1 },
    now: function (g) { return g.politics.di; }, ok: function (v, c) { return v >= c.p; }, fmt: function (v) { return v.toFixed(0) + "/100"; } },
  { id: "order", name: "Keep unrest under {p}", def: function () { return 15; }, dims: { liberty: -1 },
    now: function (g) { return g.politics.unrest; }, ok: function (v, c) { return v < c.p; }, fmt: function (v) { return v.toFixed(0) + "/100"; } },
  { id: "corruption", name: "Cut corruption below {p}", def: function (g) { return Math.max(5, Math.round(g.politics.corruption) - 8); }, dims: { liberty: 1 },
    now: function (g) { return g.politics.corruption; }, ok: function (v, c) { return v < c.p; }, fmt: function (v) { return v.toFixed(0) + "/100"; } },
  { id: "lessmig", name: "Cut immigration", def: function () { return 0; }, dims: { migration: -1 },
    now: function (g) { return pv(g, "immigration"); }, base: function (g) { return pv(g, "immigration"); }, ok: function (v, c) { return v < c.base; }, fmt: function (v) { return v.toFixed(0) + "k visas a year"; } },
  { id: "moremig", name: "Welcome more skilled immigrants", def: function () { return 0; }, dims: { migration: 1 },
    now: function (g) { return pv(g, "immigration"); }, base: function (g) { return pv(g, "immigration"); }, ok: function (v, c) { return v > c.base; }, fmt: function (v) { return v.toFixed(0) + "k visas a year"; } },
  { id: "public", name: "Bring an industry into public ownership", def: function () { return 0; }, dims: { ownership: 1, econ: -1 },
    now: function (g) { return publicOwnershipScore(g); }, base: function (g) { return publicOwnershipScore(g); }, ok: function (v, c) { return v > c.base; }, fmt: function (v) { return v > 0 ? "yes" : "not yet"; } },
  { id: "defence", name: "Make the armed forces ready", def: function () { return 70; }, dims: { liberty: -1 },
    now: function (g) { return g.defence.readiness; }, ok: function (v, c) { return v >= c.p; }, fmt: function (v) { return v.toFixed(0) + "/100 readiness"; } },
  { id: "alliance", name: "Join or found an international alliance", def: function () { return 0; }, dims: { world: 1 },
    now: function (g) { return allianceCount(g); }, base: function (g) { return allianceCount(g); }, ok: function (v, c) { return v > c.base; }, fmt: function (v) { return v + " alliances and treaties"; } },
  { id: "homes", name: "Build more homes", def: function () { return 0; }, dims: { welfare: 1 },
    now: function (g) { return pv(g, "housingbuild") > 0 || hasMeasureCat(g, "housing") ? 1 : 0; }, base: function () { return 0; }, ok: function (v) { return v > 0; }, fmt: function (v) { return v ? "programme running" : "no programme yet"; } }
];
function gapRatio(g) { var q = g.flows.q; return q[4].disp / Math.max(0.0001, q[0].disp); }
function publicOwnershipScore(g) {
  var s = (g.policies.nationalise && g.policies.nationalise.active ? 1 : 0) + (g.flags.energyPublic ? 1 : 0);
  var L = g.customLaws || [];
  for (var i = 0; i < L.length; i++) if (L[i].active) for (var j = 0; j < L[i].blocks.length; j++) if (L[i].blocks[j].kind == "nationalise") s++;
  return s;
}
function allianceCount(g) {
  var n = 0;
  for (var i = 0; i < g.foreign.length; i++) { var t = g.foreign[i].treaties; n += (t.indexOf("defence") >= 0 ? 1 : 0) + (t.indexOf("fta") >= 0 ? 1 : 0); }
  return n + (g.orgs ? g.orgs.length : 0);
}
function hasMeasureCat(g, cat) {
  var L = g.customLaws || [];
  for (var i = 0; i < L.length; i++) if (L[i].active) for (var j = 0; j < L[i].blocks.length; j++) {
    var b = L[i].blocks[j];
    if (b.type == "measure") { var m = lawMeasure(b.measure); if (m && m.cat == cat) return true; }
    if (b.type == "money" && b.kind == "programme" && b.area == cat) return true;
  }
  return false;
}
function commitInfo(id) { for (var i = 0; i < COMMITMENTS.length; i++) if (COMMITMENTS[i].id == id) return COMMITMENTS[i]; return null; }
function commitText(c) { var d = commitInfo(c.id); return d ? d.name.replace("{p}", c.p) : c.id; }
function makeCommit(g, id, p) {
  var d = commitInfo(id);
  var c = { id: id, p: p === undefined || p === "" || isNaN(parseFloat(p)) ? d.def(g) : parseFloat(p), made: g.week, status: "open" };
  c.base = d.base ? d.base(g) : null;
  return c;
}
function commitOnTrack(g, c) { var d = commitInfo(c.id); if (!d) return false; return d.ok(d.now(g, c), c); }

function blendDims(mix) {
  var out = [], tot = 0;
  for (var k = 0; k < 9; k++) out.push(0);
  for (var i = 0; i < mix.length; i++) {
    var t = ideoTemplate(mix[i].t), w = parseFloat(mix[i].w) || 0;
    if (!t || w <= 0) continue;
    for (var k = 0; k < 9; k++) out[k] += t.d[k] * w;
    tot += w;
  }
  if (!tot) return [50, 50, 50, 50, 50, 50, 50, 50, 50];
  return out.map(function (x) { return Math.round(x / tot); });
}
function ideoTemplate(id) { for (var i = 0; i < IDEO_TEMPLATES.length; i++) if (IDEO_TEMPLATES[i].id == id) return IDEO_TEMPLATES[i]; return null; }
function dimsObj(arr) { var o = {}; for (var i = 0; i < IDEO_DIMS.length; i++) o[IDEO_DIMS[i].id] = arr[i]; return o; }
function partyPosFromDims(d) {
  var o = d.length ? dimsObj(d) : d;
  return { econ: clamp(Math.round(0.5 * o.econ + 0.25 * (100 - o.welfare) + 0.25 * (100 - o.ownership)), 0, 100),
    social: clamp(Math.round((o.liberty + o.culture + o.migration) / 3), 0, 100) };
}
function nearestTemplate(econ, social) {
  var best = null, bd = 1e9;
  for (var i = 0; i < IDEO_TEMPLATES.length; i++) {
    var p = partyPosFromDims(IDEO_TEMPLATES[i].d), dd = Math.abs(p.econ - econ) + Math.abs(p.social - social);
    if (dd < bd) { bd = dd; best = IDEO_TEMPLATES[i]; }
  }
  return best;
}
function measureDims(g) {
  var e = g.econ, f = g.flows, c = g.constitution, L = g.budget.lines, Y = e.gdp;
  var revShare = f.revTotal / Y;
  var d = {};
  d.econ = 55 - (revShare - 0.38) * 200 + (c.economy == "planned" ? -35 : (c.economy == "market" ? 10 : 0)) - publicOwnershipScore(g) * 8 + (g.policies.privatise && g.policies.privatise.active ? 10 : 0);
  d.welfare = 10 + (L.welfare + L.pensions + L.health + L.education + L.housing) / Y * 280 + (pv(g, "ubi") / Y) * 300;
  d.ownership = 40 + (g.policies.minwage.active ? (g.policies.minwage.value - 45) * 0.8 : 0) + (g.lawFx ? g.lawFx.bottom * 200 : 0) + publicOwnershipScore(g) * 8 + (c.economy == "planned" ? 30 : 0) - (g.policies.privatise && g.policies.privatise.active ? 12 : 0);
  if (g.stake && g.stake.unions && g.stake.unions.deal) d.ownership += 6;
  d.liberty = g.politics.di - pv(g, "surveillance") * 0.3;
  d.power = g.politics.di * 0.55 + ({ federal: 25, devolved: 15, unitary: 5 }[c.territory] || 5) + (c.referendum ? 12 : 0) + (c.executive == "junta" || c.executive == "monarch" ? -15 : 0);
  d.green = 25 + g.taxes.carbon * 0.25 + (g.policies.emissions.active ? g.policies.emissions.value * 0.3 : 0) + (1 - e.emissionsIntensity / 0.15) * 80 + pv(g, "greenenergy") / Y * 1500;
  var quotaPerM = (g.policies.immigration.active ? g.policies.immigration.value : 0) / Math.max(0.1, totalPop(g));
  d.migration = 25 + quotaPerM * 7 + (g.lawFx ? g.lawFx.migr / Math.max(0.1, totalPop(g)) * 2000 : 0);
  d.world = 20 + allianceCount(g) * 6 - (g.taxes.tariff - 3) * 2 - g.foreign.filter(function (x) { return x.sanctioned; }).length * 5 + (g.war ? -10 : 0);
  var socLean = 0, Lw = g.customLaws || [];
  for (var i = 0; i < Lw.length; i++) if (Lw[i].active) for (var j = 0; j < Lw[i].blocks.length; j++) {
    var b = Lw[i].blocks[j]; if (b.type != "measure") continue;
    var m = lawMeasure(b.measure); if (m && m.soc) socLean += m.soc * (parseFloat(b.strength) || 0) / 100;
  }
  d.culture = 50 + ({ state: -25, tolerant: 0, secular: 10 }[c.religion] || 0) + (g.politics.di - 70) * 0.25 + socLean * 6;
  for (var k in d) d[k] = clamp(Math.round(d[k]), 0, 100);
  return d;
}
function ideoProgress(g) {
  var mv = g.movement, I = dimsObj(mv.ideology.dims), S0 = mv.statusQuo, N = measureDims(g), out = [];
  for (var i = 0; i < IDEO_DIMS.length; i++) {
    var k = IDEO_DIMS[i].id, want = I[k] - S0[k], moved = N[k] - S0[k], p;
    if (Math.abs(want) < 8) p = clamp(1 - Math.abs(N[k] - I[k]) / 20, -1, 1);
    else p = clamp(moved / want, -1, 1);
    out.push({ id: k, name: IDEO_DIMS[i].name, ideal: I[k], start: S0[k], now: N[k], progress: p, weight: Math.abs(I[k] - 50) + 10 });
  }
  return out;
}
function deliveryScore(g) {
  var P = ideoProgress(g), s = 0, w = 0;
  for (var i = 0; i < P.length; i++) { s += P[i].progress * P[i].weight; w += P[i].weight; }
  var yrs = Math.max(0.5, (g.week - g.movement.ideology.since) / 52);
  var expect = Math.min(0.6, 0.15 * yrs);
  return clamp(50 + (s / w - expect) * 80, 0, 100);
}

var FACTION_NAMES = {
  econ: ["Free-market wing", "Planners' wing"], welfare: ["Welfare caucus", "Small-state caucus"], ownership: ["Union wing", "Enterprise wing"],
  liberty: ["Liberty caucus", "Law-and-order wing"], power: ["Grassroots democrats", "Strong-leadership wing"], green: ["Green wing", "Growth wing"],
  migration: ["Open-borders group", "Border hawks"], world: ["Internationalists", "Sovereigntists"], culture: ["Progressives", "Traditionalists"]
};
function makeFactions(g, dims) {
  var I = dimsObj(dims), arr = [];
  for (var i = 0; i < IDEO_DIMS.length; i++) arr.push({ k: IDEO_DIMS[i].id, x: Math.abs(I[IDEO_DIMS[i].id] - 50) });
  arr.sort(function (a, b) { return b.x - a.x; });
  var f = [];
  f.push({ id: "purists", name: "Purists", dim: null, mood: 60, strength: 30, low: 0, leader: randomName(g), about: "Want the whole programme, now." });
  f.push({ id: "pragmatists", name: "Pragmatists", dim: null, mood: 60, strength: 40, low: 0, leader: randomName(g), about: "Want to win elections and stay popular." });
  var k = arr[0].k, nm = FACTION_NAMES[k][I[k] >= 50 ? 0 : 1];
  f.push({ id: "dim_" + k, name: nm, dim: k, mood: 60, strength: 30, low: 0, leader: randomName(g), about: "Care most about " + dimName(k).toLowerCase() + "." });
  return f;
}
function dimName(k) { for (var i = 0; i < IDEO_DIMS.length; i++) if (IDEO_DIMS[i].id == k) return IDEO_DIMS[i].name; return k; }

function ensureMovement(g) {
  if (g.movement) return g.movement;
  var me = playerParty(g);
  var t = nearestTemplate(me.econ, me.social);
  var dims = t.d.slice();
  var pos = partyPosFromDims(dims);
  for (var i = 0; i < 3; i++) { dims[0] += (me.econ - pos.econ) * 0.5; dims[3] += (me.social - pos.social) * 0.5; dims[8] += (me.social - pos.social) * 0.5; pos = partyPosFromDims(dims.map(function (x) { return clamp(Math.round(x), 0, 100); })); }
  dims = dims.map(function (x) { return clamp(Math.round(x), 0, 100); });
  g.movement = {
    ideology: { name: t.name, mix: [{ t: t.id, w: 100 }], dims: dims, about: t.about, manifesto: "", since: g.week, changes: 0 },
    commitments: [], pastCommitments: [],
    symbol: IDEO_SYMBOLS[0], colors: [me.color, "#FFFFFF"], slogan: "", paper: me.name + " Weekly",
    members: me.members || 20000, funds: g.econ.gdp * 0.00002, enthusiasm: 60, cred: 70, leadership: "members",
    factions: makeFactions(g, dims), lastChallenge: -999, cooldown: {}, log: [], deals: [], electionsSeen: g.politics.elections.length,
    founded: g.week
  };
  g.movement.statusQuo = measureDims(g);
  me.ideoTarget = partyPosFromDims(dims);
  return g.movement;
}
function setIdeology(g, ideo, free) {
  var mv = ensureMovement(g), me = playerParty(g);
  var oldPos = partyPosFromDims(mv.ideology.dims), newPos = partyPosFromDims(ideo.dims);
  var jump = Math.abs(oldPos.econ - newPos.econ) + Math.abs(oldPos.social - newPos.social);
  var cost = free ? 0 : Math.min(30, Math.round(jump * 0.5));
  mv.ideology.name = String(ideo.name || "My ideology").slice(0, 60);
  mv.ideology.about = String(ideo.about || "").slice(0, 300);
  mv.ideology.manifesto = String(ideo.manifesto || "").slice(0, 3000);
  mv.ideology.mix = ideo.mix || mv.ideology.mix;
  var changedDims = JSON.stringify(mv.ideology.dims) != JSON.stringify(ideo.dims);
  mv.ideology.dims = ideo.dims.map(function (x) { return clamp(Math.round(parseFloat(x) || 0), 0, 100); });
  if (changedDims && !free) { mv.ideology.changes++; mv.cred = clamp(mv.cred - cost, 0, 100); mv.ideology.since = g.week; for (var i = 0; i < mv.factions.length; i++) if (mv.factions[i].id == "purists") mv.factions[i].mood -= cost * 0.6; }
  if (changedDims) { var keep = mv.factions.slice(0, 2); mv.factions = keep.concat(makeFactions(g, mv.ideology.dims).slice(2)); }
  me.ideoTarget = newPos;
  if (changedDims && !free) addEvent(g, "ideology", 2, me.name + " changes its ideology to " + mv.ideology.name, { party: me.name, ideology: mv.ideology.name, credibility: Math.round(mv.cred) + "/100" },
    cost > 10 ? "Critics call it a U-turn. Supporters call it growing up." : "A small shift in the party's thinking.", cost > 10 ? -1 : 0);
  return cost;
}
function ideologyChangeCost(g, dims) {
  var mv = ensureMovement(g);
  if (freeIdeologyChange(g)) return 0;
  var a = partyPosFromDims(mv.ideology.dims), b = partyPosFromDims(dims);
  return Math.min(30, Math.round((Math.abs(a.econ - b.econ) + Math.abs(a.social - b.social)) * 0.5));
}
function freeIdeologyChange(g) { var mv = ensureMovement(g); return g.week <= mv.founded + 4 && mv.ideology.changes == 0; }

var STAKEHOLDERS = [
  { id: "unions", name: "Trade unions", who: "the Trades Union Congress" },
  { id: "business", name: "Business", who: "the Federation of Employers" },
  { id: "farmers", name: "Farmers", who: "the Farmers' Union" },
  { id: "faith", name: "Faith groups", who: "the Council of Churches" },
  { id: "greens", name: "Environmental groups", who: "Friends of the Land" },
  { id: "students", name: "Students", who: "the National Union of Students" },
  { id: "pensioners", name: "Pensioners", who: "the Pensioners' Association" }
];
var DEALS = [
  { id: "wagepact", group: "unions", name: "Wage and jobs pact", gives: "Unions agree to moderate pay claims and no strikes.", costs: "A training fund (0.1% of GDP a year). You must not cut the minimum wage.", cost: 0.001, rel: 25, fx: { infl: -0.004 }, breach: "minwage" },
  { id: "recognition", group: "unions", name: "Union recognition agreement", gives: "Unions get a seat at the table in big firms. Workers do a bit better.", costs: "Business is annoyed (-10). Productivity dips slightly.", cost: 0, rel: 30, fx: { bottom: 0.01, prod: -0.0003 }, other: { business: -10 } },
  { id: "investpact", group: "business", name: "Investment compact", gives: "Firms invest more (+3% investment).", costs: "You promise not to raise corporation tax for the length of the deal.", cost: 0, rel: 25, fx: { inv: 0.03 }, breach: "corp" },
  { id: "skills", group: "business", name: "Skills partnership", gives: "Apprenticeships with employers. Productivity grows faster.", costs: "0.05% of GDP a year.", cost: 0.0005, rel: 15, fx: { prod: 0.0006 }, other: { students: 5 } },
  { id: "farmsupport", group: "farmers", name: "Farm support deal", gives: "Steady prices and support payments for farms.", costs: "0.1% of GDP a year. Environmental groups grumble (-8).", cost: 0.001, rel: 30, fx: { sec: { agri: 0.05 } }, other: { greens: -8 }, subsidy: true },
  { id: "faithdeal", group: "faith", name: "Faith charities agreement", gives: "Churches run more food banks and shelters with state help.", costs: "0.03% of GDP a year.", cost: 0.0003, rel: 30, fx: { legit: 2, crime: -0.01 } },
  { id: "greendeal", group: "greens", name: "Green transition compact", gives: "Joint plan to cut emissions (-8% intensity).", costs: "0.15% of GDP a year. Business is a little wary (-5).", cost: 0.0015, rel: 30, fx: { emis: -0.08 }, other: { business: -5 } },
  { id: "studentdeal", group: "students", name: "Student support package", gives: "Grants and cheaper rooms for students. Better education.", costs: "0.08% of GDP a year.", cost: 0.0008, rel: 30, fx: { edu: -0.02 }, target: "students" },
  { id: "pensionlock", group: "pensioners", name: "Pension guarantee", gives: "Pensions rise at least as fast as prices and wages.", costs: "0.2% of GDP a year.", cost: 0.002, rel: 35, fx: {}, target: "pensioners" }
];
function dealInfo(id) { for (var i = 0; i < DEALS.length; i++) if (DEALS[i].id == id) return DEALS[i]; return null; }
function ensureStake(g) {
  if (g.stake) return g.stake;
  g.stake = {};
  for (var i = 0; i < STAKEHOLDERS.length; i++) g.stake[STAKEHOLDERS[i].id] = { rel: 50, deal: null, dealWeek: 0, dealUntil: 0, low: 0, trouble: 0 };
  g.stake.regions = g.regions.map(function () { return { rel: 50, deal: null, dealWeek: 0, dealUntil: 0, low: 0, trouble: 0 }; });
  g.stake.base = { corp: g.taxes.corp, minwage: g.policies.minwage.active ? g.policies.minwage.value : 0, tariff: g.taxes.tariff, eduAccess: g.services.education.access, pension: g.budget.lines.pensions / g.econ.price, u: 1 - g.econ.employed / g.econ.labourForce };
  return g.stake;
}
function stakeTarget(g, id) {
  var S = g.stake, B = S.base, e = g.econ, d = measureDims(g), u = 1 - e.employed / e.labourForce, job = g.leader ? g.leader.job : "";
  var t = 50;
  if (id == "unions") t += (g.policies.minwage.active ? g.policies.minwage.value - B.minwage : -10) * 1.2 + (g.lawFx ? g.lawFx.bottom * 300 : 0) - (u - B.u) * 400 + (d.ownership - 50) * 0.35 + (job == "union" ? 10 : 0);
  if (id == "business") t += -(g.taxes.corp - B.corp) * 2 - (g.taxes.payroll - g.taxes0.payroll) * 2 + (realGrowth(g) - 0.015) * 600 - publicOwnershipScore(g) * 10 + (d.econ - 50) * 0.35 + (job == "business" ? 10 : 0) + (job == "economist" ? 5 : 0);
  if (id == "farmers") { var ai = sectorIndex("agri"); t += (g.lawFx && ai >= 0 ? g.lawFx.sec[ai] * 150 : 0) + (g.taxes.tariff - B.tariff) * 1.5 + (job == "farmer" ? 10 : 0); }
  if (id == "faith") t += ({ state: 20, tolerant: 0, secular: -15 }[g.constitution.religion] || 0) - (d.culture - 50) * 0.4 + (job == "faith" ? 10 : 0);
  if (id == "greens") t += (d.green - 50) * 0.7;
  if (id == "students") t += (g.services.education.access - B.eduAccess) * 400 + (d.liberty - 60) * 0.25 + (job == "teacher" ? 5 : 0);
  if (id == "pensioners") t += ((g.budget.lines.pensions / e.price) / B.pension - 1) * 150;
  for (var i = 0; i < DEALS.length; i++) {
    var D = DEALS[i];
    if (D.group == id && S[id].deal == D.id) t += D.rel;
    for (var k in S) if (k != "base" && k != "regions" && S[k].deal == D.id && D.other && D.other[id]) t += D.other[id];
  }
  return clamp(t, 0, 100);
}
function regionStakeTarget(g, r) {
  var a = 0, w = 0;
  for (var i = 0; i < g.cohorts.length; i++) { var c = g.cohorts[i]; if (c.region != r || c.age == 0) continue; var cw = cohortPop(g, c); a += c.approval * cw; w += cw; }
  var t = 50 + ((w ? a / w : 0.45) - 0.45) * 120 + (g.stake.regions[r].deal ? 25 : 0) + ({ federal: 10, devolved: 5, unitary: 0 }[g.constitution.territory] || 0);
  return clamp(t, 0, 100);
}
function makeDeal(g, id, regionIdx) {
  ensureStake(g);
  if (id == "regiondeal") {
    var R = g.stake.regions[regionIdx];
    if (!R || R.deal) return "That region already has a deal.";
    R.deal = "regiondeal"; R.dealWeek = g.week; R.dealUntil = g.week + 208; R.rel = Math.min(100, R.rel + 10);
    addEvent(g, "deal", 2, "Regional growth deal signed for " + g.regions[regionIdx].name, { region: g.regions[regionIdx].name, cost: "0.1% of GDP a year for 4 years" }, "The government wants to close the gap with richer regions.", 1, false, null, regionIdx);
    g.commandLog.push({ week: g.week, cmd: "deal", deal: id, region: regionIdx });
    return "";
  }
  var D = dealInfo(id); if (!D) return "Unknown deal.";
  var S = g.stake[D.group];
  if (S.deal) return "You already have a deal with them. Cancel it first.";
  if (S.rel < 25) return "They won't talk to you right now (relations below 25). Win them round first.";
  S.deal = id; S.dealWeek = g.week; S.dealUntil = g.week + 208; S.rel = Math.min(100, S.rel + 10);
  if (D.breach == "corp") S.lock = g.taxes.corp;
  if (D.breach == "minwage") S.lock = g.policies.minwage.active ? g.policies.minwage.value : 0;
  addEvent(g, "deal", 2, "Government signs " + D.name.toLowerCase() + " with " + stakeName(D.group), { deal: D.name, partner: stakeName(D.group), what: D.gives },
    "Talks between ministers and " + stakeWho(D.group) + " ended in agreement.", 1);
  g.commandLog.push({ week: g.week, cmd: "deal", deal: id });
  return "";
}
function cancelDeal(g, group, regionIdx) {
  ensureStake(g);
  var S = group == "regions" ? g.stake.regions[regionIdx] : g.stake[group];
  if (!S || !S.deal) return;
  var name = S.deal == "regiondeal" ? "regional growth deal" : dealInfo(S.deal).name;
  S.deal = null; S.rel = Math.max(0, S.rel - 30);
  addEvent(g, "dealBroken", 2, "Government tears up " + name.toLowerCase(), { deal: name, partner: group == "regions" ? g.regions[regionIdx].name : stakeName(group) }, "The government pulled out of the agreement.", -1, false, null, group == "regions" ? regionIdx : null);
  g.politics.mood -= 0.01;
}
function stakeName(id) { for (var i = 0; i < STAKEHOLDERS.length; i++) if (STAKEHOLDERS[i].id == id) return STAKEHOLDERS[i].name.toLowerCase(); return id; }
function stakeWho(id) { for (var i = 0; i < STAKEHOLDERS.length; i++) if (STAKEHOLDERS[i].id == id) return STAKEHOLDERS[i].who; return id; }
function stakeWeekly(g) {
  var S = ensureStake(g);
  if (S.regions.length != g.regions.length) while (S.regions.length < g.regions.length) S.regions.push({ rel: 50, deal: null, dealWeek: 0, dealUntil: 0, low: 0, trouble: 0 });
  for (var i = 0; i < STAKEHOLDERS.length; i++) {
    var id = STAKEHOLDERS[i].id, s = S[id];
    s.rel += (stakeTarget(g, id) - s.rel) * 0.04;
    if (s.deal) {
      var D = dealInfo(s.deal);
      var broke = false;
      if (D.breach == "corp" && g.taxes.corp > s.lock + 0.01) broke = true;
      if (D.breach == "minwage" && (g.policies.minwage.active ? g.policies.minwage.value : 0) < s.lock - 0.01) broke = true;
      if (broke) {
        s.deal = null; s.rel = Math.max(0, s.rel - 40); g.politics.mood -= 0.02;
        addEvent(g, "dealBroken", 3, stakeWho(id).charAt(0).toUpperCase() + stakeWho(id).slice(1) + " say the government broke the " + D.name.toLowerCase(), { deal: D.name, partner: stakeName(id) }, "The government did something the deal ruled out.", -1, true);
      } else if (g.week >= s.dealUntil) {
        s.deal = null;
        addEvent(g, "deal", 1, "The " + D.name.toLowerCase() + " with " + stakeName(id) + " runs out", { deal: D.name }, "Deals last four years. You can sign a new one.", 0);
      }
    }
    if (s.rel < 20) s.low++; else s.low = 0;
    if (s.trouble > 0) s.trouble--;
    if (s.low >= 8 && s.trouble == 0 && (g.week - 1) % 4 == 0 && chance(g, 0.35)) {
      s.trouble = id == "business" ? 13 : 4;
      var what = { unions: ["strike", "General strike called by " + stakeWho(id), "Factories, ports and trains stop. Output falls while it lasts."],
        business: ["investment", "Business leaders put investment on hold", "Firms say they won't invest until policy changes."],
        farmers: ["blockade", "Farmers blockade roads with tractors", "Food prices jump while the blockade lasts."],
        faith: ["sermons", "Church leaders denounce the government from the pulpit", "Religious voters are told the government has lost its way."],
        greens: ["protest", "Climate protesters block the capital", "Thousands demand faster action on emissions."],
        students: ["protest", "Students occupy universities", "Lectures cancelled across the country."],
        pensioners: ["march", "Pensioners march on parliament", "The grey vote is angry."] }[id];
      addEvent(g, what[0] == "strike" ? "strike" : "protest", 3, what[1], { group: stakeName(id), relations: Math.round(s.rel) + "/100" }, what[2] + " Relations have been very bad for months.", -1, true);
      g.politics.mood -= 0.015;
      if (id == "faith") g.politics.legitimacy -= 2;
      if (id == "greens" || id == "students") g.politics.unrest += 4;
    }
  }
  for (var r = 0; r < S.regions.length; r++) {
    var R = S.regions[r];
    R.rel += (regionStakeTarget(g, r) - R.rel) * 0.04;
    if (R.deal && g.week >= R.dealUntil) { R.deal = null; addEvent(g, "deal", 1, "Regional growth deal for " + g.regions[r].name + " ends", {}, "Deals last four years.", 0, false, null, r); }
    if (R.deal) g.regions[r].income = Math.min(3, g.regions[r].income + 0.03 / 52);
    if (R.rel < 20) R.low++; else R.low = 0;
    if (R.trouble > 0) R.trouble--;
    if (R.low >= 13 && R.trouble == 0 && (g.week - 1) % 4 == 0 && chance(g, 0.25)) {
      R.trouble = 26;
      addEvent(g, "protest", 3, "Leaders in " + g.regions[r].name + " demand more power for the region", { region: g.regions[r].name, relations: Math.round(R.rel) + "/100" }, "They say the capital has forgotten them.", -1, true, null, r);
      g.politics.unrest += 3; g.politics.legitimacy -= 1;
    }
  }
}

var AGENCY_TYPES = [
  { id: "anticorrupt", name: "Anti-corruption commission", typical: 0.0005, fx: { corrupt: -10, legit: 2 }, indep: { corrupt: 1.5, legit: 1.5 }, about: "Investigates bribery and abuse of office." },
  { id: "stats", name: "National statistics office", typical: 0.0003, fx: { prod: 0.0003, corrupt: -2, di: 1 }, indep: { di: 2 }, about: "Honest numbers. Better decisions everywhere." },
  { id: "competition", name: "Competition authority", typical: 0.0003, fx: { infl: -0.002, prod: 0.0006 }, indep: {}, about: "Stops monopolies and price fixing.", other: { business: -5 } },
  { id: "epa", name: "Environmental protection agency", typical: 0.0008, fx: { emis: -0.08, prod: -0.0002 }, indep: { emis: 1.3 }, about: "Sets and enforces pollution limits.", other: { greens: 10, business: -3 } },
  { id: "innovation", name: "Innovation agency", typical: 0.001, fx: { prod: 0.0012, inv: 0.01 }, indep: {}, about: "Funds research and new firms." },
  { id: "publichealth", name: "Public health institute", typical: 0.0006, fx: { health: -0.04 }, indep: {}, about: "Prevention: vaccines, smoking, obesity." },
  { id: "border", name: "Border and customs agency", typical: 0.0008, fx: { crime: -0.03, migr: -0.5 }, indep: {}, about: "Controls who and what comes in." },
  { id: "intel", name: "Intelligence service", typical: 0.0008, fx: { crime: -0.03, loyalty: 2, unrest: -2, di: -2 }, indep: { di: 0 }, about: "Watches spies, terrorists... and maybe critics." },
  { id: "ombudsman", name: "Ombudsman", typical: 0.0001, fx: { di: 2, legit: 3, corrupt: -3 }, indep: { di: 1.5, legit: 1.5 }, about: "Citizens can complain about the state, and win." },
  { id: "infrabank", name: "National infrastructure bank", typical: 0.0015, fx: { prod: 0.0006, inv: 0.02 }, indep: {}, about: "Lends for roads, rail, grids and broadband." },
  { id: "arts", name: "Arts and heritage council", typical: 0.0002, fx: { legit: 2, unrest: -1 }, indep: {}, about: "Museums, festivals, national culture.", other: { faith: 3 } },
  { id: "consumer", name: "Consumer protection agency", typical: 0.0002, fx: { bottom: 0.005 }, indep: {}, about: "Fights scams and unfair contracts.", other: { business: -3 } },
  { id: "cyber", name: "Cyber security centre", typical: 0.0003, fx: { crime: -0.01, relDem: 1 }, indep: {}, about: "Protects government and firms from hackers." }
];
function agencyType(id) { for (var i = 0; i < AGENCY_TYPES.length; i++) if (AGENCY_TYPES[i].id == id) return AGENCY_TYPES[i]; return AGENCY_TYPES[0]; }
function createAgency(g, type, name, budgetPct, independent) {
  if (!g.agencies) g.agencies = [];
  if (g.agencies.length >= 8) return "You can run at most 8 agencies.";
  var T = agencyType(type);
  var b = clamp(parseFloat(budgetPct) || T.typical * 100, 0.005, 0.5);
  var a = { id: "AG-" + (g.agencies.length + 1) + "-" + g.week, type: type, name: String(name || T.name).slice(0, 60), budget: b, independent: !!independent, since: g.week, head: randomName(g) };
  g.agencies.push(a);
  addEvent(g, "agency", 2, "New " + a.name + " set up", { agency: a.name, budget: b + "% of GDP a year", independent: independent ? "yes" : "no, it reports to a minister", head: a.head }, T.about, 1);
  g.commandLog.push({ week: g.week, cmd: "agency", type: type });
  return "";
}
function closeAgency(g, id) {
  for (var i = 0; i < (g.agencies || []).length; i++) if (g.agencies[i].id == id) {
    var a = g.agencies.splice(i, 1)[0];
    addEvent(g, "agency", 2, a.name + " abolished", { agency: a.name }, "The government closed it down.", a.independent && agencyType(a.type).fx.corrupt ? -1 : 0);
    if (a.independent && (a.type == "anticorrupt" || a.type == "ombudsman")) { g.politics.legitimacy -= 3; g.politics.mood -= 0.01; }
    return;
  }
}
var PRIORITIES = [
  { id: "growth", name: "Economic growth", fx: { prod: 0.0004 } }, { id: "jobs", name: "Jobs", fx: { inv: 0.005, bottom: 0.0015 } },
  { id: "health", name: "Health", fx: { health: -0.012 } }, { id: "education", name: "Education", fx: { edu: -0.012 } },
  { id: "security", name: "Law and order", fx: { crime: -0.02 } }, { id: "environment", name: "Environment", fx: { emis: -0.02 } },
  { id: "equality", name: "Fairness and equality", fx: { bottom: 0.004 } }, { id: "defence", name: "Defence", fx: { loyalty: 1 } },
  { id: "debt", name: "Paying down debt", fx: {}, rev: 0.0005 }, { id: "liberty", name: "Freedom and rights", fx: { di: 1 } },
  { id: "identity", name: "National unity", fx: { legit: 1.5, unrest: -1 } }, { id: "trade", name: "Trade and exports", fx: { exp: 0.01 } }
];
function priorityInfo(id) { for (var i = 0; i < PRIORITIES.length; i++) if (PRIORITIES[i].id == id) return PRIORITIES[i]; return null; }

function extraFx(g, fx) {
  var Y = g.econ.gdp;
  function add(src, k) { for (var key in src) { if (key == "sec") { for (var s in src.sec) { var si = sectorIndex(s); if (si >= 0) fx.sec[si] += src.sec[s] * k; } } else if (fx[key] !== undefined && typeof fx[key] == "number") fx[key] += src[key] * k; } }
  function spend(label, amt) { fx.gov += amt; fx.spendLines[label] = (fx.spendLines[label] || 0) + amt; }
  var A = g.agencies || [];
  for (var i = 0; i < A.length; i++) {
    var a = A[i], T = agencyType(a.type), amt = a.budget / 100 * Y;
    spend("Agency: " + a.name, amt);
    var mat = clamp((g.week - a.since) / 52, 0, 1), sc = Math.min(1.5, (a.budget / 100) / T.typical) * mat;
    for (var key in T.fx) {
      var m = 1;
      if (T.indep[key] !== undefined) m = a.independent ? T.indep[key] : (key == "di" || key == "legit" ? 0 : 0.5);
      if (a.type == "intel" && key == "di") m = a.independent ? 0 : 1;
      if (fx[key] !== undefined) fx[key] += T.fx[key] * sc * m;
    }
  }
  var S = g.stake;
  if (S) {
    for (var i = 0; i < STAKEHOLDERS.length; i++) {
      var s = S[STAKEHOLDERS[i].id]; if (!s) continue;
      if (s.deal) {
        var D = dealInfo(s.deal), amt = D.cost * Y;
        if (amt > 0) {
          if (D.target) { var T2 = lawTarget(D.target); for (var q = 0; q < 5; q++) fx.transferQ[q] += amt * T2.q[q]; fx.spendLines["Deal: " + D.name] = (fx.spendLines["Deal: " + D.name] || 0) + amt; }
          else if (D.subsidy) { fx.subsidy += amt; fx.spendLines["Deal: " + D.name] = (fx.spendLines["Deal: " + D.name] || 0) + amt; }
          else spend("Deal: " + D.name, amt);
        }
        add(D.fx, 1);
      }
      if (s.trouble > 0) {
        var id = STAKEHOLDERS[i].id;
        if (id == "unions") { for (var k = 0; k < fx.sec.length; k++) fx.sec[k] -= 0.03; }
        if (id == "business") fx.inv -= 0.05;
        if (id == "farmers") fx.infl += 0.004;
      }
    }
    for (var r = 0; r < S.regions.length; r++) if (S.regions[r].deal) spend("Deal: growth for " + (g.regions[r] ? g.regions[r].name : "region"), 0.001 * Y);
  }
  var P = g.priorities || [];
  for (var i = 0; i < P.length; i++) {
    var pi = priorityInfo(P[i]); if (!pi) continue;
    add(pi.fx, 1);
    if (pi.rev) { fx.rev += pi.rev * Y; fx.revLines["Priority: Tax collection drive"] = (fx.revLines["Priority: Tax collection drive"] || 0) + pi.rev * Y; }
  }
  var H = g.country && g.country.holidays ? g.country.holidays : [];
  fx.prod -= 0.00004 * H.length;
  var O = g.orgs || [];
  for (var i = 0; i < O.length; i++) {
    var T3 = orgType(O[i].type), fee = T3.fee * Y * (O[i].members.length ? 1 : 0.3);
    spend("Membership: " + O[i].name, fee);
    add(T3.fx, Math.min(1, O[i].members.length / 3));
  }
  worldFx(g, fx, add, spend);
  var job = g.leader ? g.leader.job : "";
  if (job == "soldier") fx.loyalty += 3;
  if (job == "lawyer") fx.legit += 2;
  if (job == "economist") fx.prod += 0.0002;
  if (job == "doctor") fx.health -= 0.01;
}

var WORLD_TREATIES = [
  { id: "trade", name: "Trade agreement", fx: { exp: 0.012 }, sized: true, about: "Lower tariffs both ways. More exports, more with a bigger partner." },
  { id: "research", name: "Research partnership", fx: { prod: 0.00025 }, about: "Shared labs and student swaps. Productivity grows a little faster." },
  { id: "defence", name: "Defence pact", fx: { loyalty: 1.5 }, about: "An attack on one is an attack on both. The army feels safer." },
  { id: "culture", name: "Cultural exchange", fx: { legit: 1 }, about: "Festivals, twin cities and exchanges. A little more legitimacy at home." },
  { id: "climate", name: "Climate pact", fx: { emis: -0.02 }, about: "Shared emission targets and green tech. Emissions fall a little." },
  { id: "peace", name: "Friendship and peace treaty", fx: { unrest: -1, relAll: 1 }, about: "A public promise of peace. Calms nerves at home and abroad." }
];
function worldTreaty(id) { for (var i = 0; i < WORLD_TREATIES.length; i++) if (WORLD_TREATIES[i].id == id) return WORLD_TREATIES[i]; return WORLD_TREATIES[0]; }
function worldFx(g, fx, add, spend) {
  var W = g.online; if (!W) return;
  var L = W.links || [], P = totalPop(g) || 1, used = 0;
  for (var i = 0; i < L.length && used < 12; i++) {
    var T = worldTreaty(L[i].kind), k = 1;
    if (T.sized) k = clamp(Math.sqrt((L[i].pop || P) / P), 0.4, 1.5);
    add(T.fx, k); used++;
  }
  var O = W.orgs || [];
  for (var i = 0; i < O.length && i < 6; i++) {
    var T2 = orgType(O[i].kind);
    spend("Membership: " + O[i].name + " (world)", T2.fee * 0.5 * g.econ.gdp);
    add(T2.fx, 0.7 * Math.min(1, (O[i].members || 1) / 4));
  }
}
var ORG_TYPES = [
  { id: "trade", name: "Trade bloc", fee: 0.0002, fx: { exp: 0.02 }, interest: "trade", about: "Lower tariffs between members. More exports." },
  { id: "defence", name: "Defence alliance", fee: 0.0004, fx: { loyalty: 1 }, interest: "security", about: "An attack on one is an attack on all." },
  { id: "climate", name: "Climate pact", fee: 0.0002, fx: { emis: -0.03, relDem: 1 }, interest: "environment", about: "Shared emission targets and green tech." },
  { id: "culture", name: "Cultural union", fee: 0.0001, fx: { legit: 1 }, interest: "culture", about: "Exchanges, festivals, shared heritage." },
  { id: "bank", name: "Development bank", fee: 0.001, fx: { exp: 0.01, relAll: 1 }, interest: "aid", about: "Loans for poorer members. Builds goodwill." }
];
function orgType(id) { for (var i = 0; i < ORG_TYPES.length; i++) if (ORG_TYPES[i].id == id) return ORG_TYPES[i]; return ORG_TYPES[0]; }
function foundOrg(g, name, type, charter) {
  if (!g.orgs) g.orgs = [];
  if (g.orgs.length >= 4) return "You can lead at most 4 organisations.";
  var o = { id: "ORG-" + (g.orgs.length + 1) + "-" + g.week, name: String(name || orgType(type).name).slice(0, 60), type: type, charter: String(charter || "").slice(0, 1000), members: [], founded: g.week, hq: g.country.capital };
  g.orgs.push(o);
  addEvent(g, "org", 2, g.country.name + " founds the " + o.name, { organisation: o.name, kind: orgType(type).name, headquarters: o.hq }, orgType(type).about, 1);
  g.commandLog.push({ week: g.week, cmd: "org", type: type });
  return "";
}
function inviteToOrg(g, orgId, cid) {
  var o = findOrg(g, orgId), f = countryOf(g, cid);
  if (!o || !f) return "Not found.";
  if (o.members.indexOf(cid) >= 0) return f.name + " is already a member.";
  if (f.atWar) return "You are at war with them.";
  var T = orgType(o.type);
  var score = f.relation + (f.interest == T.interest ? 15 : 0) + (o.type == "defence" && !f.democratic ? -10 : 0) + o.members.length * 3 + (rand(g) - 0.5) * 20;
  if (score >= 60) {
    o.members.push(cid); f.relation = Math.min(100, f.relation + 4);
    if (o.type == "trade") g.econ.tradeFactor += f.trade * 0.25;
    addEvent(g, "org", 2, f.name + " joins the " + o.name, { country: f.name, organisation: o.name, members: o.members.length + 1 }, "Talks went well.", 1);
    return "";
  }
  f.relation = Math.max(0, f.relation - 2);
  addEvent(g, "org", 1, f.name + " turns down the " + o.name, { country: f.name, organisation: o.name }, "They aren't convinced yet. Better relations would help.", -1);
  return f.name + " said no (relations " + Math.round(f.relation) + "). Improve relations and try again.";
}
function leaveOrg(g, orgId, cid) {
  var o = findOrg(g, orgId); if (!o) return;
  var i = o.members.indexOf(cid);
  if (i >= 0) { o.members.splice(i, 1); var f = countryOf(g, cid); if (o.type == "trade") g.econ.tradeFactor -= f.trade * 0.25; f.relation = Math.max(0, f.relation - 10); addEvent(g, "org", 1, f.name + " is expelled from the " + o.name, { country: f.name }, "", -1); }
}
function dissolveOrg(g, orgId) {
  for (var i = 0; i < (g.orgs || []).length; i++) if (g.orgs[i].id == orgId) {
    var o = g.orgs[i];
    while (o.members.length) leaveOrg(g, orgId, o.members[0]);
    g.orgs.splice(i, 1);
    addEvent(g, "org", 2, "The " + o.name + " is wound up", { organisation: o.name }, "", -1);
    return;
  }
}
function findOrg(g, id) { for (var i = 0; i < (g.orgs || []).length; i++) if (g.orgs[i].id == id) return g.orgs[i]; return null; }
function orgAlly(g, cid) { var O = g.orgs || []; for (var i = 0; i < O.length; i++) if (O[i].type == "defence" && O[i].members.indexOf(cid) >= 0) return true; return false; }
var MESSAGE_TONES = [
  { id: "friendly", name: "Friendly greetings", rel: 2, risk: 0 }, { id: "cooperate", name: "Propose closer cooperation", rel: 4, risk: 0.3 },
  { id: "congratulate", name: "Congratulate them", rel: 3, risk: 0 }, { id: "apologise", name: "Apologise for a past dispute", rel: 5, risk: 0.2 },
  { id: "protest", name: "Formal protest", rel: -4, risk: 0 }, { id: "warning", name: "Stern warning", rel: -8, risk: 0 }
];
function sendMessage(g, cid, tone, text) {
  var f = countryOf(g, cid), T = null;
  for (var i = 0; i < MESSAGE_TONES.length; i++) if (MESSAGE_TONES[i].id == tone) T = MESSAGE_TONES[i];
  if (!f || !T) return { error: "Unknown." };
  if (!g.diplo) g.diplo = { last: {}, summit: {}, log: [] };
  if (g.diplo.last[cid] && g.week - g.diplo.last[cid] < 4) return { error: "You wrote to " + f.name + " recently. Wait a few weeks." };
  g.diplo.last[cid] = g.week;
  var r = rand(g), change = T.rel, reply;
  if (T.risk && r < T.risk && f.relation < 50) { change = -2; reply = "They reply coolly. They think it is too soon."; }
  else if (T.rel > 0) reply = f.relation > 60 ? "A warm reply arrives within days." : "A polite, careful reply comes back.";
  else reply = f.relation > 50 ? "They are surprised and hurt." : "They reject your complaint and summon your ambassador.";
  if (tone == "warning" && !f.democratic && f.military > 30) { reply += " Their state media calls it a provocation."; change -= 3; }
  f.relation = clamp(f.relation + change, 0, 100);
  g.diplo.log.push({ week: g.week, to: f.name, tone: T.name, text: String(text || "").slice(0, 400), reply: reply, change: change });
  if (g.diplo.log.length > 60) g.diplo.log.shift();
  if (Math.abs(change) >= 5) addEvent(g, "diplomacy", 1, (change > 0 ? "Warmer words between " : "War of words with ") + f.name, { country: f.name, message: T.name, reply: reply }, "", change > 0 ? 1 : -1);
  return { reply: reply, change: change };
}
function holdSummit(g, cid) {
  var f = countryOf(g, cid);
  if (!g.diplo) g.diplo = { last: {}, summit: {}, log: [] };
  if (g.diplo.summit[cid] && g.week - g.diplo.summit[cid] < 26) return "You met them less than six months ago.";
  if (f.atWar) return "You are at war.";
  if (f.relation < 20) return "They refuse to meet you.";
  g.diplo.summit[cid] = g.week;
  var gain = 4 + Math.round(rand(g) * 5);
  f.relation = clamp(f.relation + gain, 0, 100);
  g.politics.mood += 0.004;
  addEvent(g, "summit", 2, g.leaderName + " holds summit with " + f.leader + " of " + f.name, { country: f.name, relations: Math.round(f.relation) + "/100" }, "The two leaders talked about " + f.interest + ".", 1);
  return "";
}

var ACHIEVEMENTS = [
  { id: "founder", name: "Founder", text: "Write your own ideology.", check: function (g) { return g.movement && (g.movement.ideology.changes > 0 || g.movement.custom); } },
  { id: "manifesto", name: "Promise maker", text: "Make 3 manifesto commitments.", check: function (g) { return g.movement && g.movement.commitments.length >= 3; } },
  { id: "keeper", name: "Promise keeper", text: "Keep every manifesto commitment through an election.", check: function (g) { return g.movement && g.movement.keptAll; } },
  { id: "bigtent", name: "Mass movement", text: "Double your party's membership.", check: function (g) { return g.movement && g.movement.members >= 2 * (g.movement.members0 || 1e12); } },
  { id: "unity", name: "United party", text: "Every faction in a good mood (70+).", check: function (g) { return g.movement && g.movement.factions.every(function (f) { return f.mood >= 70; }); } },
  { id: "balanced", name: "Balanced books", text: "Run a budget surplus.", check: function (g) { return g.flows.balance > 0; } },
  { id: "fulljobs", name: "Full employment", text: "Unemployment below 4%.", check: function (g) { return 1 - g.econ.employed / g.econ.labourForce < 0.04; } },
  { id: "lowdebt", name: "Debt slayer", text: "Debt below 40% of GDP.", check: function (g) { return totalDebt(g) / g.econ.gdp < 0.4; } },
  { id: "green", name: "Green revolution", text: "Cut emissions by 30% from the start.", check: function (g) { return g.econ.emissions < 0.7 * g.history[0].emissions; } },
  { id: "healthy", name: "Healthy nation", text: "Health access above 99%.", check: function (g) { return g.services.health.access > 0.99; } },
  { id: "safe", name: "Safe streets", text: "Crime down 25% from the start.", check: function (g) { return g.crime < 0.75 * g.crime0; } },
  { id: "clean", name: "Clean hands", text: "Corruption below 10.", check: function (g) { return g.politics.corruption < 10; } },
  { id: "free", name: "Beacon of freedom", text: "Keep the democracy index at 95+ for 4 years.", check: function (g) { return g.week >= 208 && g.politics.di >= 95; } },
  { id: "popular", name: "People's choice", text: "Approval above 60%.", check: function (g) { return g.politics.approval > 0.6; } },
  { id: "landslide", name: "Landslide", text: "Your party holds 60% of the seats.", check: function (g) { return playerParty(g).seats >= 0.6 * g.constitution.seats && g.constitution.legislature == "elected"; } },
  { id: "reelected", name: "Re-elected", text: "Win an election.", check: function (g) { return g.politics.elections.length > 0 && !g.gameOver; } },
  { id: "decade", name: "A decade in power", text: "Govern for 10 years.", check: function (g) { return g.week >= 520; } },
  { id: "lawmaker", name: "Lawmaker", text: "Pass 5 laws of your own.", check: function (g) { return (g.customLaws || []).length >= 5; } },
  { id: "builder", name: "State builder", text: "Run 3 agencies.", check: function (g) { return (g.agencies || []).length >= 3; } },
  { id: "dealmaker", name: "Deal maker", text: "Have 3 deals with unions, business or others at once.", check: function (g) { return dealCount(g) >= 3; } },
  { id: "diplomat", name: "Diplomat", text: "Relations of 80+ with three countries.", check: function (g) { return g.foreign.filter(function (f) { return f.relation >= 80; }).length >= 3; } },
  { id: "orgfounder", name: "World builder", text: "Found an organisation with 3 members.", check: function (g) { return (g.orgs || []).some(function (o) { return o.members.length >= 3; }); } },
  { id: "peace", name: "Peacemaker", text: "Win or end a war.", check: function (g) { return g.wars && g.wars.length > 0 && !g.war; } },
  { id: "ironfist", name: "Iron grip", text: "Unrest 0 and army loyalty 90+.", check: function (g) { return g.politics.unrest < 0.5 && g.defence.loyalty >= 90; } },
  { id: "storyteller", name: "Storyteller", text: "Write your nation's founding story and a leader biography.", check: function (g) { return g.country.story && g.leader && g.leader.bio; } }
];
function dealCount(g) { var n = 0; if (!g.stake) return 0; for (var k in g.stake) { if (k == "base") continue; if (k == "regions") { for (var r = 0; r < g.stake.regions.length; r++) if (g.stake.regions[r].deal) n++; } else if (g.stake[k].deal) n++; } return n; }
function checkAchievements(g) {
  if (!g.achievements) g.achievements = {};
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (g.achievements[a.id]) continue;
    var ok = false; try { ok = !!a.check(g); } catch (e) { ok = false; }
    if (ok) { g.achievements[a.id] = g.week; addEvent(g, "achievement", 1, "Achievement: " + a.name, { what: a.text }, "", 1).covered = true; }
  }
}
var HOLIDAY_TYPES = [
  { id: "independence", name: "Independence / founding day", mood: 0.005, legit: 1 }, { id: "labour", name: "Workers' day", mood: 0.003, group: "unions" },
  { id: "religious", name: "Religious festival", mood: 0.004, group: "faith" }, { id: "remembrance", name: "Remembrance day", mood: 0.002, loyalty: 1 },
  { id: "culture", name: "Culture or language day", mood: 0.003, legit: 0.5 }, { id: "constitution", name: "Constitution day", mood: 0.002, legit: 1 },
  { id: "harvest", name: "Harvest festival", mood: 0.003, group: "farmers" }, { id: "other", name: "Other", mood: 0.003 }
];
function holidayType(id) { for (var i = 0; i < HOLIDAY_TYPES.length; i++) if (HOLIDAY_TYPES[i].id == id) return HOLIDAY_TYPES[i]; return HOLIDAY_TYPES[HOLIDAY_TYPES.length - 1]; }
function holidaysWeekly(g) {
  var H = g.country.holidays || [], wk = weekOfYear(g);
  for (var i = 0; i < H.length; i++) {
    if (parseInt(H[i].week) != wk) continue;
    var T = holidayType(H[i].type), m = T.mood;
    if (T.id == "religious" && g.constitution.religion == "secular") m *= 0.4;
    g.politics.mood += m;
    if (T.legit) g.politics.legitimacy += T.legit;
    if (T.loyalty) g.defence.loyalty += T.loyalty;
    if (T.group && g.stake && g.stake[T.group]) g.stake[T.group].rel = Math.min(100, g.stake[T.group].rel + 2);
    var city = g.country.cities && g.country.cities.length ? g.country.cities[(g.week + i) % g.country.cities.length] : g.country.capital;
    addEvent(g, "holiday", 1, "Crowds celebrate " + H[i].name, { holiday: H[i].name, where: city }, "A national holiday. Most people have the day off.", 1);
  }
}

function movementWeekly(g) {
  var mv = ensureMovement(g), me = playerParty(g);
  if (!mv.members0) mv.members0 = mv.members;
  if (me.ideoTarget) {
    me.econ += clamp(me.ideoTarget.econ - me.econ, -1.5, 1.5);
    me.social += clamp(me.ideoTarget.social - me.social, -1.5, 1.5);
  }
  var deliv = deliveryScore(g), ap = g.politics.approval;
  mv.delivery = deliv;
  var unhappy = mv.factions.filter(function (f) { return f.mood < 35; }).length;
  var job = g.leader ? g.leader.job : "";
  var entTarget = 50 + (ap - 0.45) * 60 + (deliv - 50) * 0.4 + (mv.cred - 60) * 0.3 - unhappy * 5 + (mv.leadership == "leader" ? -8 : (mv.leadership == "members" ? 4 : 0)) + (job == "activist" ? 8 : 0) + (mv.boostE || 0);
  mv.boostE = (mv.boostE || 0) * 0.9;
  mv.enthusiasm += (clamp(entTarget, 0, 100) - mv.enthusiasm) * 0.05;
  mv.cred += ((60 + (deliv - 50) * 0.3 - mv.ideology.changes * 3) - mv.cred) * 0.01;
  mv.cred = clamp(mv.cred, 0, 100);
  var grow = (mv.enthusiasm - 50) / 50 * 0.003 + (ap - 0.4) * 0.004 + (mv.recruit || 0);
  mv.recruit = (mv.recruit || 0) * 0.85;
  mv.members = Math.max(100, mv.members * (1 + grow / 4));
  me.members = Math.round(mv.members);
  var Y = g.econ.gdp;
  var donations = g.stake && g.stake.business ? Y * 0.000001 * clamp((g.stake.business.rel - 40) / 60, 0, 1) : 0;
  mv.funds += mv.members * 50 / 1e9 / 52 * (g.econ.price || 1) + donations;
  for (var i = 0; i < mv.factions.length; i++) {
    var f = mv.factions[i], t;
    if (f.id == "purists") t = 50 + (deliv - 50) * 0.8 - mv.ideology.changes * 4;
    else if (f.id == "pragmatists") t = 50 + (ap - 0.45) * 150;
    else { var P = ideoProgress(g), p = 0; for (var j = 0; j < P.length; j++) if (P[j].id == f.dim) p = P[j].progress; t = 50 + p * 40 + (ap - 0.45) * 30; }
    t += (f.boost || 0); f.boost = (f.boost || 0) * 0.95;
    f.mood += (clamp(t, 0, 100) - f.mood) * 0.05;
    f.mood = clamp(f.mood, 0, 100);
    if (f.mood < 20) f.low++; else f.low = 0;
    if (f.low == 4) addEvent(g, "faction", 2, "Rebellion brewing in " + me.name + ": the " + f.name + " are furious", { faction: f.name, leader: f.leader, mood: Math.round(f.mood) + "/100" }, f.about + " They feel ignored.", -1, true);
    if (f.low >= 10 && f.strength >= 15 && canSplit(g)) { splitParty(g, f); break; }
  }
  var cbi = (mv.enthusiasm - 60) / 100 * 0.4 + (mv.cred - 60) / 100 * 0.4;
  me.mbias = cbi;
  for (var i = 0; i < g.parties.length; i++) {
    var p = g.parties[i];
    if (p.cbias) p.cbias *= 0.97;
    if (p.rbias) for (var r = 0; r < p.rbias.length; r++) p.rbias[r] *= 0.97;
  }
  if (mv.leadership != "leader" && mv.enthusiasm < 25 && ap < 0.32 && g.week - mv.lastChallenge > 52) leadershipChallenge(g);
  var gp = govParties(g);
  for (var i = 0; i < gp.length; i++) {
    var d = coalitionDeal(g, gp[i].id);
    if (d) gp[i].patience = Math.min(90, gp[i].patience + 0.15);
  }
  for (var i = 0; i < mv.deals.length; i++) {
    var D = mv.deals[i];
    if (D.broken || !D.commit) continue;
    var c = null; for (var j = 0; j < mv.commitments.length; j++) if (mv.commitments[j].key == D.commit) c = mv.commitments[j];
    if (c && c.status == "broken") { D.broken = true; var pp = findParty(g, D.party); if (pp) pp.patience -= 40; }
  }
  if (g.politics.elections.length > mv.electionsSeen) { mv.electionsSeen = g.politics.elections.length; closeManifesto(g); }
  stakeWeekly(g);
  holidaysWeekly(g);
  if (g.week % 13 == 0) { if (!g.scoreHist) g.scoreHist = []; g.scoreHist.push({ week: g.week, s: scorecard(g).map(function (x) { return Math.round(x.score); }) }); if (g.scoreHist.length > 80) g.scoreHist.shift(); }
  for (var i = 0; i < (g.agencies || []).length; i++) {
    var a = g.agencies[i];
    if (a.independent && (g.week - a.since) % 26 == 25 && chance(g, 0.3) && g.politics.corruption > 25) {
      addEvent(g, "agency", 2, a.name + " report criticises the government", { agency: a.name, head: a.head }, "Independent bodies sometimes bite the hand that feeds them.", -1);
      g.politics.mood -= 0.005;
    }
  }
  checkAchievements(g);
}
function canSplit(g) { return g.constitution.partySystem == "multi" && g.constitution.legislature != "none" && g.parties.length < 12; }
function splitParty(g, f) {
  var mv = g.movement, me = playerParty(g);
  var I = dimsObj(mv.ideology.dims);
  var pos = { econ: me.econ, social: me.social };
  if (f.id == "purists") { pos.econ += (me.econ < 50 ? -12 : 12); pos.social += (me.social < 50 ? -8 : 8); }
  else if (f.id == "pragmatists") { pos.econ += (50 - me.econ) * 0.5; pos.social += (50 - me.social) * 0.5; }
  else { var dd = I[f.dim] >= 50 ? 1 : -1; if (f.dim == "econ") pos.econ += 15 * dd; else if (["welfare", "ownership"].indexOf(f.dim) >= 0) pos.econ -= 15 * dd; else pos.social += 15 * dd; }
  var seats = Math.max(1, Math.round(me.seats * f.strength / 100 * 0.5));
  if (me.seats - seats < 1) return;
  me.seats -= seats;
  var name = f.name.replace(" wing", "").replace(" caucus", "") + " " + (me.name.split(" ").pop() || "Party");
  if (name.length < 6) name = "New " + me.name;
  var np = { id: "split" + g.week, name: name.slice(0, 50), econ: clamp(Math.round(pos.econ), 0, 100), social: clamp(Math.round(pos.social), 0, 100), color: "#777777", seats: seats, inGov: false, player: false,
    leader: f.leader, bias: me.bias - 1.2, poll: 0, patience: 40, members: Math.round(mv.members * f.strength / 100 * 0.4), banned: false };
  g.parties.push(np);
  mv.members *= 1 - f.strength / 100 * 0.4;
  mv.factions.splice(mv.factions.indexOf(f), 1);
  mv.enthusiasm -= 10;
  if (g.cohorts) updatePolls(g);
  addEvent(g, "split", 3, "Party split! " + f.leader + " leads the " + f.name + " out of " + me.name, { newParty: np.name, seats: seats, govSeats: govSeats(g), majority: g.constitution.majority },
    "After months of anger, the " + f.name + " walked out to form " + np.name + ".", -1, true);
}
function leadershipChallenge(g) {
  var mv = g.movement;
  mv.lastChallenge = g.week;
  var win = 0.45 + (mv.enthusiasm - 25) / 100 + mv.cred / 250 + (mv.leadership == "council" ? 0.15 : 0);
  var challenger = randomName(g);
  if (chance(g, clamp(win, 0.1, 0.9)) || g.difficulty == "story" || g.difficulty == "sandbox") {
    addEvent(g, "challenge", 3, g.leaderName + " survives leadership challenge from " + challenger, { challenger: challenger, enthusiasm: Math.round(mv.enthusiasm) + "/100" }, "Party members were unhappy, but not enough to remove the leader.", 0, true);
    mv.enthusiasm += 8; g.politics.mood -= 0.01;
  } else {
    addEvent(g, "challenge", 3, g.leaderName + " is ousted as party leader by " + challenger, { challenger: challenger }, "The party lost faith in its leader.", -1, true);
    g.gameOver = { week: g.week, reason: "Your own party removed you as leader. " + challenger + " takes over. (Members' enthusiasm had fallen to " + Math.round(mv.enthusiasm) + "/100 and approval to " + pct(g.politics.approval, 0) + ".)" };
  }
}
function coalitionDeal(g, pid) { var mv = g.movement; if (!mv) return null; for (var i = 0; i < mv.deals.length; i++) if (mv.deals[i].party == pid && !mv.deals[i].broken && mv.deals[i].until > g.week) return mv.deals[i]; return null; }
function closeManifesto(g) {
  var mv = g.movement, kept = 0, broke = 0;
  for (var i = 0; i < mv.commitments.length; i++) {
    var c = mv.commitments[i];
    if (c.status != "open") continue;
    var ok = commitOnTrack(g, c);
    c.status = ok ? "kept" : "broken"; c.closed = g.week;
    if (ok) kept++; else broke++;
  }
  if (kept + broke) {
    mv.cred = clamp(mv.cred + kept * 4 - broke * 6, 0, 100);
    mv.keptAll = broke == 0 && kept >= 2;
    addEvent(g, "manifesto", 2, "Manifesto report: " + kept + " promise(s) kept, " + broke + " broken", { kept: kept, broken: broke }, "At every election, voters and members judge the last manifesto.", kept >= broke ? 1 : -1);
  }
  mv.pastCommitments = mv.pastCommitments.concat(mv.commitments).slice(-40);
  mv.commitments = mv.commitments.filter(function (c) { return c.status == "open"; });
}
function manifestoEffect(g, c) {
  var mv = g.movement; if (!mv || !mv.commitments.length) return 0;
  var on = 0, off = 0;
  for (var i = 0; i < mv.commitments.length; i++) { var m = mv.commitments[i]; if (m.status != "open") continue; if (g.week - m.made < 13) continue; if (commitOnTrack(g, m)) on++; else off++; }
  var due = g.politics.snapElection || g.politics.nextElection;
  var near = due ? clamp(1 - (due - g.week) / 104, 0.2, 1) : 0.5;
  return (on * 0.006 - off * 0.008) * near * (mv.cred / 70);
}
function movementAction(g, act, arg) {
  var mv = ensureMovement(g), me = playerParty(g), Y = g.econ.gdp;
  var cost = { rally: 0.000006, canvass: 0.000004, ads: 0.00001, recruit: 0.000005, congress: 0.000012, oped: 0, thinktank: 0.000008 }[act];
  if (cost === undefined) return "Unknown action.";
  cost *= Y;
  if (mv.cooldown[act] && g.week < mv.cooldown[act]) return "You did that recently. Try again in " + (mv.cooldown[act] - g.week) + " week(s).";
  if (mv.funds < cost) return "Not enough party funds (" + money(g, cost) + " needed).";
  mv.funds -= cost;
  var free = g.constitution.assembly != "banned";
  if (act == "rally") { if (!free) return "Rallies are banned under your constitution."; mv.boostE = (mv.boostE || 0) + 10; me.cbias = (me.cbias || 0) + 0.12; mv.cooldown.rally = g.week + 2; }
  if (act == "canvass") { var r = parseInt(arg) || 0; if (!me.rbias) me.rbias = g.regions.map(function () { return 0; }); me.rbias[r] = (me.rbias[r] || 0) + 0.3; mv.cooldown.canvass = g.week + 1; }
  if (act == "ads") { me.cbias = (me.cbias || 0) + (g.constitution.press == "free" ? 0.2 : 0.3); mv.cooldown.ads = g.week + 4; }
  if (act == "recruit") { mv.recruit = (mv.recruit || 0) + 0.004; mv.cooldown.recruit = g.week + 4; }
  if (act == "congress") { for (var i = 0; i < mv.factions.length; i++) mv.factions[i].boost = (mv.factions[i].boost || 0) + 15; mv.boostE = (mv.boostE || 0) + 6; mv.cooldown.congress = g.week + 26; }
  if (act == "thinktank") { mv.cred = Math.min(100, mv.cred + 4); mv.cooldown.thinktank = g.week + 13; }
  var names = { rally: "Rally", canvass: "Door-to-door campaign in " + (g.regions[parseInt(arg) || 0] || {}).name, ads: "Advertising campaign", recruit: "Membership drive", congress: "Party congress", thinktank: "Policy think tank report" };
  mv.log.push({ week: g.week, what: names[act], cost: cost });
  if (mv.log.length > 50) mv.log.shift();
  if (act == "rally" || act == "congress") addEvent(g, "partyEvent", 1, (act == "rally" ? "Thousands cheer at " + me.name + " rally in " + g.country.capital : me.name + " holds its party congress"), { party: me.name, slogan: mv.slogan || "-" }, "", 1);
  g.commandLog.push({ week: g.week, cmd: "movement", act: act, arg: arg });
  return "";
}
function factionAction(g, fid, act) {
  var mv = ensureMovement(g), f = null;
  for (var i = 0; i < mv.factions.length; i++) if (mv.factions[i].id == fid) f = mv.factions[i];
  if (!f) return "No such faction.";
  if (act == "meet") { if (mv.cooldown["meet_" + fid] && g.week < mv.cooldown["meet_" + fid]) return "You met them recently."; f.boost = (f.boost || 0) + 10; mv.cooldown["meet_" + fid] = g.week + 8; return ""; }
  if (act == "job") {
    if (mv.cooldown.job && g.week < mv.cooldown.job) return "You reshuffled for a faction recently.";
    var cands = g.cabinet.filter(function (m) { return m.party == playerParty(g).id; });
    if (!cands.length) return "No ministry of your own party to give.";
    var worst = cands[0]; for (var i = 1; i < cands.length; i++) if (cands[i].competence < worst.competence) worst = cands[i];
    worst.name = f.leader; worst.competence = 0.35 + rand(g) * 0.45; worst.since = g.week;
    f.boost = (f.boost || 0) + 25;
    for (var i = 0; i < mv.factions.length; i++) if (mv.factions[i] != f) mv.factions[i].boost = (mv.factions[i].boost || 0) - 5;
    mv.cooldown.job = g.week + 13;
    addEvent(g, "reshuffle", 1, f.leader + " of the " + f.name + " joins the cabinet", { faction: f.name, ministry: ministryName(worst.ministry) }, "A move to keep the party together.", 0);
    return "";
  }
  if (act == "adopt" && f.dim) {
    var k = 0; for (var i = 0; i < IDEO_DIMS.length; i++) if (IDEO_DIMS[i].id == f.dim) k = i;
    var dims = mv.ideology.dims.slice(); dims[k] = clamp(dims[k] + (dims[k] >= 50 ? 10 : -10), 0, 100);
    setIdeology(g, { name: mv.ideology.name, about: mv.ideology.about, manifesto: mv.ideology.manifesto, dims: dims, mix: mv.ideology.mix }, false);
    f.boost = (f.boost || 0) + 20;
    return "";
  }
  return "Unknown.";
}
function coalitionAction(g, pid, act, arg) {
  var p = findParty(g, pid), mv = ensureMovement(g);
  if (!p || !p.inGov || p.player) return "That party is not your partner.";
  var key = act + "_" + pid;
  if (act == "summit") {
    if (mv.cooldown[key] && g.week < mv.cooldown[key]) return "You met them recently.";
    p.patience = Math.min(90, p.patience + 12); mv.cooldown[key] = g.week + 8; return "";
  }
  if (act == "ministry") {
    var m = null; for (var i = 0; i < g.cabinet.length; i++) if (g.cabinet[i].ministry == arg) m = g.cabinet[i];
    if (!m) return "No such ministry.";
    if (m.party == pid) return "They already run it.";
    m.party = pid; m.name = randomName(g); m.competence = 0.35 + rand(g) * 0.45; m.since = g.week;
    p.patience = Math.min(95, p.patience + 25);
    mv.deals.push({ party: pid, type: "ministry", what: "They run the " + ministryName(arg), week: g.week, until: g.week + 208 });
    addEvent(g, "coalition", 2, p.name + " takes over the " + ministryName(arg), { party: p.name, minister: m.name }, "Part of a new coalition agreement.", 0);
    return "";
  }
  if (act == "promise") {
    var id = p.social > 70 && p.econ < 50 ? "green" : (p.econ < 45 ? "welfare" : (p.econ > 58 ? "notax" : "balance"));
    if (p.name.toLowerCase().indexOf("green") >= 0) id = "green";
    for (var i = 0; i < mv.commitments.length; i++) if (mv.commitments[i].id == id && mv.commitments[i].status == "open") return "That promise (" + commitText(mv.commitments[i]) + ") is already in your manifesto.";
    var c = makeCommit(g, id); c.key = "co_" + pid + "_" + g.week; c.forParty = p.name;
    mv.commitments.push(c);
    p.patience = Math.min(95, p.patience + 20);
    mv.deals.push({ party: pid, type: "promise", what: "Promise: " + commitText(c), week: g.week, until: g.week + 208, commit: c.key });
    return "";
  }
  return "Unknown.";
}

var SCORE_DEFS = [
  { id: "prosperity", name: "Prosperity (output per person)", levers: "Investment, skills, infrastructure, low corruption. Costs: higher taxes and red tape slow it.", f: function (g, r) { return 50 + (g.econ.realGdp / totalPop(g) / r.gdppp - 1) * 400; } },
  { id: "jobs", name: "Employment", levers: "Demand, training, low payroll taxes. A very high minimum wage can cost jobs.", f: function (g) { return 100 - (1 - g.econ.employed / g.econ.labourForce) * 800; } },
  { id: "living", name: "Living standards", levers: "Wages, low inflation, benefits. Raising taxes on households lowers it.", f: function (g, r) { return 50 + (sumq(g.flows, "disp") / g.econ.price / totalPop(g) / r.livpp - 1) * 400; } },
  { id: "equality", name: "Equality", levers: "Benefits, minimum wage, progressive taxes. Too much can slow growth.", f: function (g) { return 130 - gapRatio(g) * 12; } },
  { id: "debt", name: "Public finances", levers: "Taxes up or spending down. Both cost popularity.", f: function (g) { return 100 - totalDebt(g) / g.econ.gdp * 80 + g.flows.balance / g.econ.gdp * 300; } },
  { id: "health", name: "Health", levers: "Health budget, doctors, public health. Expensive.", f: function (g) { return (g.services.health.access - 0.8) * 500 - g.services.health.wait * 1.5; } },
  { id: "education", name: "Education", levers: "School budget, teachers. Pays off slowly.", f: function (g) { return (g.services.education.access - 0.8) * 500; } },
  { id: "safety", name: "Safety", levers: "Police, courts, jobs for young people. Tough laws can cost liberties.", f: function (g) { return 100 - g.crime / 2; } },
  { id: "liberty", name: "Civil liberties", levers: "Free press, courts, elections. Less control means more noise.", f: function (g) { return g.politics.di; } },
  { id: "clean", name: "Honest government", levers: "Anti-corruption bodies, free press, courts.", f: function (g) { return 100 - g.politics.corruption; } },
  { id: "stability", name: "Stability", levers: "Legitimacy, low unrest, fair deals with groups.", f: function (g) { return (g.politics.legitimacy + 100 - g.politics.unrest) / 2; } },
  { id: "approval", name: "Public approval", levers: "Everything above, plus not breaking promises.", f: function (g) { return g.politics.approval * 100 * 1.2; } },
  { id: "military", name: "Military readiness", levers: "Defence budget, equipment, training. Costs money.", f: function (g) { return g.defence.readiness; } },
  { id: "environment", name: "Environment", levers: "Carbon tax, green energy, limits on pollution. Can cost growth and jobs in heavy industry.", f: function (g) { return 100 - g.econ.emissionsIntensity / 0.15 * 50; } }
];
function scoreRefs(g) {
  if (!g.scoreRef) g.scoreRef = { gdppp: g.econ.realGdp / totalPop(g), livpp: sumq(g.flows, "disp") / g.econ.price / totalPop(g), week: g.week };
  return g.scoreRef;
}
function scorecard(g) {
  var r = scoreRefs(g);
  return SCORE_DEFS.map(function (d) { var v = 0; try { v = d.f(g, r); } catch (e) { v = 50; } return { id: d.id, name: d.name, score: clamp(v, 0, 100), levers: d.levers }; });
}
function grade(s) { return s >= 80 ? "A" : (s >= 65 ? "B" : (s >= 50 ? "C" : (s >= 35 ? "D" : (s >= 20 ? "E" : "F")))); }

function clockPeriod(mode) { return { day: 86400000, half: 43200000, six: 21600000, hour: 3600000 }[mode] || 0; }
function weeksDue(clock, now) {
  if (!clock || !clockPeriod(clock.mode) || !clock.last) return 0;
  return clamp(Math.floor((now - clock.last) / clockPeriod(clock.mode)), 0, clock.cap || 26);
}
