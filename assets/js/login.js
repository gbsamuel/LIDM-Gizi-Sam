(function () {
  const ADMIN_PASSWORD = "nutrisphere123";
  const ADMIN_UNLOCK_KEY = "nutrisphere_admin_unlocked";

  const loginForm = document.querySelector("[data-login-form]");
  const adminLoginForm = document.querySelector("[data-admin-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const modeButtons = document.querySelectorAll("[data-auth-mode]");
  const studentAuthButtons = document.querySelectorAll("[data-student-auth]");
  const studentAuthTabs = document.querySelector("[data-student-auth-tabs]");
  const sessionCard = document.querySelector("[data-auth-session-card]");
  const sessionLabel = document.querySelector("[data-auth-session-label]");
  const sessionAvatar = document.querySelector("[data-auth-session-avatar]");
  const loginPageSignout = document.querySelector("[data-login-page-signout]");
  const statusEl = document.querySelector("[data-auth-status]");

  function nextUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (!next || /^https?:\/\//i.test(next) || next.startsWith("//")) return "nutrisolve.html";
    return next;
  }

  function setStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.status = type;
    statusEl.classList.toggle("active", Boolean(message));
  }

  function setAuthMode(mode) {
    const adminMode = mode === "admin";
    const hasSession = sessionCard?.dataset.active === "true";
    loginForm.hidden = adminMode || hasSession;
    registerForm.hidden = true;
    adminLoginForm.hidden = !adminMode;
    if (studentAuthTabs) studentAuthTabs.hidden = adminMode || hasSession;
    if (sessionCard) sessionCard.hidden = adminMode || !hasSession;
    modeButtons.forEach((button) => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    setStatus("");
  }

  function setStudentAuthView(view) {
    const registerMode = view === "register";
    loginForm.hidden = registerMode;
    registerForm.hidden = !registerMode;
    studentAuthButtons.forEach((button) => {
      const active = button.dataset.studentAuth === view;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    setStatus("");
  }

  function initials(value) {
    return String(value || "NS").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  async function showExistingSession() {
    const auth = window.NutriSphereAuth;
    if (!auth) return;
    const user = await auth.getCurrentUser();
    if (!user) return;
    let profile = null;
    try {
      profile = await auth.getCurrentProfile();
    } catch (error) {
      // User metadata still gives a useful session state when profile read fails.
    }
    const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Mahasiswa";
    if (sessionLabel) sessionLabel.textContent = `${name} · ${user.email || "akun aktif"}`;
    if (sessionAvatar) sessionAvatar.textContent = initials(name);
    if (sessionCard) {
      sessionCard.dataset.active = "true";
      sessionCard.hidden = false;
    }
    if (loginForm) loginForm.hidden = true;
    if (registerForm) registerForm.hidden = true;
    if (adminLoginForm) adminLoginForm.hidden = true;
    if (studentAuthTabs) studentAuthTabs.hidden = true;
  }

  async function handleLogin(event) {
    event.preventDefault();
    const auth = window.NutriSphereAuth;
    if (!auth?.isConfigured()) {
      setStatus("Supabase belum dikonfigurasi. Isi URL dan anon key dulu.", "error");
      return;
    }

    const form = new FormData(loginForm);
    try {
      setStatus("Masuk ke akun...", "info");
      await auth.signIn(form.get("email").trim(), form.get("password"));
      window.location.href = nextUrl();
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  function handleAdminLogin(event) {
    event.preventDefault();
    const form = new FormData(adminLoginForm);
    const password = String(form.get("admin_password") || "");
    if (password !== ADMIN_PASSWORD) {
      setStatus("Password admin salah.", "error");
      return;
    }

    try {
      window.sessionStorage.setItem(ADMIN_UNLOCK_KEY, "true");
    } catch (error) {
      setStatus("Browser tidak mengizinkan session admin.", "error");
      return;
    }

    setStatus("Admin terbuka. Mengarahkan ke dashboard...", "success");
    window.location.href = "dashboard-dosen.html";
  }

  async function handleRegister(event) {
    event.preventDefault();
    const auth = window.NutriSphereAuth;
    if (!auth?.isConfigured()) {
      setStatus("Supabase belum dikonfigurasi. Isi URL dan anon key dulu.", "error");
      return;
    }

    const form = new FormData(registerForm);
    if (form.get("password") !== form.get("password_confirmation")) {
      setStatus("Konfirmasi password belum sama.", "error");
      return;
    }
    try {
      setStatus("Mendaftarkan akun mahasiswa...", "info");
      const data = await auth.signUpStudent({
        fullName: form.get("full_name").trim(),
        nim: form.get("nim").trim(),
        email: form.get("email").trim(),
        password: form.get("password")
      });
      registerForm.reset();
      if (data?.session) {
        setStatus("Akun berhasil dibuat dan langsung masuk. Mengarahkan ke halaman berikutnya...", "success");
        window.location.href = nextUrl();
        return;
      }
      setStatus("Akun dibuat, tetapi Supabase masih meminta konfirmasi email. Nonaktifkan Confirm email di Supabase Auth settings agar signup langsung masuk.", "error");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode || "student"));
  });
  studentAuthButtons.forEach((button) => {
    button.addEventListener("click", () => setStudentAuthView(button.dataset.studentAuth || "login"));
  });
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement?.querySelector("input");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Lihat" : "Sembunyikan";
      button.setAttribute("aria-label", visible ? "Tampilkan password" : "Sembunyikan password");
    });
  });
  loginPageSignout?.addEventListener("click", async () => {
    loginPageSignout.disabled = true;
    setStatus("Mengeluarkan akun...", "info");
    try {
      await window.NutriSphereAuth?.signOut();
      window.location.href = "login.html";
    } catch (error) {
      loginPageSignout.disabled = false;
      setStatus(error.message, "error");
    }
  });
  loginForm?.addEventListener("submit", handleLogin);
  adminLoginForm?.addEventListener("submit", handleAdminLogin);
  registerForm?.addEventListener("submit", handleRegister);
  showExistingSession();
})();
