(function () {
  const questions = window.NUTRIVERSE_PRETEST_QUESTIONS || [];
  const OFFICIAL_ATTEMPT_TABLE = "test_attempts";
  const TEST_TYPE_FIELD = "test_type";
  const SCORE_PERCENTAGE_FIELD = "percentage";
  const SUBMITTED_AT_FIELD = "submitted_at";

  let currentIndex = 0;
  const answers = {};

  const root = document.querySelector("[data-test-type]");
  const testType = root?.dataset.testType || "pretest";
  const nextDefault = testType === "pretest" ? "nutrisolve.html" : "dashboard-dosen.html";

  const progressEl = document.querySelector("[data-pretest-progress]");
  const categoryEl = document.querySelector("[data-pretest-category]");
  const questionEl = document.querySelector("[data-pretest-question]");
  const optionsEl = document.querySelector("[data-pretest-options]");
  const warningEl = document.querySelector("[data-pretest-warning]");
  const backBtn = document.querySelector("[data-pretest-back]");
  const nextBtn = document.querySelector("[data-pretest-next]");
  const statusEl = document.querySelector("[data-test-status]");

  function targetAfterSubmit() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (!next) return nextDefault;
    if (/^https?:\/\//i.test(next) || next.startsWith("//")) return nextDefault;
    return next;
  }

  function selectedAnswer() {
    return answers[questions[currentIndex]?.id];
  }

  function setWarning(message) {
    if (!warningEl) return;
    warningEl.textContent = message || "";
    warningEl.classList.toggle("active", Boolean(message));
  }

  function setStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.dataset.status = type;
    statusEl.classList.toggle("active", Boolean(message));
  }

  function disableRunner(message) {
    if (optionsEl) optionsEl.innerHTML = "";
    if (nextBtn) nextBtn.disabled = true;
    if (backBtn) backBtn.disabled = true;
    setStatus(message, "warning");
  }

  function renderQuestion() {
    const question = questions[currentIndex];
    if (!question || !progressEl || !categoryEl || !questionEl || !optionsEl || !nextBtn || !backBtn) return;

    progressEl.textContent = `${currentIndex + 1}/${questions.length}`;
    categoryEl.textContent = question.category;
    questionEl.textContent = question.question;
    backBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === questions.length - 1 ? "Selesai" : "Lanjut";
    setWarning("");

    optionsEl.innerHTML = question.options.map((option, index) => {
      const checked = selectedAnswer() === index ? "checked" : "";
      return `
        <label class="pretest-option">
          <input type="radio" name="pretest-answer" value="${index}" ${checked}>
          <span>${option}</span>
        </label>
      `;
    }).join("");

    optionsEl.querySelectorAll('input[name="pretest-answer"]').forEach((input) => {
      input.addEventListener("change", () => {
        answers[question.id] = Number(input.value);
        setWarning("");
      });
    });
  }

  function calculateScore() {
    return questions.reduce((total, question) => {
      return total + (answers[question.id] === question.answer ? 1 : 0);
    }, 0);
  }

  async function saveResult() {
    const auth = window.NutriVerseAuth;
    if (!auth?.isConfigured()) {
      throw new Error("Supabase belum dikonfigurasi. Nilai resmi belum bisa disimpan.");
    }

    const user = await auth.getCurrentUser();
    if (!user) {
      window.location.href = `login.html?next=${encodeURIComponent(window.location.pathname.split("/").pop() || "pretest.html")}`;
      return null;
    }

    return auth.insertTestAttempt({
      userId: user.id,
      testType,
      score: calculateScore(),
      total: questions.length,
      sourceTable: OFFICIAL_ATTEMPT_TABLE,
      testTypeField: TEST_TYPE_FIELD,
      percentageField: SCORE_PERCENTAGE_FIELD,
      submittedAtField: SUBMITTED_AT_FIELD
    });
  }

  async function handleNext() {
    if (selectedAnswer() === undefined) {
      setWarning("Pilih salah satu jawaban dulu sebelum lanjut.");
      return;
    }

    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    nextBtn.disabled = true;
    setStatus("Menyimpan nilai resmi...", "info");
    try {
      const saved = await saveResult();
      if (!saved) return;
      if (testType === "pretest") {
        try {
          window.localStorage.setItem("nutriverse_pretest_v1_completed", "true");
        } catch (error) {
          // Cache only; official state is stored in Supabase.
        }
      }
      window.location.href = targetAfterSubmit();
    } catch (error) {
      const duplicate = /duplicate|unique|23505/i.test(error.message || "");
      setStatus(duplicate ? "Test ini sudah pernah diselesaikan." : error.message, "error");
      nextBtn.disabled = duplicate;
    }
  }

  function handleBack() {
    if (currentIndex === 0) return;
    currentIndex -= 1;
    renderQuestion();
  }

  async function initTestRunner() {
    if (!questions.length) {
      disableRunner("Data test belum tersedia.");
      return;
    }

    const auth = window.NutriVerseAuth;
    if (!auth?.isConfigured()) {
      disableRunner("Supabase belum dikonfigurasi. Isi URL dan anon key sebelum test dipakai.");
      return;
    }

    const user = await auth.getCurrentUser();
    if (!user) {
      window.location.href = `login.html?next=${encodeURIComponent(window.location.pathname.split("/").pop() || "pretest.html")}`;
      return;
    }

    try {
      const done = await auth.hasCompletedAttempt(user.id, testType);
      if (done) {
        disableRunner("Test ini sudah pernah diselesaikan.");
        return;
      }
    } catch (error) {
      disableRunner(error.message);
      return;
    }

    nextBtn?.addEventListener("click", handleNext);
    backBtn?.addEventListener("click", handleBack);
    renderQuestion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTestRunner);
  } else {
    initTestRunner();
  }
})();
