(function () {
  const ADMIN_PASSWORD = "nutriverse123";
  const ADMIN_UNLOCK_KEY = "nutriverse_admin_unlocked";

  const loginForm = document.querySelector("[data-login-form]");
  const adminLoginForm = document.querySelector("[data-admin-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const modeButtons = document.querySelectorAll("[data-auth-mode]");
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
    loginForm.hidden = adminMode;
    registerForm.hidden = adminMode;
    adminLoginForm.hidden = !adminMode;
    modeButtons.forEach((button) => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    setStatus("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    const auth = window.NutriVerseAuth;
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
    const auth = window.NutriVerseAuth;
    if (!auth?.isConfigured()) {
      setStatus("Supabase belum dikonfigurasi. Isi URL dan anon key dulu.", "error");
      return;
    }

    const form = new FormData(registerForm);
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
        setStatus("Akun berhasil dibuat. Mengarahkan ke halaman berikutnya...", "success");
        window.location.href = nextUrl();
        return;
      }
      setStatus("Akun berhasil dibuat. Jika email confirmation aktif, cek email sebelum login.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode || "student"));
  });
  loginForm?.addEventListener("submit", handleLogin);
  adminLoginForm?.addEventListener("submit", handleAdminLogin);
  registerForm?.addEventListener("submit", handleRegister);
})();
