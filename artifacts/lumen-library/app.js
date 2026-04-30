/* ============================================================
   LUMEN — vanilla JS app
   Static site with hash routing.

   Routes:
     #/                      → home (library with side widgets)
     #/book/:id              → book detail
     #/book/:id/read         → read mode
     #/book/:id/listen       → listen mode (browser SpeechSynthesis)
   ============================================================ */

const CATEGORIES = ["All", "Philosophy", "Self-Help", "Psychology", "Business", "Science", "Spirituality"];

const state = {
  books: [],
  loaded: false,
  search: "",
  category: "All",
  listen: null,
};

const app = document.getElementById("app");

/* ---------- Static page chrome (always present) ---------- */
function ensureChrome() {
  if (document.getElementById("page-chrome")) return;
  // Background floating stickers + cursor sparkle + lace strips wrap the app shell.
  const chrome = document.createElement("div");
  chrome.id = "page-chrome";
  chrome.innerHTML = `
    <div class="bg-stickers" aria-hidden="true">
      <span class="stk">♡</span>
      <span class="stk">✿</span>
      <span class="stk">★</span>
      <span class="stk">♡</span>
      <span class="stk">✦</span>
      <span class="stk">❀</span>
    </div>
  `;
  document.body.prepend(chrome);
  initCursorSparkle();
}

/* ---------- Cursor sparkle trail ---------- */
function initCursorSparkle() {
  const glyphs = ["✦", "✿", "♡", "★"];
  let last = 0;
  document.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - last < 70) return;
    last = now;
    const span = document.createElement("span");
    span.className = "cursor-spark";
    span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    span.style.left = e.clientX + "px";
    span.style.top  = e.clientY + "px";
    span.style.color = ["#e8729a", "#b08bd6", "#d99a3a", "#88b9e0"][Math.floor(Math.random() * 4)];
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 700);
  }, { passive: true });
}

/* ---------- Avatar ---------- */
function avatarHTML(size = 96) {
  return `
    <div class="avatar" style="width:${size}px;height:${size}px;">
      <img src="avatar/girl-reading.png" alt="Lumi the reading companion" />
      <span class="sparkle s1">✦</span>
      <span class="sparkle s2">✿</span>
      <span class="sparkle s3">♡</span>
    </div>
  `;
}

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- Visitor counter (cute, persisted in localStorage) ---------- */
function visitorCount() {
  const KEY = "lumen.visitors";
  let n = parseInt(localStorage.getItem(KEY) || "0", 10);
  if (Number.isNaN(n)) n = 0;
  // Increment once per session
  if (!sessionStorage.getItem("lumen.counted")) {
    n += 1;
    sessionStorage.setItem("lumen.counted", "1");
    localStorage.setItem(KEY, String(n));
  }
  // Pad with leading offset so it feels like a "real" counter
  return String(1247 + n).padStart(6, "0");
}

/* ---------- Routing ---------- */
function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { name: "home" };
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "book" && parts[1]) {
    if (parts[2] === "read")   return { name: "read",   id: parts[1] };
    if (parts[2] === "listen") return { name: "listen", id: parts[1] };
    return { name: "detail", id: parts[1] };
  }
  return { name: "home" };
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", init);

