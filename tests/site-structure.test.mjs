import { readFileSync, existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pages = [
  ["index.html", ["NUTRIVERSE", "NutriSolve", "NutriBase", "NutriPath", "NutriRead"]],
  ["nutrisolve.html", ["Decision Support System", "Anthropometry", "Clinical", "Dietary"]],
  ["antropometri.html", ["Anthropometry Assessment", "Tabel Interpretasi", "Simulasi DSS"]],
  ["clinical.html", ["Clinical Nutrition Screening", "Scan Visual", "Simulasi Pembelajaran"]],
  ["dietary.html", ["Dietary Pattern Assessment", "Ringkasan Pola Makan", "Simulasi"]],
  ["nutribase.html", ["TKPI", "DBMP", "AKG", "BPOM", "Foto Buku Makanan", "Rumus Perhitungan Gizi"]],
  ["nutripath.html", ["Modul Siswa SMA", "Modul Mahasiswa Gizi", "10 Tahapan Modul"]],
  ["nutriread.html", ["Jurnal", "E-Book", "AI Summary"]],
  ["ar-patient.html", ["AR Patient Visualization", "Biometrik Telemetri Pasien", "Validasi Konseling AI"]],
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
  assert.doesNotMatch(allHtml, /getUserMedia|fetch\(|localStorage|login|Masuk/i);
  assert.match(allHtml, /placeholder|simulasi/i);
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
  const allHtml = pages.map(([file]) => readFileSync(file, "utf8")).join("\n");

  assert.ok((allHtml.match(/class="nav-group/g) || []).length >= pages.length);
  assert.ok((allHtml.match(/class="nav-sub-links/g) || []).length >= pages.length);
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
