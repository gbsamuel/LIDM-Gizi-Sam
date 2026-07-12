import { readFileSync, existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pages = [
  ["index.html", ["NUTRISPHERE", "NutriSolve", "NutriBase", "NutriPath", "NutriRead", "NutriQuest"]],
  ["login.html", ["Login NutriSphere", "Daftar Mahasiswa", "Email", "NIM"]],
  ["pretest.html", ["Pretest NutriSphere", "Baseline Awal", "data-test-type=\"pretest\""]],
  ["posttest.html", ["Posttest NutriSphere", "Evaluasi Akhir", "data-test-type=\"posttest\""]],
  ["dashboard-dosen.html", ["Dashboard Dosen", "Rekap Kompetensi", "Kasus Selesai"]],
  ["nutriquest.html", ["NutriQuest", "Pretest", "Posttest", "Asesmen Kasus", "Progress Kompetensi", "Dashboard Dosen"]],
  ["nutrisolve.html", ["Decision Support System", "Anthropometry", "Clinical", "Dietary"]],
  ["antropometri.html", ["Anthropometry Assessment", "Tabel Interpretasi", "Simulasi DSS"]],
  ["clinical.html", ["Clinical Nutrition Screening", "Scan Visual", "Simulasi AI"]],
  ["dietary.html", ["Dietary Pattern Assessment", "Ringkasan Pola Makan", "Simulasi"]],
  ["nutribase.html", ["TKPI", "DBMP", "AKG", "BPOM", "Foto Buku Makanan", "SSGI", "SKI", "Rumus Perhitungan Gizi", "Cari database"]],
  ["nutripath.html", ["Modul Mahasiswa Gizi", "PPT", "Link Video", "Case Gizi", "15 tahun terakhir"]],
  ["nutriread.html", ["Jurnal", "E-Book", "AI Summary"]],
  ["ar-patient.html", ["AR Patient Visualization", "Detail Data Pasien", "AI CLINICAL SUPERVISOR"]],
  ["ai_summary.html", ["AI Summary", "Masukkan Teks Jurnal", "Summarize Jurnal"]],
  ["journal_ebook.html", ["Jurnal", "E-Book", "Metadata Referensi", "Topik", "Tahun"]],
];

test("planned static pages exist with NutriSphere content markers", () => {
  for (const [file, markers] of pages) {
    assert.equal(existsSync(file), true, `${file} should exist`);
    const html = readFileSync(file, "utf8");
    for (const marker of markers) {
      assert.match(html, new RegExp(marker), `${file} should include ${marker}`);
    }
    assert.match(html, /assets\/css\/styles.css/, `${file} should use shared CSS`);
    assert.match(html, /assets\/js\/main.js/, `${file} should use shared JS`);
  }
});

test("global assets exist and avoid backend-like interactive claims", () => {
  assert.equal(existsSync("assets/css/styles.css"), true, "shared CSS should exist");
  assert.equal(existsSync("assets/js/main.js"), true, "shared JS should exist");

  const allHtml = pages.map(([file]) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(allHtml, /service_role/i);
  assert.match(allHtml, /placeholder|simulasi/i);
});

test("pretest page and data implement the feature gate contract", () => {
  assert.equal(existsSync("pretest.html"), true, "pretest page should exist");
  assert.equal(existsSync("assets/js/pretest-data.js"), true, "pretest data should exist");
  assert.equal(existsSync("assets/js/test-runner.js"), true, "shared test runner script should exist");
  assert.equal(existsSync("assets/js/pretest-gate.js"), true, "pretest gate script should exist");

  const html = readFileSync("pretest.html", "utf8");
  assert.match(html, /Pretest NutriSphere/);
  assert.match(html, /data-pretest-progress/);
  assert.match(html, /data-pretest-options/);
  assert.match(html, /assets\/js\/pretest-data\.js/);
  assert.match(html, /assets\/js\/test-runner\.js/);

  const data = readFileSync("assets/js/pretest-data.js", "utf8");
  assert.match(data, /window\.NUTRISPHERE_PRETEST_QUESTIONS/);
  assert.equal((data.match(/id:\s*"q\d+"/g) || []).length, 25, "should include 25 questions");
  for (const category of ["PSG", "GDDK", "MIPMG", "MAKRO"]) {
    assert.match(data, new RegExp(`category:\\s*"${category}"`), `should include ${category}`);
  }
  assert.match(data, /answer:\s*1/);
  assert.match(data, /answer:\s*3/);
});

test("supabase auth and score storage assets are wired without service keys", () => {
  for (const file of [
    "assets/js/supabase-config.js",
    "assets/js/auth.js",
    "assets/js/test-runner.js",
    "assets/js/dashboard-dosen.js",
    "supabase/schema.sql",
  ]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }

  const config = readFileSync("assets/js/supabase-config.js", "utf8");
  assert.match(config, /SUPABASE_URL/);
  assert.match(config, /SUPABASE_ANON_KEY/);
  assert.doesNotMatch(config, /service_role|SERVICE_ROLE/i);
  assert.match(config, /createClient/);

  const schema = readFileSync("supabase/schema.sql", "utf8");
  for (const marker of [
    "create table if not exists public.profiles",
    "create table if not exists public.test_attempts",
    "handle_new_user_profile",
    "on_auth_user_created_profile",
    "unique (user_id, test_type)",
    "enable row level security",
    "teacher",
    "student",
  ]) {
    assert.match(schema, new RegExp(marker.replace(/[()]/g, "\\$&"), "i"), `schema should include ${marker}`);
  }
  assert.doesNotMatch(schema, /service_role/i);
});

test("nutriquest and tracking schema implement competency data contracts", () => {
  const quest = readFileSync("nutriquest.html", "utf8");
  for (const marker of [
    'href="pretest.html"',
    'href="posttest.html"',
    'href="ar-patient.html"',
    'href="dashboard-dosen.html"',
    "Progress Kompetensi",
  ]) {
    assert.match(quest, new RegExp(marker.replace(/[()]/g, "\\$&")), `nutriquest should include ${marker}`);
  }

  const schema = readFileSync("supabase/schema.sql", "utf8");
  for (const marker of [
    "create table if not exists public.test_attempt_answers",
    "create table if not exists public.case_attempts",
    "create table if not exists public.learning_progress",
    "create table if not exists public.feature_events",
    "attempt_id",
    "question_id",
    "case_id",
    "module_id",
    "event_type",
    "metadata jsonb",
    "cases_completed",
    "modules_completed",
    "feature_events_count",
  ]) {
    assert.match(schema, new RegExp(marker.replace(/[()]/g, "\\$&"), "i"), `schema should include ${marker}`);
  }
  assert.match(schema, /enable row level security/i);
  assert.match(schema, /students can insert own case attempts/i);
  assert.match(schema, /students can insert own feature events/i);
});

test("frontend helpers persist detailed answers, case progress, and feature events", () => {
  assert.equal(existsSync("assets/js/tracking.js"), true, "tracking helper should exist");
  const authJs = readFileSync("assets/js/auth.js", "utf8");
  for (const helper of [
    "insertTestAttemptAnswers",
    "insertCaseAttempt",
    "upsertLearningProgress",
    "trackFeatureEvent",
  ]) {
    assert.match(authJs, new RegExp(helper), `auth helper should expose ${helper}`);
  }

  const runner = readFileSync("assets/js/test-runner.js", "utf8");
  assert.match(runner, /insertTestAttemptAnswers/);
  assert.match(runner, /question_id/);
  assert.match(runner, /selected_answer/);

  const arPatient = readFileSync("assets/js/ar-patient.js", "utf8");
  assert.match(arPatient, /insertCaseAttempt/);
  assert.match(arPatient, /case_attempt/);

  const aiSummary = readFileSync("assets/js/ai-summary.js", "utf8");
  assert.match(aiSummary, /trackFeatureEvent/);
  assert.match(aiSummary, /ai_summary/);
});

test("all main pages expose NutriQuest navigation and refreshed feature positioning", () => {
  for (const [file] of pages) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /href="nutriquest\.html"/, `${file} should link NutriQuest`);
  }

  const index = readFileSync("index.html", "utf8");
  for (const marker of ["NutriSolve", "NutriBase", "NutriPath", "NutriRead", "NutriQuest"]) {
    assert.match(index, new RegExp(`<h3>${marker}</h3>`), `landing should show ${marker}`);
  }
  for (const purpose of ["PRAKTIK", "REFERENSI", "MODUL", "LITERATUR", "EVALUASI"]) {
    assert.match(index, new RegExp(purpose), `landing should explain feature purpose ${purpose}`);
  }

  const nutripath = readFileSync("nutripath.html", "utf8");
  assert.doesNotMatch(nutripath, /Pre Test dan Post Test|Pretest, Materi, dan Posttest/i);
  assert.match(nutripath, /tidak melanggar kode etik/i);

  const nutribase = readFileSync("nutribase.html", "utf8");
  for (const category of ["TKPI", "DBMP", "AKG", "BPOM", "Foto Buku Makanan", "SSGI", "SKI", "Rumus Perhitungan Gizi"]) {
    assert.match(nutribase, new RegExp(category), `nutribase should include ${category}`);
  }
  assert.match(nutribase, /1M-YaaE_AXJlRoCriubhfrZG85Zu8Beji/);
});