async function init() {
  ensureChrome();
  app.innerHTML = `<div class="loading">loading the cozy library… ✿</div>`;
  try {
    const res = await fetch("data/books.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load books: ${res.status}`);
    state.books = await res.json();
    state.loaded = true;
    render();
  } catch (err) {
    console.error(err);
    app.innerHTML = `
      <div class="container">
        <div class="empty">
          <h3>can't load the library right now (｡•́︿•̀｡)</h3>
          <p>${escapeHtml(err.message || String(err))}</p>
        </div>
      </div>`;
  }
}

function render() {
  if (!state.loaded) return;
  stopListenIfActive();
  const route = getRoute();
  if (route.name === "detail") return renderDetail(route.id);
  if (route.name === "read")   return renderRead(route.id);
  if (route.name === "listen") return renderListen(route.id);
  renderHome();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ============================================================
   MARQUEE (top-of-page scrolling text)
   ============================================================ */
function marqueeHTML() {
  const items = [
    "♡ welcome to lumen — a cozy library of big ideas",
    "✿ now stocking " + state.books.length + " little books",
    "★ press play in listen mode and lumi reads to you",
    "♡ updated " + new Date().toLocaleDateString(),
    "✦ a hand-stitched site, made with tea and love",
    "✿ pick a book — settle in — stay as long as you like",
  ];
  // Duplicate for seamless loop
  const line = items.map(t => `<span>${escapeHtml(t)}</span>`).join("");
  return `
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">${line}${line}</div>
    </div>
  `;
}

/* ============================================================
   SIDE WIDGETS
   ============================================================ */
function leftWidgetsHTML() {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  return `
    <div class="widget">
      <span class="widget-title">♡ visitors ♡</span>
      <div class="visitor-counter">${visitorCount()}</div>
      <ul style="margin-top:10px">
        <li><span>updated</span><span class="v">${dateStr}</span></li>
        <li><span>books</span><span class="v">${state.books.length}</span></li>
        <li><span>since</span><span class="v">2026</span></li>
      </ul>
    </div>

    <div class="widget">
      <span class="widget-title">✿ shelves ✿</span>
      <ul>
        ${CATEGORIES.slice(1).map(cat => {
          const count = state.books.filter(b => b.category === cat).length;
          return `<li><a href="#/" data-shelf="${escapeHtml(cat)}" style="color:inherit;text-decoration:none;flex:1">${escapeHtml(cat.toLowerCase())}</a><span class="v">${count}</span></li>`;
        }).join("")}
      </ul>
    </div>

    <div class="widget">
      <span class="widget-title">★ now reading ★</span>
      ${(() => {
        const featured = state.books[0];
        if (!featured) return `<p style="font-family:var(--font-pixel);font-size:11px;color:var(--ink-mute)">no books yet…</p>`;
        return `
          <a href="#/book/${encodeURIComponent(featured.id)}" style="color:inherit;text-decoration:none">
            <div class="mini-cover"><img src="${escapeHtml(featured.coverImageUrl)}" alt=""/></div>
            <div class="now-reading">${escapeHtml(featured.title)}</div>
            <div class="now-reading-by">by ${escapeHtml(featured.author)}</div>
          </a>
        `;
      })()}
    </div>
  `;
}

function rightWidgetsHTML() {
  return `
    <div class="widget">
      <span class="widget-title">♥ about lumen ♥</span>
      <p style="font-family:var(--font-pixel);font-size:11px;color:var(--ink-soft);line-height:1.6;margin:0">
        a quiet little corner of the internet for big ideas, told gently.
        every book is hand-picked & summarized with care ♡
      </p>
    </div>

    <div class="widget">
      <span class="widget-title">✿ link me ✿</span>
      <div class="web-buttons">
        <a class="web-button b1" href="#/" title="lumen">♡ LUMEN ♡</a>
        <a class="web-button b2" href="#/" title="ideas">★ IDEAS ★</a>
        <a class="web-button b3" href="#/" title="cozy">✿ COZY ✿</a>
        <a class="web-button b4" href="#/" title="read">♥ READ ♥</a>
      </div>
    </div>

    <div class="widget">
      <span class="widget-title">✦ now playing ✦</span>
      <p style="font-family:var(--font-pixel);font-size:11px;color:var(--rose);margin:0 0 4px">
        ♪ rainy library lo-fi
      </p>
      <p style="font-family:var(--font-pixel);font-size:10px;color:var(--ink-mute);margin:0">
        04:32 / ∞
      </p>
      <div style="margin-top:8px;height:5px;background:var(--rose-bg);border-radius:999px;overflow:hidden;border:1px solid var(--border)">
        <div style="height:100%;width:42%;background:var(--rose)"></div>
      </div>
    </div>

    <div class="widget">
      <span class="widget-title">♡ mood ♡</span>
      <p style="font-family:var(--font-cute);font-size:18px;color:var(--rose);margin:0">cozy &amp; curious ✿</p>
    </div>
  `;
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function renderHome() {
  document.title = "Lumen ✿ a cozy library of big ideas";

  const filtered = state.books.filter((b) => {
    const matchesCat = state.category === "All" || b.category === state.category;
    const q = state.search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  app.innerHTML = `
    <div class="lace-strip" aria-hidden="true"></div>

    <div class="container page-fade">
      ${marqueeHTML()}

      <header class="banner">
        <div class="banner-stripes">
          <div class="banner-title-pill">
            <h1>♡ LUMEN ♡</h1>
            <p>a cozy library of big ideas</p>
          </div>
        </div>
        <div class="banner-welcome">
          ${avatarHTML(96)}
          <div class="welcome-text">
            <h2>hii, welcome back ! <span style="font-family:var(--font-sans);font-size:14px">(◕ᴗ◕✿)</span></h2>
            <p>★ pick a little book ★ i'll read it to you in a soft voice ★ or curl up &amp; read it yourself ★</p>
          </div>
        </div>
      </header>

      <div class="page">
        <aside class="side-col left">
          ${leftWidgetsHTML()}
        </aside>

        <main class="main-col">
          <div class="toolbar">
            <div class="search">
              <input
                type="search"
                id="search"
                placeholder="search a title or author..."
                value="${escapeHtml(state.search)}"
                autocomplete="off"
              />
            </div>
            <div class="chips">
              ${CATEGORIES.map((cat) => `
                <button
                  class="chip ${state.category === cat ? "active" : ""}"
                  data-cat="${cat}"
                >${state.category === cat ? "♥ " : ""}${cat}</button>
              `).join("")}
            </div>
          </div>

          <div class="divider" aria-hidden="true"></div>

          ${
            filtered.length > 0
              ? `
            <div class="section-head">
              <h2>${state.category === "All" ? "✿ everything on the shelf ✿" : "✿ " + state.category + " corner ✿"}</h2>
              <span class="count">(${filtered.length} ${filtered.length === 1 ? "book" : "books"})</span>
            </div>
            <div class="grid">
              ${filtered.map(cardHTML).join("")}
            </div>
          `
              : `
            <div class="empty" style="margin-top:18px">
              <h3>no books here yet (｡•́︿•̀｡)</h3>
              <p>try a different shelf?</p>
              <button class="pill" id="clear-filters">♥ show me everything</button>
            </div>
          `
          }

          <div class="divider" aria-hidden="true"></div>

          <div class="footer-note">
            <p>stay as long as you'd like ♡</p>
            <p>made with ♥ + tea ・ neocities-style ・ all hand-stitched</p>
          </div>
        </main>

        <aside class="side-col right">
          ${rightWidgetsHTML()}
        </aside>
      </div>
    </div>

    <div class="lace-strip bottom" aria-hidden="true"></div>
  `;

  // Wire up search
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderHome();
      const next = document.getElementById("search");
      if (next) {
        next.focus();
        const len = next.value.length;
        next.setSelectionRange(len, len);
      }
    });
  }

  document.querySelectorAll(".chip").forEach((el) => {
    el.addEventListener("click", () => {
      state.category = el.dataset.cat;
      renderHome();
    });
  });

  // Shelf widget links
  document.querySelectorAll("[data-shelf]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      state.category = el.dataset.shelf;
      renderHome();
    });
  });

  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.search = "";
      state.category = "All";
      renderHome();
    });
  }
}

