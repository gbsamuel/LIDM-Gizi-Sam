(function () {
  const COMPLETED_KEY = "nutriverse_pretest_v1_completed";
  const OPEN_PAGES = new Set(["", "index.html", "login.html", "pretest.html", "nutriquest.html", "dashboard-dosen.html"]);

  function currentPage() {
    return (window.location.pathname.split("/").pop() || "").toLowerCase();
  }

  function currentTarget() {
    return currentPage() || "index.html";
  }

  function loginUrl() {
    return `login.html?next=${encodeURIComponent(currentTarget() + window.location.search + window.location.hash)}`;
  }

  function pretestUrl() {
    return `pretest.html?next=${encodeURIComponent(currentTarget() + window.location.search + window.location.hash)}`;
  }

  function overlay({ title, message, href, action }) {
    if (document.querySelector(".pretest-gate-overlay")) return;
    document.body.classList.add("pretest-locked");
    const node = document.createElement("div");
    node.className = "pretest-gate-overlay";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.setAttribute("aria-labelledby", "pretest-gate-title");
    node.innerHTML = `
      <div class="pretest-gate-box">
        <span class="pretest-gate-kicker">Akses Terkunci</span>
        <h2 id="pretest-gate-title">${title}</h2>
        <p>${message}</p>
        <a class="button primary" href="${href}">${action}</a>
      </div>
    `;
    document.body.appendChild(node);
    node.querySelector("a")?.focus();
  }

  async function hasCompletedPretest(user) {
    const auth = window.NutriVerseAuth;
    if (!auth?.isConfigured() || !user) return false;
    const done = await auth.hasCompletedAttempt(user.id, "pretest");
    if (done) {
      try {
        window.localStorage.setItem(COMPLETED_KEY, "true");
      } catch (error) {
        // Local cache is optional; Supabase remains the source of truth.
      }
    }
    return done;
  }

  async function initPretestGate() {
    if (new URLSearchParams(window.location.search).get("bypass") === "true" || window.localStorage.getItem("nutriverse_dev_bypass") === "true") {
      return;
    }
    if (OPEN_PAGES.has(currentPage())) return;
    const auth = window.NutriVerseAuth;

    if (!auth?.isConfigured()) {
      overlay({
        title: "Supabase belum dikonfigurasi",
        message: "Isi SUPABASE_URL dan SUPABASE_ANON_KEY sebelum fitur login dan nilai resmi dipakai.",
        href: "login.html",
        action: "Buka Login"
      });
      return;
    }

    const user = await auth.getCurrentUser();
    if (!user) {
      overlay({
        title: "Masuk dulu untuk membuka fitur",
        message: "Akun dipakai untuk menyimpan nilai pretest dan posttest sebagai data resmi.",
        href: loginUrl(),
        action: "Login"
      });
      return;
    }

    if (!(await hasCompletedPretest(user))) {
      overlay({
        title: "Untuk buka fitur, kamu harus pretest dulu",
        message: "Pretest menjadi baseline awal sebelum kamu memakai fitur NutriVerse.",
        href: pretestUrl(),
        action: "Mulai Pretest"
      });
    }
  }

  window.NutriVersePretestGate = {
    completedKey: COMPLETED_KEY,
    getCurrentUser: () => window.NutriVerseAuth?.getCurrentUser(),
    hasCompletedPretest,
    loginUrl,
    pretestUrl
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPretestGate);
  } else {
    initPretestGate();
  }
})();