test("pretest and posttest share question data and save official attempts to Supabase", () => {
  const pretest = readFileSync("pretest.html", "utf8");
  const posttest = readFileSync("posttest.html", "utf8");
  for (const html of [pretest, posttest]) {
    assert.match(html, /assets\/js\/supabase-config\.js/);
    assert.match(html, /assets\/js\/auth\.js/);
    assert.match(html, /assets\/js\/pretest-data\.js/);
    assert.match(html, /assets\/js\/test-runner\.js/);
  }
  assert.match(pretest, /data-test-type="pretest"/);
  assert.match(posttest, /data-test-type="posttest"/);

  const runner = readFileSync("assets/js/test-runner.js", "utf8");
  assert.match(runner, /test_attempts/);
  assert.match(runner, /test_type/);
  assert.match(runner, /percentage/);
  assert.match(runner, /completedAt|submitted_at/);
  assert.match(runner, /Test ini sudah pernah diselesaikan/);
  assert.doesNotMatch(runner, /localStorage\.setItem\("nutrisphere_pretest_v1_result"/);
});

test("login and dashboard implement static admin unlock flow", () => {
  const login = readFileSync("login.html", "utf8");
  assert.match(login, /data-login-form/);
  assert.match(login, /data-register-form/);
  assert.match(login, /data-admin-login-form/);
  assert.match(login, /data-auth-mode="student"/);
  assert.match(login, /data-auth-mode="admin"/);
  assert.match(login, /name="admin_password"/);
  assert.match(login, /name="full_name"/);
  assert.match(login, /name="nim"/);
  assert.match(login, /assets\/js\/auth\.js/);

  const dashboard = readFileSync("dashboard-dosen.html", "utf8");
  assert.match(dashboard, /data-dashboard-table/);
  assert.match(dashboard, /data-teacher-only/);
  assert.match(dashboard, /assets\/js\/dashboard-dosen\.js/);

  const dashboardJs = readFileSync("assets/js/dashboard-dosen.js", "utf8");
  const loginJs = readFileSync("assets/js/login.js", "utf8");
  const authJs = readFileSync("assets/js/auth.js", "utf8");
  assert.match(loginJs, /nutrisphere123/);
  assert.match(loginJs, /nutrisphere_admin_unlocked/);
  assert.match(loginJs, /dashboard-dosen\.html/);
  assert.match(dashboardJs, /nutrisphere_admin_unlocked/);
  assert.match(dashboardJs, /admin_dashboard_rows/);
  assert.match(dashboardJs, /function escapeHtml/);
  assert.doesNotMatch(dashboardJs, /requireTeacher/);
  assert.match(dashboardJs, /posttest.*pretest|pretest.*posttest/s);
  assert.match(authJs, /ensureStudentProfile/);
  assert.match(authJs, /data\?\.session/);
  assert.doesNotMatch(authJs, /\.upsert\(studentProfilePayload/);
});

test("student signup is optimized for no email confirmation flow", () => {
  const loginJs = readFileSync("assets/js/login.js", "utf8");
  const authJs = readFileSync("assets/js/auth.js", "utf8");

  assert.match(authJs, /autoSignInAfterSignup/);
  assert.match(authJs, /signInWithPassword\(\{\s*email,\s*password\s*\}\)/);
  assert.match(loginJs, /Akun berhasil dibuat dan langsung masuk/);
  assert.doesNotMatch(loginJs, /cek email sebelum login/i);
});

test("global account controls keep login, register, and logout reachable", () => {
  const login = readFileSync("login.html", "utf8");
  const loginJs = readFileSync("assets/js/login.js", "utf8");
  const mainJs = readFileSync("assets/js/main.js", "utf8");
  const authJs = readFileSync("assets/js/auth.js", "utf8");

  assert.match(login, /data-student-auth="login"/);
  assert.match(login, /data-student-auth="register"/);
  assert.match(login, /name="password_confirmation"/);
  assert.match(login, /data-toggle-password/);
  assert.match(loginJs, /Konfirmasi password belum sama/);
  assert.match(loginJs, /data-login-page-signout/);
  assert.match(mainJs, /data-global-signout/);
  assert.match(mainJs, /initGlobalAccountControl/);
  assert.match(authJs, /async function signOut/);
  assert.match(authJs, /nutrisphere_pretest_v1_completed/);
});

test("static admin RPC and optional posttest contract are documented in code", () => {
  const schema = readFileSync("supabase/schema.sql", "utf8");
  assert.match(schema, /create or replace function public\.admin_dashboard_rows/);
  assert.match(schema, /admin_password text/);
  assert.match(schema, /nutrisphere123/);
  assert.match(schema, /security definer/i);
  assert.match(schema, /pretest_score/);
  assert.match(schema, /posttest_score/);

  const runner = readFileSync("assets/js/test-runner.js", "utf8");
  assert.match(runner, /testType === "posttest"/);
  assert.match(runner, /hasCompletedAttempt\(user\.id, "pretest"\)/);
  assert.match(runner, /Selesaikan pretest dulu sebelum posttest/);

  const gate = readFileSync("assets/js/pretest-gate.js", "utf8");
  assert.doesNotMatch(gate, /hasCompletedAttempt\(user\.id,\s*"posttest"\)/, "posttest should not be a global feature gate");
  assert.doesNotMatch(gate, /nutrisphere_posttest/i, "posttest should not have a global gate cache key");
});

test("auth gate protects feature pages while leaving landing and auth pages open", () => {
  const gate = readFileSync("assets/js/pretest-gate.js", "utf8");
  assert.match(gate, /nutrisphere_pretest_v1_completed/);
  assert.match(gate, /getCurrentUser/);
  assert.match(gate, /login\.html/);
  assert.match(gate, /pretest\.html/);
  assert.match(gate, /pretest-gate-overlay/);
  assert.match(gate, /Untuk buka fitur, kamu harus pretest dulu/);

  const index = readFileSync("index.html", "utf8");
  assert.match(index, /href="pretest\.html"/);
  assert.match(index, /Mulai Pretest/);
  assert.match(index, /assets\/js\/pretest-gate\.js/);

  for (const [file] of pages) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /assets\/js\/supabase-config\.js/, `${file} should load Supabase config`);
    assert.match(html, /assets\/js\/auth\.js/, `${file} should load auth helper`);
    assert.match(html, /assets\/js\/pretest-gate\.js/, `${file} should load auth/pretest gate`);
  }
});