function cardHTML(book) {
  return `
    <a class="card" href="#/book/${encodeURIComponent(book.id)}">
      <div class="card-cover">
        <span class="tape" aria-hidden="true"></span>
        <img src="${escapeHtml(book.coverImageUrl)}" alt="Cover of ${escapeHtml(book.title)}" loading="lazy" />
      </div>
      <div class="card-meta">
        <h3>${escapeHtml(book.title)}</h3>
        <p>by ${escapeHtml(book.author)}</p>
        <span class="cat-badge" data-cat="${escapeHtml(book.category)}">♥ ${escapeHtml(book.category)}</span>
      </div>
    </a>
  `;
}

/* ============================================================
   BOOK DETAIL PAGE
   ============================================================ */
function renderDetail(id) {
  const book = state.books.find((b) => b.id === id);
  if (!book) return renderNotFound();

  document.title = `${book.title} ♡ Lumen`;

  app.innerHTML = `
    <div class="lace-strip" aria-hidden="true"></div>

    <div class="container page-fade">
      <a class="back-link pill" href="#/">← back to library</a>

      <div class="detail">
        <div>
          <div class="detail-cover">
            <span class="tape" aria-hidden="true"></span>
            <div class="img-wrap">
              <img src="${escapeHtml(book.coverImageUrl)}" alt="Cover of ${escapeHtml(book.title)}" />
            </div>
          </div>

          <div class="detail-side" style="margin-top:14px">
            <a class="action-btn read" href="#/book/${encodeURIComponent(book.id)}/read">
              <span class="ico">📖</span>
              <span>read it ♡</span>
            </a>
            <a class="action-btn listen" href="#/book/${encodeURIComponent(book.id)}/listen">
              <span class="ico">🎧</span>
              <span>listen with lumi ♥</span>
            </a>

            <div class="narrator-card">
              ${avatarHTML(56)}
              <div class="text">
                <p>narrated by lumi</p>
                <p>soft voice, lots of feelings (◕‿◕)</p>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <span class="cat-badge" data-cat="${escapeHtml(book.category)}">♥ ${escapeHtml(book.category)}</span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="author">by ${escapeHtml(book.author)}</p>
          <div class="lede">${(book.shortDescription || "").split(/\n\s*\n/).map(p => `<p>${escapeHtml(p)}</p>`).join("")}</div>

          <h3 class="takeaways-title">♥ key takeaways</h3>
          <ol class="takeaways">
            ${(book.keyTakeaways || []).map((t, i) => `
              <li>
                <span class="num">${i + 1}</span>
                <span class="text">${escapeHtml(t)}</span>
              </li>
            `).join("")}
          </ol>
        </div>
      </div>

      <div style="height:60px"></div>
    </div>

    <div class="lace-strip bottom" aria-hidden="true"></div>
  `;
}

