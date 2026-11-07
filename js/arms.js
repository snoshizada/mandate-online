var SHIELDS = {
  heater: "M5,5 H95 V45 C95,75 70,92 50,98 C30,92 5,75 5,45 Z",
  round: "M5,5 H95 V50 A45,45 0 0 1 5,50 Z",
  square: "M5,5 H95 V95 H5 Z",
  swiss: "M5,5 Q50,15 95,5 V55 C95,80 70,95 50,98 C30,95 5,80 5,55 Z",
  oval: "M50,3 C80,3 95,25 95,50 C95,75 80,97 50,97 C20,97 5,75 5,50 C5,25 20,3 50,3 Z"
};
var ARMS_DIVS = [["none", "Plain"], ["pale", "Split down the middle"], ["fess", "Split across"], ["quarterly", "Quartered"], ["chevron", "Chevron"], ["bend", "Diagonal band"], ["cross", "Cross"], ["border", "Border"]];
var ARMS_CHARGES = [["none", "Nothing"], ["star", "Star"], ["sun", "Sun"], ["crescent", "Crescent moon"], ["tree", "Tree"], ["gear", "Gear"], ["wheat", "Wheat"], ["wave", "Waves"], ["mountain", "Mountain"], ["tower", "Tower"], ["crown", "Crown"], ["anchor", "Anchor"], ["book", "Book"], ["fist", "Raised fist"], ["dove", "Dove"]];
function defaultArms(g) {
  var f = (g.country.flag || ["#17345B", "#FFFFFF", "#C8102E"]);
  return { shield: "heater", field: f[0] || "#17345B", div: "none", field2: f[1] || "#FFFFFF", charge: "star", chargeColor: f[2] || f[1] || "#C8A400", motto: true };
}
function chargeSvg(c, col) {
  var s = "";
  if (c == "star") s = "<polygon points='50,26 56,43 74,43 60,54 65,71 50,61 35,71 40,54 26,43 44,43' fill='" + col + "'/>";
  if (c == "sun") { s = "<circle cx=50 cy=48 r=11 fill='" + col + "'/>"; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += "<line x1=" + (50 + Math.cos(a) * 14).toFixed(1) + " y1=" + (48 + Math.sin(a) * 14).toFixed(1) + " x2=" + (50 + Math.cos(a) * 22).toFixed(1) + " y2=" + (48 + Math.sin(a) * 22).toFixed(1) + " stroke='" + col + "' stroke-width=3/>"; } }
  if (c == "crescent") s = "<path d='M58,28 A20,20 0 1 0 58,68 A16,16 0 1 1 58,28 Z' fill='" + col + "'/>";
  if (c == "tree") s = "<polygon points='50,24 68,52 58,52 70,66 30,66 42,52 32,52' fill='" + col + "'/><rect x=46 y=66 width=8 height=10 fill='" + col + "'/>";
  if (c == "gear") s = "<circle cx=50 cy=48 r=15 fill='none' stroke='" + col + "' stroke-width=8 stroke-dasharray='6 4'/><circle cx=50 cy=48 r=11 fill='none' stroke='" + col + "' stroke-width=4/>";
  if (c == "wheat") { s = "<line x1=50 y1=26 x2=50 y2=74 stroke='" + col + "' stroke-width=3/>"; for (var i = 0; i < 5; i++) s += "<ellipse cx=44 cy=" + (32 + i * 8) + " rx=5 ry=3 fill='" + col + "' transform='rotate(-30 44 " + (32 + i * 8) + ")'/><ellipse cx=56 cy=" + (32 + i * 8) + " rx=5 ry=3 fill='" + col + "' transform='rotate(30 56 " + (32 + i * 8) + ")'/>"; }
  if (c == "wave") for (var i = 0; i < 3; i++) s += "<path d='M24," + (38 + i * 10) + " Q31," + (32 + i * 10) + " 37," + (38 + i * 10) + " T50," + (38 + i * 10) + " T63," + (38 + i * 10) + " T76," + (38 + i * 10) + "' fill='none' stroke='" + col + "' stroke-width=4/>";
  if (c == "mountain") s = "<polygon points='22,70 42,32 52,48 60,38 78,70' fill='" + col + "'/>";
  if (c == "tower") s = "<path d='M36,74 V40 H40 V34 H45 V40 H48 V34 H52 V40 H55 V34 H60 V40 H64 V74 Z' fill='" + col + "'/><rect x=46 y=58 width=8 height=16 fill='#000' opacity=0.35/>";
  if (c == "crown") s = "<path d='M28,62 L30,36 L40,50 L50,30 L60,50 L70,36 L72,62 Z' fill='" + col + "'/><rect x=28 y=62 width=44 height=7 fill='" + col + "'/>";
  if (c == "anchor") s = "<circle cx=50 cy=30 r=5 fill='none' stroke='" + col + "' stroke-width=3/><line x1=50 y1=35 x2=50 y2=72 stroke='" + col + "' stroke-width=4/><line x1=40 y1=44 x2=60 y2=44 stroke='" + col + "' stroke-width=3/><path d='M30,58 Q32,74 50,74 Q68,74 70,58' fill='none' stroke='" + col + "' stroke-width=4/>";
  if (c == "book") s = "<path d='M26,34 Q38,30 50,36 Q62,30 74,34 V66 Q62,62 50,68 Q38,62 26,66 Z' fill='" + col + "'/><line x1=50 y1=36 x2=50 y2=68 stroke='#000' stroke-width=1.5 opacity=0.4/>";
  if (c == "fist") s = "<rect x=40 y=46 width=20 height=28 rx=3 fill='" + col + "'/><rect x=38 y=30 width=24 height=20 rx=5 fill='" + col + "'/>";
  if (c == "dove") s = "<path d='M28,52 Q40,36 56,42 L72,32 L64,46 Q62,62 44,62 L36,70 L38,60 Q30,58 28,52 Z' fill='" + col + "'/>";
  return s;
}
function armsSvg(A, size) {
  A = A || {}; size = size || 100;
  var sh = SHIELDS[A.shield] || SHIELDS.heater, id = "cl" + Math.floor(Math.random() * 1e9);
  var f2 = A.field2 || "#FFFFFF", d = "";
  if (A.div == "pale") d = "<rect x=50 y=0 width=50 height=100 fill='" + f2 + "'/>";
  if (A.div == "fess") d = "<rect x=0 y=50 width=100 height=50 fill='" + f2 + "'/>";
  if (A.div == "quarterly") d = "<rect x=50 y=0 width=50 height=50 fill='" + f2 + "'/><rect x=0 y=50 width=50 height=50 fill='" + f2 + "'/>";
  if (A.div == "chevron") d = "<polygon points='0,90 50,45 100,90 100,100 0,100' fill='" + f2 + "'/>";
  if (A.div == "bend") d = "<polygon points='0,0 25,0 100,75 100,100 75,100 0,25' fill='" + f2 + "'/>";
  if (A.div == "cross") d = "<rect x=42 y=0 width=16 height=100 fill='" + f2 + "'/><rect x=0 y=40 width=100 height=16 fill='" + f2 + "'/>";
  if (A.div == "border") d = "<path d='" + sh + "' fill='none' stroke='" + f2 + "' stroke-width=14/>";
  var h = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 " + (A.motto ? 118 : 100) + "' width=" + size + " height=" + Math.round(size * (A.motto ? 1.18 : 1)) + " style='vertical-align:middle'>";
  h += "<defs><clipPath id='" + id + "'><path d='" + sh + "'/></clipPath></defs>";
  h += "<g clip-path='url(#" + id + ")'><rect x=0 y=0 width=100 height=100 fill='" + (A.field || "#17345B") + "'/>" + d + "</g>";
  h += chargeSvg(A.charge, A.chargeColor || "#C8A400");
  h += "<path d='" + sh + "' fill='none' stroke='#222' stroke-width=2.5/>";
  if (A.motto) h += "<path d='M8,104 L92,104 L88,111 L92,117 L8,117 L12,111 Z' fill='#F4E9C8' stroke='#8A6D2B' stroke-width=1/><text x=50 y=113.5 font-size=6.5 text-anchor='middle' font-family='Georgia,serif' fill='#3A2A10'>" + esc(String(A.mottoText || "").slice(0, 34)) + "</text>";
  return h + "</svg>";
}
var SKINS = ["#F6D7C3", "#E8B896", "#C68A5E", "#8D5A3B", "#5A3A26"];
var HAIRS = [["short", "Short"], ["side", "Side parting"], ["long", "Long"], ["bun", "Bun"], ["curly", "Curly"], ["bald", "Bald"], ["crop", "Buzz cut"]];
var EXTRAS = [["none", "Nothing"], ["tie", "Tie"], ["sash", "Sash"], ["medals", "Medals"], ["scarf", "Scarf"], ["collar", "Clerical collar"]];
var LEADER_JOBS = [["", "Career politician (no bonus)"], ["lawyer", "Lawyer (+2 legitimacy)"], ["teacher", "Teacher (students like you)"], ["soldier", "Soldier (+3 army loyalty)"], ["union", "Union organiser (unions like you)"],
  ["business", "Business owner (business likes you)"], ["doctor", "Doctor (slightly better health results)"], ["farmer", "Farmer (farmers like you)"], ["activist", "Activist (party members more enthusiastic)"],
  ["economist", "Economist (business and productivity)"], ["faith", "Faith leader (faith groups like you)"], ["journalist", "Journalist (no bonus, but great stories)"]];
