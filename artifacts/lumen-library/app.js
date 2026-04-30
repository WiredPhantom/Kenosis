/* ============================================================
   LUMEN — vanilla JS app
   Static site with hash routing.

   Routes:
     #/                      → home (library)
     #/book/:id              → book detail (info + Read/Listen buttons)
     #/book/:id/read         → read mode (full summary)
     #/book/:id/listen       → listen mode (browser speech synthesis)
   ============================================================ */

const CATEGORIES = ["All", "Philosophy", "Self-Help", "Psychology", "Business", "Science", "Spirituality"];

const state = {
  books: [],
  loaded: false,
  search: "",
  category: "All",
  // Listen-mode state (per-page, reset on navigation)
  listen: null,
};

const app = document.getElementById("app");

/* ---------- Avatar (reusable) ---------- */
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

/* ---------- Init ---------- */
async function init() {
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

/* ---------- Render dispatcher ---------- */
function render() {
  if (!state.loaded) return;

  // Stop any speech if leaving listen mode
  stopListenIfActive();

  const route = getRoute();
  if (route.name === "detail") return renderDetail(route.id);
  if (route.name === "read")   return renderRead(route.id);
  if (route.name === "listen") return renderListen(route.id);
  renderHome();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
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

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;

  app.innerHTML = `
    <div class="container page-fade">
      <header class="banner">
        <div class="banner-stripes">
          <div class="banner-title-pill">
            <h1>Lumen</h1>
            <p>♡ a cozy library of big ideas ♡</p>
          </div>
        </div>
        <div class="banner-welcome">
          ${avatarHTML(96)}
          <div class="welcome-text">
            <h2>hii, welcome back ! <span style="font-family:var(--font-sans);font-size:14px">(◕ᴗ◕✿)</span></h2>
            <p>pick a little book — i'll read it to you in a soft voice, or you can curl up and read it yourself <span style="color:var(--rose)">♡</span></p>
          </div>
          <div class="banner-stats">
            <span class="stat-pill">♥ ${state.books.length} books</span>
            <span class="stat-pill purple">✿ updated ${dateStr}</span>
          </div>
        </div>
      </header>

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

      ${
        filtered.length > 0
          ? `
        <div class="section-head">
          <h2>${state.category === "All" ? "everything on the shelf" : state.category + " corner"}</h2>
          <span class="count">(${filtered.length} ${filtered.length === 1 ? "book" : "books"})</span>
        </div>
        <div class="grid">
          ${filtered.map(cardHTML).join("")}
        </div>
      `
          : `
        <div class="empty" style="margin-top:24px">
          <h3>no books here yet (｡•́︿•̀｡)</h3>
          <p>try a different shelf?</p>
          <button class="pill" id="clear-filters">♥ show me everything</button>
        </div>
      `
      }

      <div class="footer-note">
        <p>stay as long as you'd like ♡</p>
        <p>made with ♥ + tea</p>
      </div>
    </div>
  `;

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
        <p>${escapeHtml(book.author)}</p>
        <span class="cat-badge" data-cat="${escapeHtml(book.category)}">♥ ${escapeHtml(book.category)}</span>
      </div>
    </a>
  `;
}

/* ============================================================
   BOOK DETAIL PAGE
   Cover + title + author + short description + Read/Listen
   buttons + key takeaways. (No full summary inline.)
   ============================================================ */
function renderDetail(id) {
  const book = state.books.find((b) => b.id === id);
  if (!book) return renderNotFound();

  document.title = `${book.title} ♡ Lumen`;

  app.innerHTML = `
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
  `;
}

/* ============================================================
   READ MODE PAGE
   Full summary with adjustable font size and progress bar.
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

  // Font controls
  const article = document.getElementById("read-article");
  const setSize = (s) => {
    fontSize = Math.max(14, Math.min(26, s));
    article.style.fontSize = fontSize + "px";
    localStorage.setItem("lumen.fontSize", String(fontSize));
  };
  document.getElementById("font-down").addEventListener("click", () => setSize(fontSize - 2));
  document.getElementById("font-up").addEventListener("click", () => setSize(fontSize + 2));

  // Reading progress bar
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
   Browser SpeechSynthesis API — fully client-side, fully static.
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

  // Wire up voices
  const voiceSelect = document.getElementById("voice-select");
  const populateVoices = () => {
    const all = window.speechSynthesis.getVoices();
    state.listen.voices = all.filter((v) => /^en/i.test(v.lang));
    voiceSelect.innerHTML = state.listen.voices
      .map((v) => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`)
      .join("") || `<option>default voice</option>`;
    if (state.listen.voiceName) {
      voiceSelect.value = state.listen.voiceName;
    } else if (state.listen.voices[0]) {
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

  // Speed
  const rateSelect = document.getElementById("rate-select");
  rateSelect.value = String(state.listen.rate);
  rateSelect.addEventListener("change", () => {
    state.listen.rate = parseFloat(rateSelect.value);
    localStorage.setItem("lumen.rate", String(state.listen.rate));
  });

  // Buttons
  const playBtn   = document.getElementById("btn-play");
  const stopBtn   = document.getElementById("btn-stop");
  const restartBtn = document.getElementById("btn-restart");
  playBtn.addEventListener("click", () => togglePlay());
  stopBtn.addEventListener("click", () => stopPlayback());
  restartBtn.addEventListener("click", () => {
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

/* ---------- Not found ---------- */
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