/* ============================================================
   READ MODE PAGE
   ============================================================ */
function renderRead(id) {
  const book = state.books.find((b) => b.id === id);
  if (!book) return renderNotFound();

  document.title = `Reading ♡ ${book.title} — Lumen`;

  const wordCount = (book.summarySections || []).reduce(
    (acc, sec) => acc + (sec.paragraphs || []).reduce((a, p) => a + p.split(/\s+/).length, 0),
    0
  );
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  let fontSize = parseInt(localStorage.getItem("lumen.fontSize") || "18", 10);
  if (Number.isNaN(fontSize)) fontSize = 18;

  app.innerHTML = `
    <div class="read-page">
      <div class="read-progress" id="read-progress"></div>

      <header class="read-bar">
        <a class="pill" href="#/book/${encodeURIComponent(book.id)}">← back</a>
        <span class="read-title">${escapeHtml(book.title)}</span>
        <div class="font-controls">
          <button class="pill icon" id="font-down" title="smaller text">A−</button>
          <button class="pill icon" id="font-up"   title="larger text">A+</button>
        </div>
      </header>

      <article class="read-article" id="read-article" style="font-size:${fontSize}px">
        <div class="read-titlecard">
          <span class="tape" aria-hidden="true"></span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="author">by ${escapeHtml(book.author)}</p>
          <div class="read-meta">
            <span class="stat-pill">~${readingTime} min</span>
            <span class="stat-pill purple">${wordCount} words</span>
          </div>
        </div>

        <div class="read-body">
          ${(book.summarySections || []).map((section, sIdx) => `
            <section class="${sIdx === 0 ? "first" : ""}">
              <h2>${escapeHtml(section.heading)}</h2>
              ${(section.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join("")}
            </section>
          `).join("")}

          <footer class="read-footer">
            <p>end of summary ♡</p>
            <a class="pill" href="#/book/${encodeURIComponent(book.id)}">♥ back to book</a>
          </footer>
        </div>
      </article>
    </div>
  `;

  const article = document.getElementById("read-article");
  const setSize = (s) => {
    fontSize = Math.max(14, Math.min(26, s));
    article.style.fontSize = fontSize + "px";
    localStorage.setItem("lumen.fontSize", String(fontSize));
  };
  document.getElementById("font-down").addEventListener("click", () => setSize(fontSize - 2));
  document.getElementById("font-up").addEventListener("click", () => setSize(fontSize + 2));

  const progressEl = document.getElementById("read-progress");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
    progressEl.style.transform = `scaleX(${p})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   LISTEN MODE PAGE
   ============================================================ */
function buildScriptFromBook(book) {
  const lines = [];
  lines.push(`${book.title}, by ${book.author}.`);
  if (book.shortDescription) lines.push(book.shortDescription);
  (book.summarySections || []).forEach((section) => {
    lines.push(section.heading + ".");
    (section.paragraphs || []).forEach((p) => lines.push(p));
  });
  if (book.keyTakeaways && book.keyTakeaways.length) {
    lines.push("Key takeaways.");
    book.keyTakeaways.forEach((t) => lines.push(t));
  }
  lines.push("Thank you for listening. Until next time.");
  return lines;
}

function stopListenIfActive() {
  if (state.listen) {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
    state.listen = null;
  }
}

function renderListen(id) {
  const book = state.books.find((b) => b.id === id);
  if (!book) return renderNotFound();

  document.title = `Listening ♡ ${book.title} — Lumen`;

  const supportsSpeech =
    typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  const segments = buildScriptFromBook(book);

  state.listen = {
    segments,
    index: 0,
    isPlaying: false,
    isPaused: false,
    rate: parseFloat(localStorage.getItem("lumen.rate") || "0.95"),
    voiceName: localStorage.getItem("lumen.voice") || "",
    voices: [],
  };

  app.innerHTML = `
    <div class="listen-page page-fade">
      <header class="listen-header">
        <a class="pill" href="#/book/${encodeURIComponent(book.id)}">← back</a>
        <div class="listen-title">
          <h2>${escapeHtml(book.title)}</h2>
          <p>by ${escapeHtml(book.author)}</p>
        </div>
        <span class="pill" id="status-pill">✿ idle</span>
      </header>

      <main class="listen-stage">
        <div class="stage-glow"></div>
        <div class="stage-avatar" id="stage-avatar">
          ${avatarHTML(220)}
        </div>

        <div class="caption" id="caption">
          ${supportsSpeech
            ? "press play to begin the narration ♡"
            : "your browser doesn't support voice playback (｡•́︿•̀｡)"}
        </div>
      </main>

      <footer class="listen-controls">
        <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>

        <div class="controls-row">
          <div class="ctrl-group left">
            <label class="ctrl-label">speed</label>
            <select id="rate-select" class="ctrl-select">
              <option value="0.8">0.8×</option>
              <option value="0.9">0.9×</option>
              <option value="0.95">0.95×</option>
              <option value="1">1×</option>
              <option value="1.15">1.15×</option>
              <option value="1.3">1.3×</option>
            </select>
            <select id="voice-select" class="ctrl-select voice-select" aria-label="voice"></select>
          </div>

          <div class="ctrl-group center">
            <button class="ctrl-icon" id="btn-restart" title="restart">↺</button>
            <button class="ctrl-play" id="btn-play" ${supportsSpeech ? "" : "disabled"}>
              <span id="play-icon">▶</span>
            </button>
            <button class="ctrl-icon" id="btn-stop" title="stop">■</button>
          </div>

          <div class="ctrl-group right">
            <span id="progress-text" class="progress-text">0%</span>
          </div>
        </div>
      </footer>
    </div>
  `;

  if (!supportsSpeech) return;

  const voiceSelect = document.getElementById("voice-select");
  const populateVoices = () => {
    const all = window.speechSynthesis.getVoices();
    state.listen.voices = all.filter((v) => /^en/i.test(v.lang));
    voiceSelect.innerHTML = state.listen.voices
      .map((v) => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`)
      .join("") || `<option>default voice</option>`;
    if (state.listen.voiceName) voiceSelect.value = state.listen.voiceName;
    else if (state.listen.voices[0]) {
      state.listen.voiceName = state.listen.voices[0].name;
      voiceSelect.value = state.listen.voiceName;
    }
  };
  populateVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
  voiceSelect.addEventListener("change", () => {
    state.listen.voiceName = voiceSelect.value;
    localStorage.setItem("lumen.voice", state.listen.voiceName);
  });

  const rateSelect = document.getElementById("rate-select");
  rateSelect.value = String(state.listen.rate);
  rateSelect.addEventListener("change", () => {
    state.listen.rate = parseFloat(rateSelect.value);
    localStorage.setItem("lumen.rate", String(state.listen.rate));
  });

  document.getElementById("btn-play").addEventListener("click", togglePlay);
  document.getElementById("btn-stop").addEventListener("click", stopPlayback);
  document.getElementById("btn-restart").addEventListener("click", () => {
    stopPlayback();
    state.listen.index = 0;
    updateProgress();
    setCaption("press play to begin the narration ♡");
  });
}

