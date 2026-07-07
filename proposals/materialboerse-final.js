/* =============================================================================
   Materialbörse — interaktiver Prototyp (Flotte & Logistik)
   DAS KARTELL / Profit Basetool · fiktive Beispieldaten
   Eine Datenbasis + Logik, drei Darstellungen (Tabelle / Karten / Master-Detail).
   ============================================================================= */
(function () {
  "use strict";

  var ME = "Lenoro"; // aktueller Nutzer

  // -- Angebote (Materialposten auf der Börse) --------------------------------
  // qual: 0–1000 · menge: SCU · hours: vor wie vielen Stunden freigegeben
  // mine: eigenes Angebot (dann names = sichtbare Interessenten) ·
  // sonst: interess = Zahl (Namen bleiben verborgen)
  var OFFERS = [
    { id:"o1", mat:"Quantanium", kat:"High Value", owner:"Skorpi", sq:"IRI", foreign:false,
      qual:920, menge:512, hours:2, interess:4,
      remark:"Frisch raffiniert, **Qualität 920**. Tausche gegen **Bexalite** oder **aUEC** zum UEX-Kurs. Menge teilbar ab *128 SCU*." },
    { id:"o2", mat:"Bexalite", kat:"High Value", owner:"Kessler", sq:"IRI", foreign:false,
      qual:780, menge:96, hours:26, interess:1,
      remark:"Nur **Komplettabnahme** (96 SCU). Suche im Gegenzug refined **Laranite** ab Qualität 600." },
    { id:"o3", mat:"Laranite", kat:"Metalle", owner:"EndRageMusic", sq:"AGN", foreign:true,
      qual:645, menge:1240, hours:70, interess:0,
      remark:"Großposten. Biete gegen **Titanium** (≥ 700) oder **Agricium**. Kein aUEC." },
    { id:"o4", mat:"Agricium", kat:"Metalle", owner:"Lenoro", sq:"IRI", foreign:false,
      qual:796, menge:340, hours:5, mine:true, names:["Mara","Hex","P6"],
      remark:"## Tauschangebot Agricium (Qualität 796)\n\nIch gebe **340 SCU Agricium** ab und suche vorrangig:\n\n- **Titanium** (Qualität ≥ 650)\n- **Laranite** oder **Hephaestanite**\n- Alternativ **aUEC** zum aktuellen UEX-Kurs\n\nTeilmengen ab *64 SCU* möglich. Übergabe im System **Stanton** oder **Pyro** — Ort besprechen wir direkt.\n\n> Kein Verkauf an Nicht-Kartell-Mitglieder ohne Rücksprache." },
    { id:"o5", mat:"Titanium", kat:"Metalle", owner:"P6", sq:"IRI", foreign:false,
      qual:540, menge:880, hours:150, interess:2,
      remark:"Solides Mittelfeld-Titanium. Tausche gegen **Aluminum** oder **Gas** (Hydrogen/Chlorine)." },
    { id:"o6", mat:"Aluminum", kat:"Metalle", owner:"Nova_7", sq:"IRI", foreign:false,
      qual:910, menge:2100, hours:12, interess:0,
      remark:"Großposten, **teilbar**. Suche **Quantanium** oder High-Value-Material — größere Mengen bevorzugt." },
    { id:"o7", mat:"Aphorite", kat:"Edelgestein", owner:"GremlinTausch", sq:"SK-VÖL", foreign:true,
      qual:615, menge:60, hours:92, interess:1,
      remark:"Aphorite aus letztem Salvage. Tausch gegen **Beryl** oder **Dolivine** willkommen." },
    { id:"o8", mat:"Hephaestanite", kat:"Metalle", owner:"Ferro", sq:"IRI", foreign:false,
      qual:700, menge:430, hours:30, interess:0,
      remark:"Genau **700er** Qualität. Suche **Agricium** oder **Titanium** im 1:1-Tausch nach Menge." },
    { id:"o9", mat:"Quantanium", kat:"High Value", owner:"Lenoro", sq:"IRI", foreign:false,
      qual:610, menge:128, hours:22, mine:true, names:["Yuki"],
      remark:"Rest aus dem letzten Run (Qualität 610). Tausche gegen **refined Metalle** — Laranite/Agricium bevorzugt." },
    { id:"o10", mat:"Beryl", kat:"Edelgestein", owner:"DocRebound", sq:"IRI", foreign:false,
      qual:835, menge:210, hours:8, interess:5,
      remark:"Hochwertiges **Beryl (835)**. Suche High-Value oder **Bexalite**. Schnelle Übergabe möglich." },
    { id:"o11", mat:"Tungsten", kat:"Metalle", owner:"Yuki", sq:"IRI", foreign:false,
      qual:480, menge:1560, hours:168, interess:0,
      remark:"Günstig abzugeben, große Menge. Tausche gegen so ziemlich alles **Refined** — macht Angebote." },
    { id:"o12", mat:"Corundum", kat:"Metalle", owner:"Mara", sq:"IRI", foreign:false,
      qual:720, menge:640, hours:48, interess:2,
      remark:"Tausche gegen **Aluminum** oder **Laranite**. Auch Teilmengen ab *128 SCU*." }
  ];

  // Materialliste für das "Material anbieten"-Formular
  var MAT_LIST = ["Quantanium","Bexalite","Laranite","Agricium","Titanium","Aluminum",
                  "Hephaestanite","Aphorite","Beryl","Tungsten","Corundum","Dolivine","Quartz"];

  // -- globaler Zustand -------------------------------------------------------
  var myInterests = new Set(); // Angebote, in die ich mich als Interessent eingetragen habe
  var withdrawn = new Set();   // eigene Angebote, die ich von der Börse genommen habe
  var VARIANTS = ["md"]; // Master-Detail als festgelegtes Layout (V1 Tabelle / V2 Karten entfernt)
  var state = {};
  VARIANTS.forEach(function (v) {
    state[v] = { tab:"alle", q:"", minQual:0, minMenge:0, sort:"qual", onlyNoInt:false,
                 open:new Set(), rmk:new Set(), sel:null };
  });

  // -- Helfer -----------------------------------------------------------------
  function fmt(n) { return n.toLocaleString("de-DE"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[c]; }); }
  function ago(h) { if (h < 24) return "vor " + h + " Std"; var d = Math.round(h/24); return "vor " + d + (d===1?" Tag":" Tagen"); }
  function icon(id) { return '<svg class="krt-icon"><use href="#i-' + id + '"/></svg>'; }
  function offer(id) { for (var i=0;i<OFFERS.length;i++) if (OFFERS[i].id===id) return OFFERS[i]; return null; }
  function intCount(o) { return o.mine ? (o.names?o.names.length:0) : (o.interess + (myInterests.has(o.id)?1:0)); }

  // minimaler, sicherer Markdown-Renderer (##/### · **fett** · *kursiv* · - Liste · > Zitat · `code` · [link](url))
  function inline(t) {
    return t
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }
  function md(src) {
    var lines = esc(src).split(/\r?\n/), out = [], i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      var h = line.match(/^\s*(#{2,3})\s+(.*)$/);
      if (h) { out.push("<h3>" + inline(h[2]) + "</h3>"); i++; continue; }
      if (/^\s*>\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(inline(lines[i].replace(/^\s*>\s?/, ""))); i++; }
        out.push("<blockquote>" + q.join("<br>") + "</blockquote>"); continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>"); i++; }
        out.push("<ul>" + items.join("") + "</ul>"); continue;
      }
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(#{2,3}\s|>|[-*]\s)/.test(lines[i])) { para.push(inline(lines[i])); i++; }
      out.push("<p>" + para.join(" ") + "</p>");
    }
    return out.join("");
  }

  function badge(o) {
    return '<span class="squadron-badge ' + (o.foreign ? "squadron-badge-foreign" : "") + '">' + esc(o.sq) + "</span>";
  }
  function gauge(qual, right, showMax) {
    return '<span class="qual ' + (right ? "right" : "") + '">'
      + '<span class="qv">' + qual + (showMax ? '<span class="qmax"> / 1000</span>' : "") + "</span>"
      + '<span class="gt"><i style="width:' + (qual/10) + '%"></i></span></span>';
  }
  function amt(menge) { return '<span class="amt">' + fmt(menge) + '<span class="u">SCU</span></span>'; }

  function intChip(o) {
    var c = intCount(o), plural = c === 1 ? "" : "en";
    if (o.mine) return '<span class="chip ' + (c>0?"chip--primary":"chip--muted") + '">' + icon("users") + " " + c + " Interessent" + plural + "</span>";
    if (myInterests.has(o.id)) return '<span class="chip chip--primary">' + icon("check") + " " + c + " · du dabei</span>";
    return '<span class="chip chip--muted">' + icon("users") + " " + (c===0 ? "Keine Interessenten" : c + " Interessent" + plural) + "</span>";
  }
  function miniInt(o) {
    var c = intCount(o), mine = myInterests.has(o.id) || o.mine;
    return '<span class="int ' + (mine && c>0 ? "text-primary" : "text-muted") + '" title="' + c + ' Interessent(en)">' + icon("users") + " " + c + "</span>";
  }

  // eine einzelne Zeilen-Aktion (kompakt) — für Tabellenzeile & Karten-Fuß
  function primaryAction(o) {
    if (o.mine) return '<button class="btn btn-quiet-danger btn-xs" data-action="withdraw" data-id="' + o.id + '">Angebot deaktivieren</button>';
    if (myInterests.has(o.id)) return '<button class="btn btn-ghost btn-xs" data-action="interest" data-id="' + o.id + '" title="Interesse zurückziehen">' + icon("check") + " Zurückziehen</button>";
    return '<button class="btn btn-outline btn-xs" data-action="interest" data-id="' + o.id + '">Interesse anmelden</button>';
  }
  // volle Aktionen für die Detailansicht
  function actionsFull(o) {
    if (o.mine) return '<button class="btn btn-ghost btn-xs" data-action="edit" data-id="' + o.id + '">' + icon("edit") + ' Bemerkung bearbeiten</button>'
      + '<button class="btn btn-quiet-danger btn-xs" data-action="withdraw" data-id="' + o.id + '">Angebot deaktivieren</button>';
    if (myInterests.has(o.id)) return '<button class="btn btn-ghost btn-xs" data-action="interest" data-id="' + o.id + '">' + icon("check") + ' Interesse angemeldet — zurückziehen</button>';
    return '<button class="btn btn-outline btn-xs" data-action="interest" data-id="' + o.id + '">Interesse anmelden</button>';
  }

  function remarkBlock(o, vid, allowClamp) {
    var long = o.remark.length > 140, open = state[vid].rmk.has(o.id), clamp = allowClamp && long && !open;
    var html = '<div class="remark ' + (clamp ? "clamp" : "") + '"><div class="md">' + md(o.remark) + "</div></div>";
    if (allowClamp && long) html += '<button class="more-btn ' + (open?"open":"") + '" data-action="remark" data-id="' + o.id + '">' + icon("chevron-down") + " " + (open ? "Weniger" : "Mehr anzeigen") + "</button>";
    return html;
  }
  function anonNote() {
    return '<p class="anon-note">' + icon("shield") + " Standort &amp; Übergabeort werden bewusst nicht angezeigt — das verhandelt ihr direkt.</p>";
  }
  function interessentenBlock(o) {
    var c = intCount(o);
    if (o.mine) {
      var names = (o.names||[]).map(function (n) { return '<span class="chip">' + icon("users") + " " + esc(n) + "</span>"; }).join("");
      return '<div><p class="dt-label">Interessenten (' + c + ")</p>"
        + (c ? '<div class="int-names">' + names + "</div>" : '<span class="text-muted" style="font-size:12.5px">Noch keine Interessenten.</span>')
        + '<p class="owner-note"><b>Nur du</b> siehst diese Namen (dein Angebot) — nimm mit ihnen direkt die Verhandlung auf.</p></div>';
    }
    return '<div><p class="dt-label">Interessenten</p>' + intChip(o)
      + '<p class="owner-note">Die Namen sieht nur der Anbieter.' + (myInterests.has(o.id) ? " <b>Du bist eingetragen</b> — der Anbieter kann dich kontaktieren." : "") + "</p></div>";
  }
  function factsKv(o) {
    return '<div class="kvmini">'
      + '<span class="k">Qualität</span><span class="v">' + o.qual + '</span>'
      + '<span class="k">Menge</span><span class="v">' + fmt(o.menge) + ' SCU</span>'
      + '<span class="k">Freigegeben</span><span class="v" style="text-transform:none">' + ago(o.hours) + "</span></div>";
  }

  // -- Filter + Sortierung ----------------------------------------------------
  function filterSort(vid) {
    var s = state[vid];
    var list = OFFERS.filter(function (o) { return !withdrawn.has(o.id); });
    if (s.tab === "mein") list = list.filter(function (o) { return o.mine; });
    if (s.q) { var q = s.q.toLowerCase(); list = list.filter(function (o) { return o.mat.toLowerCase().indexOf(q) >= 0 || o.owner.toLowerCase().indexOf(q) >= 0; }); }
    if (s.minQual > 0) list = list.filter(function (o) { return o.qual >= s.minQual; });
    if (s.minMenge > 0) list = list.filter(function (o) { return o.menge >= s.minMenge; });
    list = list.slice();
    if (s.sort === "qual") list.sort(function (a,b) { return b.qual - a.qual; });
    else if (s.sort === "menge") list.sort(function (a,b) { return b.menge - a.menge; });
    else if (s.sort === "neu") list.sort(function (a,b) { return a.hours - b.hours; });
    else if (s.sort === "mat") list.sort(function (a,b) { return a.mat.localeCompare(b.mat, "de"); });
    return list;
  }

  // -- Toolbar ----------------------------------------------------------------
  function opt(v, l, cur) { return '<option value="' + v + '"' + (v===cur?" selected":"") + ">" + l + "</option>"; }
  function buildToolbar(vid) {
    var s = state[vid];
    var cAll = OFFERS.filter(function (o) { return !withdrawn.has(o.id); }).length;
    var cMine = OFFERS.filter(function (o) { return o.mine && !withdrawn.has(o.id); }).length;
    return ''
      + '<div class="mb-tabrow">'
      +   '<div class="tab-nav" role="tablist">'
      +     '<button class="tab ' + (s.tab==="alle"?"active":"") + '" data-action="tab" data-tab="alle" role="tab" aria-selected="' + (s.tab==="alle") + '">Alle Angebote <span class="tab-count">' + cAll + "</span></button>"
      +     '<button class="tab ' + (s.tab==="mein"?"active":"") + '" data-action="tab" data-tab="mein" role="tab" aria-selected="' + (s.tab==="mein") + '">Meine Angebote <span class="tab-count">' + cMine + "</span></button>"
      +   "</div>"
      +   '<div class="mb-search">' + icon("search") + '<input type="search" data-role="search" value="' + esc(s.q) + '" placeholder="Material oder Spieler …" aria-label="Suche"></div>'
      + "</div>"
      + '<div class="mb-filters">'
      +   '<div class="mb-filt"><span class="fl">Min. Qualität</span><input type="range" min="0" max="1000" step="10" value="' + s.minQual + '" data-role="minqual" aria-label="Mindestqualität"><span class="fv" data-fv>' + (s.minQual? s.minQual + '<small> / 1000</small>' : "–") + "</span></div>"
      +   '<div class="mb-filt"><span class="fl">Min. Menge</span><input type="number" min="0" step="10" value="' + (s.minMenge||"") + '" data-role="minmenge" placeholder="0" aria-label="Mindestmenge"><span class="fl" style="color:var(--color-gray-2)">SCU</span></div>'
      +   '<div class="mb-filt"><span class="fl">Sortieren</span><select class="chip-select" data-role="sort" aria-label="Sortierung">' + opt("qual","Qualität ↓",s.sort) + opt("menge","Menge ↓",s.sort) + opt("mat","Material A–Z",s.sort) + opt("neu","Neueste zuerst",s.sort) + "</select></div>"
      + "</div>"
      + '<div class="mb-body"><div class="mb-list"></div></div>';
  }

  function emptyState(vid) {
    return '<div class="empty-state"><div class="empty-title">Keine Angebote</div>'
      + '<p class="empty-text">Für diese Filter gibt es gerade keine freigegebenen Materialien.</p>'
      + '<button class="btn btn-ghost btn-xs" data-action="reset">Filter zurücksetzen</button></div>';
  }

  // -- V1: Tabelle ------------------------------------------------------------
  function renderTable(list, vid) {
    var head = '<div class="mb-row mb-head">'
      + '<div class="mb-c">Material</div><div class="mb-c">Anbieter</div>'
      + '<div class="mb-c num">Qualität</div><div class="mb-c num">Menge</div>'
      + '<div class="mb-c">Interessenten</div><div class="mb-c" style="text-align:right">Aktion</div></div>';
    var rows = list.map(function (o) {
      var isOpen = state[vid].open.has(o.id);
      var row = '<div class="mb-drow ' + (o.mine?"mine ":"") + (isOpen?"open":"") + '" data-id="' + o.id + '" role="button" tabindex="0" aria-expanded="' + isOpen + '">'
        + '<div class="mb-c"><span class="mb-mat ' + (isOpen?"open":"") + '"><span class="chev">▶</span><span><span class="mn">' + esc(o.mat) + '</span><span class="mk">' + esc(o.kat) + "</span></span></span></div>"
        + '<div class="mb-c"><span class="mb-off">' + badge(o) + '<span class="on">' + esc(o.owner) + "</span></span></div>"
        + '<div class="mb-c num">' + gauge(o.qual, true, false) + "</div>"
        + '<div class="mb-c num">' + amt(o.menge) + "</div>"
        + '<div class="mb-c">' + intChip(o) + "</div>"
        + '<div class="mb-c act">' + (o.mine ? '<span class="chip chip--primary">Deins</span>' : primaryAction(o)) + "</div>"
      + "</div>";
      if (isOpen) {
        row += '<div class="mb-detail"><div class="dt-grid">'
          + '<div><p class="dt-label">Bemerkung</p>' + remarkBlock(o, vid, true) + anonNote() + "</div>"
          + '<div class="dt-side">' + factsKv(o) + interessentenBlock(o) + '<div class="dt-actions">' + actionsFull(o) + "</div></div>"
          + "</div></div>";
      }
      return row;
    }).join("");
    return '<div class="mb-table">' + head + rows + "</div>";
  }

  // -- V2: Karten -------------------------------------------------------------
  function renderCard(o, i, list) { return renderCardV(o, "cards"); }
  function renderCardV(o, vid) {
    return '<div class="mcard ' + (o.mine?"mine":"") + '">'
      + '<div class="mc-head"><div class="mc-title"><span class="mn">' + esc(o.mat) + '</span><span class="mk">' + esc(o.kat) + '</span></div>'
      +   '<div style="text-align:right;flex:none">' + badge(o) + '<div class="on" style="font-size:12px;color:var(--color-gray-1);margin-top:4px">' + esc(o.owner) + "</div></div></div>"
      + '<div class="mc-body">'
      +   '<div class="mc-stats">' + gauge(o.qual, false, true) + '<div class="amt" style="font-size:17px">' + fmt(o.menge) + '<span class="u">SCU</span></div></div>'
      +   '<div><p class="dt-label">Bemerkung</p>' + remarkBlock(o, vid, true) + "</div>"
      + "</div>"
      + '<div class="mc-foot">' + intChip(o) + primaryAction(o) + "</div>"
    + "</div>";
  }

  // -- V3: Master-Detail ------------------------------------------------------
  function renderMD(list, vid) {
    var s = state[vid];
    if (!s.sel || !list.some(function (o) { return o.id === s.sel; })) s.sel = list.length ? list[0].id : null;
    var rows = list.map(function (o) {
      return '<button class="mrow ' + (o.mine?"mine ":"") + (o.id===s.sel?"active":"") + '" data-action="select" data-id="' + o.id + '">'
        + '<span class="mr-main"><span class="mr-mat">' + esc(o.mat) + "</span>"
        + '<span class="mr-sub">' + badge(o) + '<span class="on">' + esc(o.owner) + "</span></span>"
        + '<span class="mr-amt">Q ' + o.qual + " · " + fmt(o.menge) + " SCU · " + ago(o.hours) + "</span></span>"
        + '<span class="mr-int">' + miniInt(o) + "</span></button>";
    }).join("");
    var sel = s.sel ? offer(s.sel) : null;
    var pane = sel ? mdDetail(sel, vid)
      : '<div class="dp-body"><div class="empty-state" style="border:none"><div class="empty-title">Kein Angebot gewählt</div><p class="empty-text">Wähle links einen Materialposten.</p></div></div>';
    return '<div class="mb-md ' + (sel?"has-sel":"") + '"><div class="mb-mlist">' + rows + '</div><div class="mb-detailpane">' + pane + "</div></div>";
  }
  function mdDetail(o, vid) {
    return '<div class="dp-head"><div class="dp-title"><h4>' + esc(o.mat) + '</h4><span class="mk">von ' + esc(o.owner) + " " + badge(o) + "</span>" + (o.mine ? '<div style="margin-top:7px"><span class="chip chip--primary">Dein Angebot</span></div>' : "") + "</div>"
      + '<button class="btn btn-ghost btn-xs dp-back" data-action="deselect">' + icon("chevron-left") + " Liste</button></div>"
      + '<div class="dp-facts">' + factsKv(o) + "</div>"
      + '<div class="dp-body"><div class="dt-grid">'
      +   '<div><p class="dt-label">Bemerkung</p>' + remarkBlock(o, vid, false) + anonNote() + "</div>"
      +   '<div class="dt-side">' + interessentenBlock(o) + '<div class="dt-actions">' + actionsFull(o) + "</div></div>"
      + "</div></div>";
  }

  // -- Render-Dispatch --------------------------------------------------------
  function renderList(vid) {
    var list = filterSort(vid);
    var cont = document.querySelector('[data-variant="' + vid + '"] .mb-list');
    if (!cont) return;
    if (!list.length) { cont.innerHTML = emptyState(vid); return; }
    if (vid === "table") cont.innerHTML = renderTable(list, vid);
    else if (vid === "cards") cont.innerHTML = '<div class="mb-cards">' + list.map(function (o) { return renderCardV(o, vid); }).join("") + "</div>";
    else cont.innerHTML = renderMD(list, vid);
  }
  function renderAll() { VARIANTS.forEach(renderList); syncTabCounts(); }
  function syncTabCounts() {
    var cAll = OFFERS.filter(function (o) { return !withdrawn.has(o.id); }).length;
    var cMine = OFFERS.filter(function (o) { return o.mine && !withdrawn.has(o.id); }).length;
    VARIANTS.forEach(function (vid) {
      var tabs = document.querySelectorAll('[data-variant="' + vid + '"] .tab-count');
      if (tabs[0]) tabs[0].textContent = cAll;
      if (tabs[1]) tabs[1].textContent = cMine;
    });
  }

  // -- Toast ------------------------------------------------------------------
  function toast(title, msg) {
    var host = document.getElementById("toastHost");
    var el = document.createElement("div");
    el.className = "notification-toast";
    el.innerHTML = "<h4>" + esc(title) + "</h4><p>" + msg + "</p>";
    host.appendChild(el);
    setTimeout(function () { el.style.transition = "opacity .4s"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 400); }, 3400);
  }

  // -- Freigabe-/Bearbeiten-Modal --------------------------------------------
  var modalCtx = null;
  function openFreigabe(ctx) {
    modalCtx = ctx; // {mode:'new'|'lager'|'edit', mat?, qual?, menge?, offerId?, checkbox?}
    var o = ctx.offerId ? offer(ctx.offerId) : null;
    var fixedMat = ctx.mode === "lager" || ctx.mode === "edit";
    var mat = ctx.mat || (o && o.mat) || MAT_LIST[0];
    var qual = ctx.qual != null ? ctx.qual : (o ? o.qual : 700);
    var menge = ctx.menge != null ? ctx.menge : (o ? o.menge : 100);
    var remark = o ? o.remark : "";
    var title = ctx.mode === "edit" ? "Bemerkung bearbeiten" : "Material für die Börse freigeben";
    var cta = ctx.mode === "edit" ? "Speichern" : "Freigeben";

    var matField = fixedMat
      ? '<span class="data-value" style="display:inline-block">' + esc(mat) + "</span>"
      : '<select data-f="mat">' + MAT_LIST.map(function (m) { return '<option' + (m===mat?" selected":"") + ">" + m + "</option>"; }).join("") + "</select>";

    var contextStrip = ''
      + '<div class="fg-context">'
      +   '<div class="fg-fact"><span class="k">Material</span><span class="v">' + esc(mat) + '</span></div>'
      +   '<div class="fg-fact"><span class="k">Qualität</span><span class="v">' + qual + '</span></div>'
      +   '<div class="fg-fact"><span class="k">Menge</span><span class="v">' + fmt(menge) + ' SCU</span></div>'
      + '</div>';
    var fieldsGrid = ''
      + '<div class="fg-fields">'
      +   '<div><label class="form-label-sm">Material</label>' + matField + '</div>'
      +   '<div><label class="form-label-sm">Menge (SCU)</label><input type="number" min="1" step="1" data-f="menge" value="' + menge + '"></div>'
      +   '<div><label class="form-label-sm">Qualität (0–1000)</label><input type="number" min="0" max="1000" step="1" data-f="qual" value="' + qual + '"></div>'
      + '</div>';
    var body = (fixedMat ? contextStrip : fieldsGrid)
      + '<label class="form-label-sm">Bemerkung <span style="color:var(--color-gray-2);font-weight:400;text-transform:none">— was suchst du im Gegenzug? (Markdown, max. 20.000 Zeichen)</span></label>'
      + '<textarea data-f="remark" rows="8" maxlength="20000" placeholder="z. B. Tausche gegen **Titanium** ≥ 700 oder aUEC …&#10;- teilbar ab 64 SCU&#10;- Übergabe verhandelbar">' + esc(remark) + "</textarea>"
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px;color:var(--color-gray-2)">'
      +   '<span>' + icon("shield") + ' Standort/Übergabeort bleiben privat.</span><span data-charcount>' + fmt(remark.length) + " / 20.000</span></div>";

    var overlay = document.createElement("div");
    overlay.className = "krt-modal-overlay";
    overlay.innerHTML = '<div class="krt-modal" role="dialog" aria-modal="true" aria-label="' + title + '" style="max-width:600px">'
      + '<div class="krt-modal-head"><h2>' + title + '</h2><button class="btn btn-ghost btn-icon" data-action="modal-close" aria-label="Schließen">' + icon("close") + "</button></div>"
      + '<div class="krt-modal-body">' + body + "</div>"
      + '<div class="krt-modal-foot"><button class="btn btn-ghost" data-action="modal-close">Abbrechen</button>'
      +   '<button class="btn btn--cta" data-action="freigabe-submit">' + icon("check") + " " + cta + "</button></div></div>";
    document.getElementById("modalHost").innerHTML = "";
    document.getElementById("modalHost").appendChild(overlay);
    var ta = overlay.querySelector('[data-f="remark"]');
    if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
  }
  function closeModal(cancelled) {
    // Beim Abbrechen einer Lager-Freigabe die Checkbox zurücksetzen
    if (cancelled && modalCtx && modalCtx.mode === "lager" && modalCtx.checkbox) modalCtx.checkbox.checked = false;
    document.getElementById("modalHost").innerHTML = "";
    modalCtx = null;
  }
  function submitFreigabe() {
    var m = document.querySelector("#modalHost .krt-modal");
    if (!m || !modalCtx) return;
    var get = function (f, fb) { var el = m.querySelector('[data-f="' + f + '"]'); return el ? el.value : (fb != null ? fb : ""); };
    var remark = get("remark");
    if (modalCtx.mode === "edit") {
      var oe = offer(modalCtx.offerId); if (oe) oe.remark = remark;
      closeModal(false); renderAll(); toast("Gespeichert", "Die Bemerkung deines Angebots wurde aktualisiert.");
      return;
    }
    var mat = modalCtx.mat || get("mat");
    var qual = Math.max(0, Math.min(1000, parseInt(get("qual", modalCtx.qual), 10) || 0));
    var menge = Math.max(1, parseInt(get("menge", modalCtx.menge), 10) || 1);
    var id = modalCtx.linkedId || ("n" + Date.now());
    withdrawn.delete(id);
    if (!offer(id)) {
      OFFERS.unshift({ id:id, mat:mat, kat:catOf(mat), owner:ME, sq:"IRI", foreign:false,
        qual:qual, menge:menge, hours:0, mine:true, names:[], remark:remark || "_Keine Bemerkung._" });
    } else { var ox = offer(id); ox.remark = remark || ox.remark; withdrawn.delete(id); }
    // Lager-Checkbox mit dem (evtl. neuen) Angebot verknüpfen, damit späteres Abwählen es wieder entfernt
    if (modalCtx.checkbox && !modalCtx.linkedId) modalCtx.checkbox.setAttribute("data-linked-id", id);
    if (modalCtx.statusCell) setLagerStatus(modalCtx.statusCell, true);
    closeModal(false); renderAll();
    toast("Auf die Börse gestellt", esc(mat) + " (" + fmt(menge) + " SCU, Q " + qual + ") ist jetzt für alle sichtbar.");
  }
  function catOf(mat) {
    var o = null; for (var i=0;i<OFFERS.length;i++) if (OFFERS[i].mat===mat) { o = OFFERS[i]; break; }
    if (o) return o.kat;
    if (["Quantanium","Bexalite"].indexOf(mat) >= 0) return "High Value";
    if (["Aphorite","Beryl","Dolivine","Quartz"].indexOf(mat) >= 0) return "Edelgestein";
    return "Metalle";
  }
  function setLagerStatus(cell, on) {
    cell.innerHTML = on ? '<span class="chip chip--primary">Auf Börse</span>' : '<span class="text-muted" style="font-size:11px">privat</span>';
  }

  // -- Events -----------------------------------------------------------------
  function variantOf(el) { var s = el.closest("[data-variant]"); return s ? s.getAttribute("data-variant") : null; }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-action]");
    if (a) {
      var act = a.getAttribute("data-action");
      var vid = variantOf(a);
      var id = a.getAttribute("data-id");
      if (act === "tab") { state[vid].tab = a.getAttribute("data-tab"); setActiveTab(vid, a); renderList(vid); return; }
      if (act === "remark") { toggleSet(state[vid].rmk, id); renderList(vid); return; }
      if (act === "select") { state[vid].sel = id; renderList(vid); return; }
      if (act === "deselect") { state[vid].sel = null; renderList(vid); return; }
      if (act === "reset") { resetFilters(vid); return; }
      if (act === "interest") { toggleInterest(id); return; }
      if (act === "withdraw") { doWithdraw(id); return; }
      if (act === "edit") { openFreigabe({ mode:"edit", offerId:id }); return; }
      if (act === "open-freigabe") { openFreigabe({ mode:"new" }); return; }
      if (act === "modal-close") { closeModal(true); return; }
      if (act === "freigabe-submit") { submitFreigabe(); return; }
      return;
    }
    // Klick auf eine Tabellenzeile (nicht auf einen Button) → Detail auf/zu
    var row = e.target.closest(".mb-drow");
    if (row) { var v = variantOf(row); toggleSet(state[v].open, row.getAttribute("data-id")); renderList(v); }
  });

  // Tastatur: Enter/Space auf Tabellenzeile
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.querySelector("#modalHost .krt-modal")) { closeModal(true); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("mb-drow")) {
      e.preventDefault(); var v = variantOf(e.target); toggleSet(state[v].open, e.target.getAttribute("data-id")); renderList(v);
    }
  });

  document.addEventListener("input", function (e) {
    var el = e.target, role = el.getAttribute("data-role");
    if (role === "search") { var v = variantOf(el); state[v].q = el.value; renderList(v); return; }
    if (role === "minqual") { var v2 = variantOf(el); state[v2].minQual = parseInt(el.value, 10) || 0;
      var fv = el.parentNode.querySelector("[data-fv]"); if (fv) fv.innerHTML = state[v2].minQual ? state[v2].minQual + "<small> / 1000</small>" : "–"; renderList(v2); return; }
    if (role === "minmenge") { var v3 = variantOf(el); state[v3].minMenge = parseInt(el.value, 10) || 0; renderList(v3); return; }
    if (el.getAttribute("data-f") === "remark") { var cc = document.querySelector("#modalHost [data-charcount]"); if (cc) cc.textContent = fmt(el.value.length) + " / 20.000"; return; }
  });

  document.addEventListener("change", function (e) {
    var el = e.target, role = el.getAttribute("data-role");
    if (role === "sort") { var v = variantOf(el); state[v].sort = el.value; renderList(v); return; }
    if (el.getAttribute("data-action") === "freigabe-toggle") {
      var cell = document.querySelector('[data-status-for="' + el.getAttribute("data-mat") + '"]');
      if (el.checked) {
        openFreigabe({ mode:"lager", mat:el.getAttribute("data-mat"), qual:parseInt(el.getAttribute("data-qual"),10),
          menge:parseInt(el.getAttribute("data-menge"),10), linkedId:el.getAttribute("data-linked-id") || null,
          statusCell:cell, checkbox:el });
      } else {
        var lid = el.getAttribute("data-linked-id");
        if (lid && offer(lid)) withdrawn.add(lid);
        if (cell) setLagerStatus(cell, false);
        renderAll();
        toast("Von der Börse genommen", el.getAttribute("data-mat") + " ist wieder privat.");
      }
    }
  });

  function setActiveTab(vid, btn) {
    var tabs = document.querySelectorAll('[data-variant="' + vid + '"] .tab');
    tabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
  }
  function toggleSet(set, id) { if (set.has(id)) set.delete(id); else set.add(id); }
  function resetFilters(vid) {
    var s = state[vid]; s.q = ""; s.minQual = 0; s.minMenge = 0; s.tab = "alle";
    // Toolbar-Controls dieser Variante neu bespielen
    var scope = document.querySelector('[data-variant="' + vid + '"]');
    scope.querySelector('[data-role="search"]').value = "";
    scope.querySelector('[data-role="minqual"]').value = 0;
    var fv = scope.querySelector("[data-fv]"); if (fv) fv.innerHTML = "–";
    scope.querySelector('[data-role="minmenge"]').value = "";
    scope.querySelectorAll(".tab").forEach(function (t, i) { t.classList.toggle("active", i === 0); t.setAttribute("aria-selected", i === 0); });
    renderList(vid);
  }
  function toggleInterest(id) {
    var o = offer(id); if (!o || o.mine) return;
    var added = !myInterests.has(id);
    if (added) myInterests.add(id); else myInterests.delete(id);
    renderAll();
    if (added) toast("Interesse angemeldet", "Der Anbieter von <b style=\"color:var(--color-primary)\">" + esc(o.mat) + "</b> sieht dich jetzt als Interessent und kann die Verhandlung aufnehmen.");
    else toast("Interesse zurückgezogen", "Du wurdest aus den Interessenten für " + esc(o.mat) + " entfernt.");
  }
  function doWithdraw(id) {
    var o = offer(id); if (!o) return;
    withdrawn.add(id);
    // ggf. verknüpfte Lager-Checkbox zurücksetzen
    var cb = document.querySelector('[data-action="freigabe-toggle"][data-linked-id="' + id + '"]');
    if (cb) { cb.checked = false; var cell = document.querySelector('[data-status-for="' + cb.getAttribute("data-mat") + '"]'); if (cell) setLagerStatus(cell, false); }
    renderAll();
    toast("Angebot deaktiviert", esc(o.mat) + " ist nicht mehr öffentlich sichtbar.");
  }

  // -- Init -------------------------------------------------------------------
  function init() {
    document.querySelectorAll(".screen[data-variant] .mb-app").forEach(function (app) {
      var vid = app.closest("[data-variant]").getAttribute("data-variant");
      app.innerHTML = buildToolbar(vid);
    });
    renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
