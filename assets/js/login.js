(function () {
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
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
      await auth.signUpStudent({
        fullName: form.get("full_name").trim(),
        nim: form.get("nim").trim(),
        email: form.get("email").trim(),
        password: form.get("password")
      });
      setStatus("Akun berhasil dibuat. Jika email confirmation aktif, cek email sebelum login.", "success");
      registerForm.reset();
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);
})();