function setCaption(text) {
  const el = document.getElementById("caption");
  if (el) el.textContent = text;
}
function setStatus(text) {
  const el = document.getElementById("status-pill");
  if (el) el.textContent = text;
}
function setPlayIcon(playing) {
  const el = document.getElementById("play-icon");
  if (el) el.textContent = playing ? "❚❚" : "▶";
  const stage = document.getElementById("stage-avatar");
  if (stage) stage.classList.toggle("speaking", playing);
}
function updateProgress() {
  if (!state.listen) return;
  const total = state.listen.segments.length;
  const idx = Math.min(state.listen.index, total);
  const pct = total > 0 ? idx / total : 0;
  const fill = document.getElementById("progress-fill");
  const txt  = document.getElementById("progress-text");
  if (fill) fill.style.width = (pct * 100).toFixed(1) + "%";
  if (txt)  txt.textContent  = Math.round(pct * 100) + "%";
}
function speakCurrent() {
  if (!state.listen) return;
  const { segments, index, voices, voiceName, rate } = state.listen;
  if (index >= segments.length) {
    state.listen.isPlaying = false;
    setPlayIcon(false);
    setStatus("✿ done");
    setCaption("finished — well done ♡");
    return;
  }
  const text = segments[index];
  setCaption(text);
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1.05;
  const voice = voices.find((v) => v.name === voiceName);
  if (voice) utter.voice = voice;
  utter.onend = () => {
    if (!state.listen || !state.listen.isPlaying) return;
    state.listen.index += 1;
    updateProgress();
    speakCurrent();
  };
  utter.onerror = (e) => {
    console.error("speech error", e);
    state.listen.isPlaying = false;
    setPlayIcon(false);
    setStatus("✿ error");
  };
  window.speechSynthesis.speak(utter);
}
function togglePlay() {
  if (!state.listen) return;
  if (state.listen.isPaused) {
    window.speechSynthesis.resume();
    state.listen.isPaused = false;
    state.listen.isPlaying = true;
    setPlayIcon(true);
    setStatus("✿ playing");
    return;
  }
  if (state.listen.isPlaying) {
    window.speechSynthesis.pause();
    state.listen.isPaused = true;
    state.listen.isPlaying = false;
    setPlayIcon(false);
    setStatus("✿ paused");
    return;
  }
  state.listen.isPlaying = true;
  state.listen.isPaused = false;
  setPlayIcon(true);
  setStatus("✿ playing");
  updateProgress();
  speakCurrent();
}
function stopPlayback() {
  if (!state.listen) return;
  try { window.speechSynthesis.cancel(); } catch (_) {}
  state.listen.isPlaying = false;
  state.listen.isPaused = false;
  setPlayIcon(false);
  setStatus("✿ stopped");
}

function renderNotFound() {
  document.title = "Not found ♡ Lumen";
  app.innerHTML = `
    <div class="container page-fade">
      <a class="back-link pill" href="#/">← back to library</a>
      <div class="empty" style="margin-top:24px">
        <h3>oh no, can't find that one (｡•́︿•̀｡)</h3>
        <a class="pill" href="#/">♡ back to library</a>
      </div>
    </div>`;
}