test("legacy html files do not expose stale NutriHub design", () => {
  const htmlFiles = readdirSync(".").filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    assert.doesNotMatch(html, /NutriHub/, `${file} should not mention NutriHub`);
  }
  assert.match(readFileSync("klinis.html", "utf8"), /clinical\.html/);
});

test("modern UI uses desktop sidebar, richer palette, and concise copy", () => {
  const css = readFileSync("assets/css/styles.css", "utf8");
  assert.match(css, /\.site-header\s*{[^}]*position:\s*fixed/s);
  assert.match(css, /width:\s*248px/);
  assert.match(css, /linear-gradient/);
  assert.match(css, /--indigo:/);
  assert.match(css, /--rose:/);

  for (const [file] of pages) {
    const html = readFileSync(file, "utf8");
    const paragraphs = [...html.matchAll(/<p(?: class="[^"]*")?>(.*?)<\/p>/g)].map((match) =>
      match[1].replace(/<[^>]*>/g, "").trim()
    );
    for (const paragraph of paragraphs) {
      assert.ok(paragraph.length <= 190, `${file} has overly long copy: ${paragraph}`);
    }
  }
});

test("hero hierarchy is lighter and cards expose engaging icon hooks", () => {
  const css = readFileSync("assets/css/styles.css", "utf8");
  const index = readFileSync("index.html", "utf8");
  const allHtml = pages.map(([file]) => readFileSync(file, "utf8")).join("\n");

  assert.match(index, /<h1>Belajar gizi dari data hingga/);
  assert.match(index, /class="[^"]*landing-hero[^"]*"/);
  assert.doesNotMatch(index, /<h1>[^<]*untuk belajar/i);
  assert.match(css, /\.hero-subtitle/);
  assert.match(css, /\.page-hero h1\s*{[^}]*clamp\(28px,\s*4vw,\s*48px\)/s);
  assert.match(css, /\.card\[data-icon\]::before/);
  assert.match(css, /\.card:hover\[data-icon\]::before|\.card\[data-icon\]:hover::before/);
  assert.ok((allHtml.match(/data-icon="/g) || []).length >= 16);
});

test("sidebar exposes NutriSolve sub navigation", () => {
  const css = readFileSync("assets/css/styles.css", "utf8");
  const featurePages = pages.filter(([file]) => !["login.html", "pretest.html", "posttest.html", "dashboard-dosen.html"].includes(file));
  const allHtml = featurePages.map(([file]) => readFileSync(file, "utf8")).join("\n");

  assert.ok((allHtml.match(/class="nav-group/g) || []).length >= featurePages.length);
  assert.ok((allHtml.match(/class="nav-sub-links/g) || []).length >= featurePages.length);
  for (const marker of ["Anthro", "Clinical", "Dietary", "AR Patient"]) {
    assert.match(allHtml, new RegExp(`>${marker}<`));
  }
  assert.match(readFileSync("antropometri.html", "utf8"), /href="antropometri\.html" class="active"|class="active" href="antropometri\.html"/);
  assert.match(css, /\.nav-sub-links\s*{/);
  assert.match(css, /\.nav-sub-links a\.active/);
});

test("anthropometry DSS exposes four assessment modes and calculator hooks", () => {
  const html = readFileSync("antropometri.html", "utf8");
  const js = readFileSync("assets/js/main.js", "utf8");
  const css = readFileSync("assets/css/styles.css", "utf8");

  for (const marker of [
    "Balita/Bayi",
    "Remaja",
    "Dewasa-Lansia",
    "Pasien Rumah Sakit",
    "WHO Anthro",
    "AnthroPLUS",
    "BB/U",
    "IMT/U",
    "TB/U",
    "PB/U",
    "BB/TB",
    "LIKA/U",
    "LILA/U",
    "Waist/Hip Ratio",
    "Skinfold",
    "Chumlea",
    "Bassey",
  ]) {
    assert.match(html, new RegExp(marker.replace("/", "\\/")), `anthropometry should include ${marker}`);
  }

  assert.ok((html.match(/data-anthro-tab="/g) || []).length === 4);
  assert.ok((html.match(/data-child-indicator="/g) || []).length >= 7);
  assert.ok((html.match(/data-teen-indicator="/g) || []).length >= 3);
  assert.match(js, /function classifyZScore/);
  assert.match(js, /function calculateAdultAnthro/);
  assert.match(js, /function calculateHospitalAnthro/);
  assert.match(css, /\.anthro-status\.normal/);
  assert.match(css, /\.anthro-status\.severe/);
});

test("anthropometry layout is vertical with deeper interpretation text", () => {
  const css = readFileSync("assets/css/styles.css", "utf8");
  const js = readFileSync("assets/js/main.js", "utf8");

  assert.match(css, /\.anthro-panel\s+\.grid\.two\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /\.anthro-steps\s*{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(js, /interpretation:/);
  assert.match(js, /nextStep:/);
  assert.match(js, /Fokus interpretasi/);
  assert.match(js, /Tindak lanjut/);
});

test("anthropometry guide cards use readable polished step layout", () => {
  const html = readFileSync("antropometri.html", "utf8");
  const css = readFileSync("assets/css/styles.css", "utf8");

  assert.ok((html.match(/class="anthro-step-card"/g) || []).length >= 6);
  assert.match(html, /class="anthro-step-action"/);
  assert.match(css, /\.anthro-step-card\s*{[^}]*grid-template-columns:\s*44px 1fr/s);
  assert.match(css, /\.anthro-step-card p\s*{[^}]*font-size:\s*14px/s);
  assert.match(css, /\.anthro-step-action\s*{[^}]*border-radius:\s*999px/s);
  assert.doesNotMatch(css, /\.anthro-steps div\s*{/);
});

test("anthropometry page uses functional visual guidance instead of decorative hero card", () => {
  const html = readFileSync("antropometri.html", "utf8");
  const css = readFileSync("assets/css/styles.css", "utf8");

  for (const marker of [
    'class="anthro-page"',
    "anthro-workspace",
    'class="anthro-visual-board"',
    'class="body-map"',
    'class="visual-chip"',
    'class="indicator-icon"',
  ]) {
    assert.match(html, new RegExp(marker), `anthropometry should include ${marker}`);
  }

  assert.doesNotMatch(html, /anthro-hero-card/);
  assert.match(css, /\.anthro-page\s*{/);
  assert.match(css, /\.anthro-visual-board\s*{[^}]*grid-template-columns/s);
  assert.match(css, /\.body-map\s*{[^}]*border-radius:\s*32px/s);
  assert.match(css, /\.visual-chip\s*{[^}]*border-radius:\s*999px/s);
  assert.match(css, /\.indicator-icon\s*{/);
  assert.match(css, /\.anthro-workspace\s*{[^}]*border-radius:\s*34px/s);
  assert.match(css, /\.anthro-mode\.active\s*{[^}]*#5b86e5/s);
});