function portraitSvg(L, size) {
  L = L || {}; size = size || 100;
  var skin = SKINS[L.skin === undefined ? 1 : L.skin] || SKINS[1], hc = L.hairColor || "#3B2A1A", suit = L.suit || "#1F2A44";
  var h = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' width=" + size + " height=" + Math.round(size * 1.2) + " style='vertical-align:middle;background:#DCE3EC;border:1px solid #999'>";
  if (L.hair == "long") h += "<path d='M24,48 Q22,92 34,100 L66,100 Q78,92 76,48 Z' fill='" + hc + "'/>";
  h += "<path d='M10,120 Q12,88 50,84 Q88,88 90,120 Z' fill='" + suit + "'/>";
  h += "<path d='M42,84 L50,100 L58,84 Z' fill='#FFFFFF'/>";
  if (L.extra == "tie") h += "<path d='M48,88 L52,88 L54,106 L50,112 L46,106 Z' fill='#A01E2E'/>";
  if (L.extra == "sash") h += "<path d='M20,96 L30,90 L84,118 L72,120 Z' fill='#C8A400'/>";
  if (L.extra == "medals") h += "<circle cx=30 cy=102 r=3.5 fill='#D4AF37'/><circle cx=38 cy=103 r=3.5 fill='#C0C0C0'/><rect x=28 y=96 width=12 height=3 fill='#B22222'/>";
  if (L.extra == "scarf") h += "<path d='M36,84 Q50,94 64,84 L66,90 Q50,100 34,90 Z' fill='#B22222'/><rect x=55 y=90 width=6 height=18 fill='#B22222'/>";
  if (L.extra == "collar") h += "<rect x=44 y=84 width=12 height=5 fill='#FFFFFF'/>";
  h += "<rect x=43 y=70 width=14 height=16 fill='" + skin + "'/>";
  h += "<ellipse cx=50 cy=52 rx=22 ry=26 fill='" + skin + "'/>";
  h += "<ellipse cx=28 cy=54 rx=3 ry=5 fill='" + skin + "'/><ellipse cx=72 cy=54 rx=3 ry=5 fill='" + skin + "'/>";
  var hs = L.hair || "short";
  if (hs == "short") h += "<path d='M28,46 Q28,24 50,24 Q72,24 72,46 Q66,34 50,34 Q34,34 28,46 Z' fill='" + hc + "'/>";
  if (hs == "side") h += "<path d='M28,48 Q26,22 52,24 Q74,26 72,46 Q60,32 40,36 Q32,40 28,48 Z' fill='" + hc + "'/>";
  if (hs == "long") h += "<path d='M26,52 Q24,22 50,22 Q76,22 74,52 Q70,34 50,32 Q30,34 26,52 Z' fill='" + hc + "'/>";
  if (hs == "bun") h += "<circle cx=50 cy=20 r=8 fill='" + hc + "'/><path d='M28,46 Q28,24 50,24 Q72,24 72,46 Q66,32 50,31 Q34,32 28,46 Z' fill='" + hc + "'/>";
  if (hs == "curly") for (var i = 0; i < 9; i++) h += "<circle cx=" + (30 + i * 5) + " cy=" + (30 - Math.sin(i / 8 * Math.PI) * 8) + " r=6 fill='" + hc + "'/>";
  if (hs == "crop") h += "<path d='M29,44 Q29,26 50,26 Q71,26 71,44 Q64,34 50,33 Q36,34 29,44 Z' fill='" + hc + "' opacity=0.6/>";
  h += "<ellipse cx=41 cy=52 rx=2.5 ry=3 fill='#222'/><ellipse cx=59 cy=52 rx=2.5 ry=3 fill='#222'/>";
  h += "<path d='M37,46 Q41,44 45,46' stroke='" + hc + "' stroke-width=1.6 fill='none'/><path d='M55,46 Q59,44 63,46' stroke='" + hc + "' stroke-width=1.6 fill='none'/>";
  h += "<path d='M50,54 L48,62 L52,62' stroke='#00000055' stroke-width=1.2 fill='none'/>";
  h += "<path d='M43,68 Q50,72 57,68' stroke='#7A3B2E' stroke-width=1.8 fill='none'/>";
  if (L.beard) h += "<path d='M30,58 Q32,80 50,80 Q68,80 70,58 Q66,72 50,74 Q34,72 30,58 Z' fill='" + hc + "'/>";
  if (L.glasses) h += "<circle cx=41 cy=52 r=6 fill='none' stroke='#222' stroke-width=1.5/><circle cx=59 cy=52 r=6 fill='none' stroke='#222' stroke-width=1.5/><line x1=47 y1=52 x2=53 y2=52 stroke='#222' stroke-width=1.5/>";
  return h + "</svg>";
}
