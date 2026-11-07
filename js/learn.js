var PAGE_HELP = {
  world: ["The online world: other players' nations, mail, treaties, world organisations, world news and the forum.", "Publish your nation, visit other nations, send messages and treaty offers, found or join organisations, and post press releases.", "Treaties and organisations with real players count in your own simulation every week. Bigger trade partners are worth more."],
  ideology: ["What your movement believes: nine dials from economy to culture, a name, a manifesto and concrete promises.", "Blend real traditions, set the dials, rename it, write your manifesto, and make up to 5 promises.", "Pick promises you can actually keep before the next election. Broken promises cost credibility."],
  movement: ["Your party as an organisation: members, money, enthusiasm, credibility, factions and coalition partners.", "Spend party funds on rallies, ads and canvassing, write op-eds, keep factions happy and make deals with coalition partners.", "Campaign boosts fade after a few months. Save your money for the run-up to an election."],
  stakeholders: ["Unions, business, farmers, faith groups, greens, students, pensioners and the regions, and how they feel about you.", "Sign deals with them: each one gives you something and costs you something.", "Ignore a group for too long and they strike, protest or stop investing."],
  agencies: ["Permanent bodies that do one job, and the government's top priorities.", "Create agencies with their own name and budget, decide if they are independent, and pick up to 3 national priorities.", "Agencies take about a year to reach full strength. Plan ahead."],
  scorecard: ["14 outcomes from prosperity to the environment, graded A to F, plus your ideology's report card and achievements.", "Use it to see what is working and what each choice costs elsewhere.", "No ideology wins at everything. Pick what matters most to you."],
  leader: ["You: portrait, biography, past job, political record and achievements.", "Design your portrait, write your story, pick your job before politics (once).", "Your past job gives a small bonus, like unions trusting a former union organiser."],
  diplomacy: ["Direct contact with other governments, and international organisations you found and lead.", "Send messages, hold summits, found trade blocs, defence alliances, climate pacts and more, and invite members.", "Countries interested in the topic join more easily. Summits help a lot before you invite them."],
  profile: ["Your country's public page: symbols, story, leader, ideology and scores.", "Print it or save it as a PDF to share.", "Write a founding story on the National Identity page to fill it out."],
  dashboard: ["Your home page. The table shows the country's key numbers and how they changed since last week, last month, last year and the start of your term.", "Click any number to see its history. Click \"why?\" to see what caused a change. Read your advisers' briefing for ideas on what to do next.", "Green arrows are good, red are bad. Don't panic about one bad week; look at the trend."],
  cabinet: ["Your ministers. Each one runs a ministry. Their competence decides how fast things get done (like hiring nurses).", "Replace weak ministers, rename ministries, or merge two together to save money.", "Firing a coalition partner's minister makes that party angry."],
  parliament: ["The legislature and the bills going through it. You need a majority for most laws.", "See who has how many seats, how each party votes, and how patient your coalition partners are.", "Before sending a bill, the preview tells you if it is likely to pass."],
  law: ["Your constitution and every law in force, including the ones you wrote yourself.", "Change the constitution, use ready-made policies, or repeal and reform your own laws.", "Want something that isn't here? Use <a href='#lawmaker'>Write a Law</a>."],
  lawmaker: ["Write any law you want from building blocks: money (benefits, taxes, programmes, subsidies) and rules (bans, rights, reforms).", "Pick an example or add parts one by one. Each rule has a strength from 5% to 100%. Try a pilot in one region first if you're not sure.", "The forecast box tells you roughly what will happen and who will love or hate it."],
  economy: ["How the economy is doing: growth, jobs, prices, trade and each industry.", "You can't control the economy directly. You change it through taxes, spending and laws.", "If inflation is high, the central bank raises interest rates, which slows things down."],
  treasury: ["The government's money: where it comes from and where it goes, and the national debt.", "The Finance Bill tab lets you change any tax or spending line.", "Borrowing too much makes lenders nervous and interest costs rise."],
  population: ["The people: 60 groups by region, age and income, and how each one feels about you.", "Find out which groups are unhappy and why.", "A law that helps one group often annoys another."],
  services: ["Hospitals, schools, police and transport: how much they can do vs how much people need.", "More money means more staff, but hiring takes time.", "Long waiting times are one of the fastest ways to lose popularity."],
  elections: ["Polls, the next election date and past results.", "Your approval decides how well your party does.", "In a country without elections this page shows what people would vote."],
  regions: ["Every region's population, income, jobs and mood.", "Regional pilots in Write a Law let you test ideas in one place.", "Poorer regions often feel left behind."],
  foreign: ["Other countries. Make treaties, sanctions or aid.", "Each country decides for itself, based on its interests and how it sees you.", "Trade deals boost exports. Bad relations with a strong neighbour can mean war."],
  defence: ["The armed forces, the war room and threats from abroad.", "Keep the army paid and equipped, or face a weak defence (and in non-democracies, a coup).", "You can declare war here, and offer peace if one starts."],
  news: ["The newspapers. They write about what you do, quote real people and remember your promises.", "Open a story to answer it from the press office. Make public promises on this page.", "Each paper leans left or right, and they hold grudges."],
  stats: ["Official statistics: national accounts by quarter and year.", "Useful to check the big picture.", ""],
  why: ["Explains what caused a number to change over the last weeks.", "The biggest causes are listed first.", ""],
  identity: ["Your country's name, flag, motto and symbols.", "Change them by passing a National Symbols Bill.", ""],
  settings: ["Save, load, export and settings.", "The game autosaves every week.", ""],
  learn: ["Step-by-step missions that teach you the game.", "Follow them in order. Each one has a \"Show me\" link.", ""]
};
function helpHidden(page) { try { return localStorage.getItem("ngs_help_" + page) == "hide"; } catch (e) { return false; } }
function helpBox(page) {
  var h = PAGE_HELP[page];
  if (!h || helpHidden(page)) return "";
  return "<div class='helpbox'><a class='helpclose' href='javascript:hideHelp(\"" + page + "\")' title='Hide this box'>[hide]</a><b>What is this page?</b> " + h[0] + "<br><b>What can I do here?</b> " + h[1] + (h[2] ? "<br><b>Tip:</b> " + h[2] : "") + "</div>";
}
function hideHelp(page) { try { localStorage.setItem("ngs_help_" + page, "hide"); } catch (e) { } route(); }
function showAllHelp() { try { for (var k in PAGE_HELP) localStorage.removeItem("ngs_help_" + k); } catch (e) { } alert("Help boxes are back on every page."); route(); }
var MISSIONS = [
  { id: "look", name: "Look around", text: "Open the history of a number by clicking it on the dashboard (try Approval).", link: "chart/approval", check: function (g, L) { return L.seen.chart; } },
  { id: "why", name: "Ask why", text: "Open a \"why?\" report to see what is driving a number.", link: "why/approval/4", check: function (g, L) { return L.seen.why; } },
  { id: "people", name: "Meet your people", text: "Open the Population page and find the unhappiest group.", link: "population", check: function (g, L) { return L.seen.population; } },
  { id: "ideology", name: "Decide what you believe", text: "Open Ideology and Manifesto. Blend some traditions or set the dials, name your ideology and adopt it (free in your first 4 weeks).", link: "ideology", check: function (g) { return g.movement && g.movement.custom; } },
  { id: "advance", name: "Let time pass", text: "Press \"Advance 1 week\" (or the N key). Each turn is one week.", link: "dashboard", check: function (g) { return g.week >= 2; } },
  { id: "budget", name: "Plan a budget", text: "Open the Finance Bill, change a tax or spending line, and press Preview to see the cost.", link: "treasury/bill", check: function (g, L) { return L.previewed; } },
  { id: "bill", name: "Send a bill", text: "Send any bill to the legislature (or sign it by decree).", link: "treasury/bill", check: function (g) { return g.bills.length > 0; } },
  { id: "law", name: "Get a law passed", text: "Advance until one of your bills becomes law. Check its progress on the Parliament page.", link: "parliament", check: function (g) { return g.bills.some(function (b) { return b.stage == "IMPLEMENTED"; }); } },
  { id: "write", name: "Write your own law", text: "Open Write a Law, pick an example (or build your own) and send it.", link: "lawmaker", check: function (g) { return g.bills.some(function (b) { return b.type == "law"; }); } },
  { id: "forecast", name: "Look before you leap", text: "In any bill preview, press \"Forecast 6 months\" to see what would happen.", link: "lawmaker", check: function (g, L) { return L.forecast; } },
  { id: "promise", name: "Write a manifesto promise", text: "On the Ideology page, make a concrete promise. Voters will judge you on it at the next election.", link: "ideology", check: function (g) { return g.movement && g.movement.commitments.length > 0; } },
  { id: "movement", name: "Grow your movement", text: "On Party and Movement, hold a rally or a membership drive, and check how your factions feel.", link: "movement", check: function (g) { return g.movement && g.movement.log.length > 0; } },
  { id: "scorecard", name: "Check the scorecard", text: "Open the National Scorecard: 14 outcomes, each with its trade-offs, plus your ideology's report card.", link: "scorecard", check: function (g, L) { return L.seen.scorecard; } },
  { id: "news", name: "Read the papers", text: "Open a news story. The papers react to everything you do.", link: "news", check: function (g, L) { return L.seen.article; } },
  { id: "press", name: "Talk to the press", text: "Answer a story from the press office (open a story and pick a response).", link: "news", check: function (g) { return g.commandLog.some(function (c) { return c.cmd == "press"; }); } },
  { id: "pledge", name: "Make a promise", text: "Make a public promise on the News page. Keep it and people trust you more. Break it and they won't forget.", link: "news", check: function (g) { return (g.pledges || []).length > 0; } },
  { id: "world", name: "Talk to the world", text: "Offer a treaty to another country on the Foreign Affairs page.", link: "foreign", check: function (g) { return g.commandLog.some(function (c) { return c.cmd == "offer"; }); } },
  { id: "save", name: "Save your game", text: "Save to a slot on the Settings page (it also autosaves every week).", link: "settings", check: function (g) { return g.commandLog.some(function (c) { return c.cmd == "savepoint"; }); } }
];
function learnState(g) {
  if (!g.learn) g.learn = { done: {}, seen: {}, on: true, previewed: false, forecast: false };
  return g.learn;
}
function checkMissions(g, page) {
  var L = learnState(g);
  if (page) L.seen[page.split("/")[0]] = true;
  var newly = [];
  for (var i = 0; i < MISSIONS.length; i++) {
    var m = MISSIONS[i];
    if (!L.done[m.id] && m.check(g, L)) { L.done[m.id] = g.week; newly.push(m); }
  }
  return newly;
}
function nextMission(g) {
  var L = learnState(g);
  for (var i = 0; i < MISSIONS.length; i++) if (!L.done[MISSIONS[i].id]) return { m: MISSIONS[i], n: i + 1 };
  return null;
}
function missionBar(g, newly) {
  var L = learnState(g);
  if (!L.on) return "";
  var h = "";
  for (var i = 0; i < newly.length; i++) h += "<div class='missiondone'>&#10004; Mission complete: <b>" + newly[i].name + "</b></div>";
  var nx = nextMission(g);
  if (!nx) return h;
  var done = 0; for (var k in L.done) done++;
  h += "<div class='missionbar'><b>Mission " + nx.n + " of " + MISSIONS.length + ": " + nx.m.name + ".</b> " + nx.m.text + " <a href='#" + nx.m.link + "'>Show me &raquo;</a>";
  h += " <span class='small'>(<a href='#learn'>all missions</a> | <a href='javascript:game.learn.on=false;route()'>turn off</a>)</span></div>";
  return h;
}
PAGES.learn = function () {
  var g = game, L = learnState(g);
  var h = title("Learn to play");
  h += "<p>Work through these missions in any order. Each one teaches one part of the game. Finished ones get a tick.</p><table class='data full'><tr><th></th><th>Mission</th><th>What to do</th><th></th></tr>";
  for (var i = 0; i < MISSIONS.length; i++) {
    var m = MISSIONS[i];
    h += "<tr><td>" + (L.done[m.id] ? "&#10004;" : (i + 1) + ".") + "</td><td><b>" + m.name + "</b></td><td>" + m.text + "</td><td><a href='#" + m.link + "'>Show me</a></td></tr>";
  }
  h += "</table><p>" + (L.on ? "<a href='javascript:game.learn.on=false;route()'>Hide the mission bar</a>" : "<a href='javascript:game.learn.on=true;route()'>Show the mission bar</a>") + " | <a href='javascript:showAllHelp()'>Show all help boxes again</a></p>";
  h += "<h2>The game in five minutes</h2><ol>";
  h += "<li><b>Every turn is one week.</b> Nothing happens until you press Advance. Take your time.</li>";
  h += "<li><b>You change things with bills.</b> A bill is a list of changes: taxes, spending, a policy, a law you wrote, or the constitution. It takes about 3 weeks to pass and start (or 1 week by decree).</li>";
  h += "<li><b>Everything costs something.</b> Spending raises the deficit, taxes make people poorer, rules annoy someone. The preview shows the cost, the 5 checks and a forecast.</li>";
  h += "<li><b>People decide your fate.</b> 60 groups of voters each judge you on their income, prices, jobs, services, crime and your laws. In a democracy they vote you out; in a dictatorship they riot.</li>";
  h += "<li><b>Things take time.</b> Hiring nurses or building homes takes months. Laws can be phased in. Watch the trend, not one week.</li></ol>";
  h += "<h2>Common goals and how to reach them</h2><table class='data full'>";
  var tips = [["Shorter hospital waits", "More health spending (Finance Bill), the hospital staffing policy, or a law with a healthcare programme. Prevention measures (smoking ban, sport) cut demand."],
    ["Lower unemployment", "Infrastructure, a job guarantee, training programmes, cutting payroll tax. Avoid big minimum wage jumps."],
    ["Lower inflation", "Spend less, raise taxes a little, or freeze prices (short-term). The central bank will raise rates on its own."],
    ["Less crime", "More police money, community policing, gang crackdowns, rehabilitation. Lower unemployment helps too."],
    ["Balance the budget", "Raise taxes, cut spending, or grow the economy. Cut slowly: big cuts cause strikes."],
    ["Win the election", "Keep approval above about 45%. Look after the groups that vote most (older and richer people turn out more). Keep your promises."],
    ["Stay in power without elections", "Keep the army paid (loyalty above 50), keep unrest down, keep legitimacy up. Festivals and propaganda help; repression works until it doesn't."]];
  for (var i = 0; i < tips.length; i++) h += "<tr><th>" + tips[i][0] + "</th><td>" + tips[i][1] + "</td></tr>";
  return h + "</table>";
};
function adviceList(g) {
  var a = [], h = g.history[g.history.length - 1], R = g.refs, e = g.econ, c = g.constitution;
  var hs = g.services.health;
  function add(prio, text, link, linkText) { a.push({ p: prio, text: text, link: link, linkText: linkText }); }
  if (g.war) add(10, "We are at war with " + countryOf(g, g.war.enemy).name + ". Front line " + Math.round(g.war.front) + ". Every week costs lives and money.", "defence", "War room");
  var due = g.politics.snapElection || g.politics.nextElection;
  if (electionsHeld(g) && due && due - g.week <= 26) add(9, "The election is in " + (due - g.week) + " weeks. Approval is " + pct(h.approval, 0) + (h.approval < 0.44 ? ". That's probably not enough to win." : ". You are in with a chance."), "elections", "Polls");
  if (g.politics.unrest > 45) add(8, "Unrest is high (" + Math.round(g.politics.unrest) + "/100). Calm things down: popular measures, let people protest peacefully, or (risky) crack down.", "lawmaker", "Write a law");
  if (g.defence.loyalty < 50) add(8, "The army is unhappy (loyalty " + Math.round(g.defence.loyalty) + "/100). Raise the defence budget or pass a military pay rise.", "treasury/bill", "Finance Bill");
  if (g.politics.legitimacy < 35) add(6, "Legitimacy is low. People don't accept your right to rule. Fighting corruption, keeping promises and good results help.", "law", "Constitution");
  if (hs.wait > R.wait * 1.25 || hs.access < 0.88) add(7, "Hospitals are overloaded: " + hs.wait.toFixed(1) + " weeks wait (it was " + R.wait.toFixed(1) + "). Fund more staff with the hospital staffing policy, or write a law with a healthcare programme.", "law/composer", "Policies");
  var def = -h.bal / h.gdp;
  if (def > 0.045) add(7, "The deficit is " + pct(def, 1) + " of GDP. Lenders are getting nervous" + (g.debt.riskPremium > 0.01 ? " (they already charge us " + pct(g.debt.riskPremium, 1) + " extra)" : "") + ". Raise some taxes or trim spending, slowly.", "treasury/bill", "Finance Bill");
  if (h.infl > 0.045) add(6, "Inflation is " + pct(h.infl, 1) + ". Prices hurt the poorest most. Avoid big spending rises; the central bank will raise interest rates.", "economy", "Economy");
  if (h.u > e.natU + 0.015) add(6, "Unemployment is " + pct(h.u, 1) + ". Infrastructure, training or a job guarantee would help.", "lawmaker", "Write a law");
  if (g.crime > g.crime0 * 1.1) add(5, "Crime is up " + Math.round((g.crime / g.crime0 - 1) * 100) + "% since you took office. Consider more police or a crime law.", "lawmaker", "Write a law");
  var worst = null;
  for (var i = 0; i < g.cohorts.length; i++) { var co = g.cohorts[i]; if (co.age > 0 && (!worst || co.approval < worst.approval)) worst = co; }
  if (worst && worst.approval < 0.3) {
    var wf = null; for (var k in worst.factors) if (k != "Time in office" && (!wf || worst.factors[k] < worst.factors[wf])) wf = k;
    add(5, "The unhappiest people are " + cohortName(g, worst) + " (" + pct(worst.approval, 0) + " approve). Their biggest complaint: " + (wf || "everything").toLowerCase() + ".", "population", "Population");
  }
  var gp = govParties(g);
  for (var i = 0; i < gp.length; i++) if (!gp[i].player && gp[i].patience < 35) add(7, "Your coalition partner " + gp[i].name + " is losing patience (" + Math.round(gp[i].patience) + "/80). Pass something they like (they lean " + (gp[i].econ < 45 ? "left" : (gp[i].econ > 55 ? "right" : "centre")) + ").", "parliament", "Parliament");
  if (g.politics.corruption > 50) add(4, "Corruption is high (" + Math.round(g.politics.corruption) + "/100). It cuts tax revenue. An anti-corruption law would help.", "lawmaker", "Write a law");
  for (var i = 0; i < g.bills.length; i++) if (g.bills[i].stage == "AMENDMENT WINDOW") add(4, "Bill \"" + g.bills[i].title + "\" has its final vote next week. You can still amend it.", "bill/" + g.bills[i].id, "Open bill");
  var open = (g.pledges || []).filter(function (p) { return p.status == "open"; });
  for (var i = 0; i < open.length; i++) {
    var p = open[i], t = pledgeType(p.type);
    if (t.key && p.deadline - g.week <= 13) { var v = pledgeValue(g, t); var on = t.down ? v <= p.target : v >= p.target; add(on ? 3 : 8, "Your promise to " + pledgeText(g, p).replace(/^to /, "") + " is due in " + (p.deadline - g.week) + " weeks. Right now: " + (Math.round(v * 10) / 10) + " " + t.unit + (on ? " (on track)." : " (NOT on track)."), "news", "Promises"); }
  }
  if (!a.length) add(1, "Things are calm. This is a good time for a big reform: write a law about whatever matters most to you.", "lawmaker", "Write a law");
  a.sort(function (x, y) { return y.p - x.p; });
  return a;
}
function briefingHtml(g) {
  var a = adviceList(g).slice(0, 4);
  var h = "<div class='briefing'><b>Your advisers' briefing</b><ul>";
  for (var i = 0; i < a.length; i++) h += "<li" + (a[i].p >= 7 ? " class='bad'" : "") + ">" + a[i].text + " <a href='#" + a[i].link + "'>" + a[i].linkText + " &raquo;</a></li>";
  return h + "</ul></div>";
}
function forecastBill(g, changes, weeks) {
  var base = copy(g), test = copy(g);
  base.calm = true; test.calm = true;
  applyChanges(test, changes, false);
  for (var i = 0; i < weeks; i++) {
    var r1 = advanceWeek(base); if (r1.ok) base = r1.game;
    var r2 = advanceWeek(test); if (r2.ok) test = r2.game;
  }
  var a = base.history[base.history.length - 1], b = test.history[test.history.length - 1];
  return {
    rows: [["Approval", a.approval, b.approval, "pct", 1], ["Real growth", a.growth, b.growth, "pct", 1], ["Unemployment", a.u, b.u, "pct", -1], ["Inflation", a.infl, b.infl, "pct", -1],
      ["Budget balance", a.bal, b.bal, "money", 1], ["Debt/GDP", a.debtRatio, b.debtRatio, "pct", -1], ["Disposable income", a.disp, b.disp, "k", 1], ["Hospital waiting time", a.wait, b.wait, "wk", -1],
      ["Recorded crime", a.crime, b.crime, "n", -1], ["Poverty rate", a.poverty, b.poverty, "pct", -1], ["Emissions", a.emissions, b.emissions, "n", -1], ["Unrest", a.unrest, b.unrest, "n", -1], ["Legitimacy", a.legitimacy, b.legitimacy, "n", 1]],
    groups: groupChange(base, test)
  };
}
function groupChange(base, test) {
  var out = [];
  for (var i = 0; i < test.cohorts.length; i++) if (test.cohorts[i].age > 0) out.push({ c: test.cohorts[i], d: test.cohorts[i].approval - base.cohorts[i].approval });
  out.sort(function (x, y) { return y.d - x.d; });
  return { best: out[0], worst: out[out.length - 1] };
}
function forecastHtml() {
  if (!draft) return;
  var g = game;
  if (draft.changes.some(function (c) { return c.kind == "war"; })) { $("forecastbox").innerHTML = "<p class='small'>Wars are too unpredictable to forecast.</p>"; return; }
  $("forecastbox").innerHTML = "<p class='small'>Working it out...</p>";
  setTimeout(function () {
    var F = forecastBill(g, draft.changes, 26);
    learnState(g).forecast = true;
    var h = "<table class='data'><tr><th>In 6 months</th><th class='num'>Without this bill</th><th class='num'>With it</th><th>Difference</th></tr>";
    for (var i = 0; i < F.rows.length; i++) {
      var r = F.rows[i], f = r[3];
      var fmt = function (v) { return f == "pct" ? pct(v, 1) : (f == "money" ? money(g, v) : (f == "k" ? v.toFixed(2) + "k" : (f == "wk" ? v.toFixed(1) + " wks" : v.toFixed(1)))); };
      var d = r[2] - r[1];
      var small = Math.abs(d) < Math.max(1e-6, Math.abs(r[1]) * 0.003);
      var good = d * r[4] > 0;
      h += "<tr><td>" + r[0] + "</td><td class='num'>" + fmt(r[1]) + "</td><td class='num'>" + fmt(r[2]) + "</td><td class='" + (small ? "" : (good ? "good" : "bad")) + "'>" + (small ? "about the same" : (d > 0 ? "&uarr; " : "&darr; ") + (f == "pct" ? pct(Math.abs(d), 2) : (f == "money" ? money(g, Math.abs(d)) : Math.abs(d).toFixed(2)))) + "</td></tr>";
    }
    h += "</table>";
    if (F.groups.best && F.groups.best.d > 0.002) h += "<p>Biggest winners: <b>" + cohortName(g, F.groups.best.c) + "</b> (approval " + (F.groups.best.d > 0 ? "+" : "") + (F.groups.best.d * 100).toFixed(1) + " points).</p>";
    if (F.groups.worst && F.groups.worst.d < -0.002) h += "<p>Biggest losers: <b>" + cohortName(g, F.groups.worst.c) + "</b> (" + (F.groups.worst.d * 100).toFixed(1) + " points).</p>";
    h += "<p class='small'>A forecast assumes the bill starts now and nothing surprising happens (no random events). Real life is messier.</p>";
    $("forecastbox").innerHTML = h;
  }, 20);
}
