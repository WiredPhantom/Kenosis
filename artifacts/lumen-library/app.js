/* ============================================================
   LUMEN — vanilla JS app
   Loads books from data/books.json and renders home + detail
   pages with hash-based routing.
   ============================================================ */

const CATEGORIES = ["All", "Philosophy", "Self-Help", "Psychology", "Business", "Science", "Spirituality"];

const state = {
  books: [],
  loaded: false,
  search: "",
  category: "All",
};

const app = document.getElementById("app");

/* ---------- Avatar (reusable) ---------- */
function avatarHTML(size = 96) {
  return `
    <div class="avatar" style="width:${size}px;height:${size}px;">
      <img src="avatar/girl-reading.png" alt="Lumi the reading companion" />
      <span class="blink left"></span>
      <span class="blink right"></span>
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

function paragraphsHTML(text) {
  if (!text) return "";
  return text
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

/* ---------- Routing ---------- */
function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { name: "home" };
  const parts = hash.split("/");
  if (parts[0] === "book" && parts[1]) return { name: "book", id: parts[1] };
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
  const route = getRoute();
  if (route.name === "book") {
    renderDetail(route.id);
  } else {
    renderHome();
  }
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ---------- Home page ---------- */
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
            <p>pick a little book — settle in and read it whenever you'd like <span style="color:var(--rose)">♡</span></p>
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

  // Wire up search
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      // Re-render only the grid for snappy filtering
      renderHome();
      // Refocus & restore caret
      const next = document.getElementById("search");
      if (next) {
        next.focus();
        const len = next.value.length;
        next.setSelectionRange(len, len);
      }
    });
  }

  // Wire up chips
  document.querySelectorAll(".chip").forEach((el) => {
    el.addEventListener("click", () => {
      state.category = el.dataset.cat;
      renderHome();
    });
  });

  // Clear filters
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

/* ---------- Detail page ---------- */
function renderDetail(id) {
  const book = state.books.find((b) => b.id === id);
  if (!book) {
    document.title = "Not found ♡ Lumen";
    app.innerHTML = `
      <div class="container page-fade">
        <a class="back-link pill" href="#/">← back to library</a>
        <div class="empty" style="margin-top:24px">
          <h3>oh no, can't find that one (｡•́︿•̀｡)</h3>
          <a class="pill" href="#/">♡ back to library</a>
        </div>
      </div>`;
    return;
  }

  document.title = `${book.title} ♡ Lumen`;

  const summaryHTML = (book.summarySections || [])
    .map(
      (sec) => `
        <section>
          <h2>${escapeHtml(sec.heading)}</h2>
          ${(sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
        </section>
      `
    )
    .join("");

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
            <div class="narrator-card">
              ${avatarHTML(56)}
              <div class="text">
                <p>kept by lumi</p>
                <p>your cozy reading companion (◕‿◕)</p>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <span class="cat-badge" data-cat="${escapeHtml(book.category)}">♥ ${escapeHtml(book.category)}</span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="author">by ${escapeHtml(book.author)}</p>
          <div class="lede">${paragraphsHTML(book.shortDescription)}</div>

          <h3 class="takeaways-title">♥ key takeaways</h3>
          <ol class="takeaways">
            ${(book.keyTakeaways || []).map((t, i) => `
              <li>
                <span class="num">${i + 1}</span>
                <span class="text">${escapeHtml(t)}</span>
              </li>
            `).join("")}
          </ol>

          ${summaryHTML ? `<div class="summary">${summaryHTML}</div>` : ""}

          <div style="text-align:center; margin-top:32px; padding-top:18px; border-top:2px dashed var(--border);">
            <p style="font-family:var(--font-cute); font-size:22px; color:var(--rose); margin:0 0 12px;">end of summary ♡</p>
            <a class="pill" href="#/">♥ back to library</a>
          </div>
        </div>
      </div>

      <div style="height:60px"></div>
    </div>
  `;
}
