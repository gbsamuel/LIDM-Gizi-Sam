import { readFileSync, existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pages = [
  ["index.html", ["NUTRIVERSE", "NutriSolve", "NutriBase", "NutriPath", "NutriRead"]],
  ["login.html", ["Login NutriVerse", "Daftar Mahasiswa", "Email", "NIM"]],
  ["pretest.html", ["Pretest NutriVerse", "Baseline Awal", "data-test-type=\"pretest\""]],
  ["posttest.html", ["Posttest NutriVerse", "Evaluasi Akhir", "data-test-type=\"posttest\""]],
  ["dashboard-dosen.html", ["Dashboard Dosen", "Rekap Nilai", "Peningkatan"]],
  ["nutrisolve.html", ["Decision Support System", "Anthropometry", "Clinical", "Dietary"]],
  ["antropometri.html", ["Anthropometry Assessment", "Tabel Interpretasi", "Simulasi DSS"]],
  ["clinical.html", ["Clinical Nutrition Screening", "Scan Visual", "Simulasi AI"]],
  ["dietary.html", ["Dietary Pattern Assessment", "Ringkasan Pola Makan", "Simulasi"]],
  ["nutribase.html", ["TKPI", "DBMP", "AKG", "BPOM", "Foto Buku Makanan", "Rumus Perhitungan Gizi"]],
  ["nutripath.html", ["Modul Siswa SMA", "Modul Mahasiswa Gizi", "10 Tahapan Modul"]],
  ["nutriread.html", ["Jurnal", "E-Book", "AI Summary"]],
  ["ar-patient.html", ["AR Patient Visualization", "Detail Data Pasien", "AI CLINICAL SUPERVISOR"]],
  ["ai_summary.html", ["AI Summary", "Masukkan Teks Jurnal", "Summarize Jurnal"]],
  ["journal_ebook.html", ["Jurnal", "E-Book", "Kumpulan referensi"]],
];

test("planned static pages exist with NutriVerse content markers", () => {
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
  assert.match(html, /Pretest NutriVerse/);
  assert.match(html, /data-pretest-progress/);
  assert.match(html, /data-pretest-options/);
  assert.match(html, /assets\/js\/pretest-data\.js/);
  assert.match(html, /assets\/js\/test-runner\.js/);

  const data = readFileSync("assets/js/pretest-data.js", "utf8");
  assert.match(data, /window\.NUTRIVERSE_PRETEST_QUESTIONS/);
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
    "unique (user_id, test_type)",
    "enable row level security",
    "teacher",
    "student",
  ]) {
    assert.match(schema, new RegExp(marker.replace(/[()]/g, "\\$&"), "i"), `schema should include ${marker}`);
  }
  assert.doesNotMatch(schema, /service_role/i);
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
  assert.doesNotMatch(runner, /localStorage\.setItem\("nutriverse_pretest_v1_result"/);
});

test("login and teacher dashboard implement the role-based v1 flow", () => {
  const login = readFileSync("login.html", "utf8");
  assert.match(login, /data-login-form/);
  assert.match(login, /data-register-form/);
  assert.match(login, /name="full_name"/);
  assert.match(login, /name="nim"/);
  assert.match(login, /assets\/js\/auth\.js/);

  const dashboard = readFileSync("dashboard-dosen.html", "utf8");
  assert.match(dashboard, /data-dashboard-table/);
  assert.match(dashboard, /data-teacher-only/);
  assert.match(dashboard, /assets\/js\/dashboard-dosen\.js/);

  const dashboardJs = readFileSync("assets/js/dashboard-dosen.js", "utf8");
  assert.match(dashboardJs, /requireTeacher/);
  assert.match(dashboardJs, /profiles/);
  assert.match(dashboardJs, /test_attempts/);
  assert.match(dashboardJs, /posttest.*pretest|pretest.*posttest/s);
});

test("auth gate protects feature pages while leaving landing and auth pages open", () => {
  const gate = readFileSync("assets/js/pretest-gate.js", "utf8");
  assert.match(gate, /nutriverse_pretest_v1_completed/);
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

  assert.match(index, /<h1>NUTRIVERSE<\/h1>/);
  assert.match(index, /class="hero-subtitle"/);
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
